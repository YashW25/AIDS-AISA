import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';
import QRCode from 'https://esm.sh/qrcode@1.5.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      user_id, 
      event_id, 
      template_id, 
      certificate_type, 
      rank,
      club_id
    } = await req.json();

    console.log('Generating certificate for:', { user_id, event_id, template_id, certificate_type, rank });

    // Fetch user profile
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('full_name, enrollment_number')
      .eq('user_id', user_id)
      .single();

    if (userError || !userProfile) {
      console.error('User profile error:', userError);
      throw new Error('User profile not found');
    }

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, event_date')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      console.error('Event error:', eventError);
      throw new Error('Event not found');
    }

    // Fetch template
    const { data: template, error: templateError } = await supabase
      .from('certificate_templates')
      .select('*')
      .eq('id', template_id)
      .single();

    if (templateError || !template) {
      console.error('Template error:', templateError);
      throw new Error('Certificate template not found');
    }

    // Fetch club details for branding
    const { data: club } = await supabase
      .from('clubs')
      .select('name, full_name, primary_domain')
      .eq('id', club_id)
      .single();

    // Generate unique certificate number
    const certNumber = `CERT-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
    
    // Create verification URL
    const verificationUrl = club?.primary_domain 
      ? `https://${club.primary_domain}/certificates?verify=${certNumber}`
      : `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/certificates?verify=${certNumber}`;

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Fetch template image
    const templateImageBytes = await fetch(template.template_url).then(res => res.arrayBuffer());
    
    // Embed the template image
    let templateImage;
    if (template.template_url.toLowerCase().includes('.png')) {
      templateImage = await pdfDoc.embedPng(templateImageBytes);
    } else {
      templateImage = await pdfDoc.embedJpg(templateImageBytes);
    }

    // Get template dimensions and create page
    const { width, height } = templateImage.scale(1);
    const page = pdfDoc.addPage([width, height]);

    // Draw template as background
    page.drawImage(templateImage, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });

    // Embed fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Parse font color
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      } : { r: 0, g: 0, b: 0 };
    };

    const fontColor = hexToRgb(template.font_color || '#000000');
    const textColor = rgb(fontColor.r, fontColor.g, fontColor.b);

    // Calculate positions (percentages to pixels)
    const nameX = (template.name_position_x / 100) * width;
    const nameY = height - (template.name_position_y / 100) * height;
    const dateX = (template.date_position_x / 100) * width;
    const dateY = height - (template.date_position_y / 100) * height;
    const certNumX = (template.cert_number_position_x / 100) * width;
    const certNumY = height - (template.cert_number_position_y / 100) * height;
    const rankX = (template.rank_position_x / 100) * width;
    const rankY = height - (template.rank_position_y / 100) * height;
    const qrX = (template.qr_position_x / 100) * width;
    const qrY = height - (template.qr_position_y / 100) * height;

    // Draw participant name (centered)
    const fontSize = template.font_size || 24;
    const nameWidth = boldFont.widthOfTextAtSize(userProfile.full_name, fontSize);
    page.drawText(userProfile.full_name, {
      x: nameX - nameWidth / 2,
      y: nameY,
      size: fontSize,
      font: boldFont,
      color: textColor,
    });

    // Draw rank/achievement if provided
    if (rank && certificate_type !== 'participation') {
      const rankText = getRankText(certificate_type, rank);
      const rankWidth = boldFont.widthOfTextAtSize(rankText, fontSize - 4);
      page.drawText(rankText, {
        x: rankX - rankWidth / 2,
        y: rankY,
        size: fontSize - 4,
        font: boldFont,
        color: textColor,
      });
    }

    // Draw event title and date
    const eventDate = new Date(event.event_date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const eventInfo = `${event.title} | ${eventDate}`;
    const eventWidth = regularFont.widthOfTextAtSize(eventInfo, fontSize - 8);
    page.drawText(eventInfo, {
      x: dateX - eventWidth / 2,
      y: dateY,
      size: fontSize - 8,
      font: regularFont,
      color: textColor,
    });

    // Draw certificate number
    const certNumText = `Certificate No: ${certNumber}`;
    page.drawText(certNumText, {
      x: certNumX,
      y: certNumY,
      size: 10,
      font: regularFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Generate and embed QR code
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, { 
      width: 100,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    });
    const qrImageBytes = Uint8Array.from(atob(qrDataUrl.split(',')[1]), c => c.charCodeAt(0));
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    
    page.drawImage(qrImage, {
      x: qrX,
      y: qrY - 50,
      width: 80,
      height: 80,
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));

    // Upload PDF to storage
    const fileName = `certificates/${club_id}/${event_id}/${certNumber}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload certificate');
    }

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('images')
      .getPublicUrl(fileName);

    const certificateUrl = urlData.publicUrl;

    // Insert certificate record
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .insert({
        user_id,
        event_id,
        template_id,
        certificate_type,
        certificate_number: certNumber,
        certificate_url: certificateUrl,
        rank,
      })
      .select()
      .single();

    if (certError) {
      // Handle duplicate
      if (certError.message?.includes('unique') || certError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Certificate already exists for this user and event' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('Certificate insert error:', certError);
      throw new Error('Failed to save certificate');
    }

    console.log('Certificate generated successfully:', certificate);

    return new Response(
      JSON.stringify({ 
        success: true, 
        certificate,
        certificateUrl,
        certificateNumber: certNumber,
        pdfBase64, // For immediate download
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating certificate:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getRankText(type: string, rank: string): string {
  switch (type) {
    case 'winner':
      return rank === '1' ? '1st Place Winner' : `${rank}${getOrdinalSuffix(rank)} Place Winner`;
    case 'runner_up':
      return '2nd Place - Runner Up';
    case 'special':
      return rank || 'Special Recognition';
    default:
      return 'Participant';
  }
}

function getOrdinalSuffix(n: string): string {
  const num = parseInt(n);
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
