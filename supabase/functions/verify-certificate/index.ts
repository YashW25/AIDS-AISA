import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const certificateNumber = url.searchParams.get('cert_number');

    if (!certificateNumber) {
      return new Response(
        JSON.stringify({ error: 'Certificate number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verifying certificate:', certificateNumber);

    // Fetch certificate with related data
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        *,
        events (title, event_date, club_id)
      `)
      .eq('certificate_number', certificateNumber)
      .single();

    if (error || !certificate) {
      console.log('Certificate not found:', error);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Certificate not found' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user profile
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('full_name, enrollment_number, college')
      .eq('user_id', certificate.user_id)
      .single();

    // Fetch club details
    let club = null;
    if (certificate.events?.club_id) {
      const { data: clubData } = await supabase
        .from('clubs')
        .select('name, full_name, college_name')
        .eq('id', certificate.events.club_id)
        .single();
      club = clubData;
    }

    const response = {
      valid: true,
      certificate: {
        certificate_number: certificate.certificate_number,
        certificate_type: certificate.certificate_type,
        rank: certificate.rank,
        issued_at: certificate.issued_at,
        certificate_url: certificate.certificate_url,
      },
      participant: {
        name: userProfile?.full_name || 'Unknown',
        enrollment: userProfile?.enrollment_number,
        college: userProfile?.college,
      },
      event: {
        title: certificate.events?.title,
        date: certificate.events?.event_date,
      },
      issuer: {
        club_name: club?.name,
        club_full_name: club?.full_name,
        college_name: club?.college_name,
      }
    };

    console.log('Certificate verified successfully:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error verifying certificate:', error);
    return new Response(
      JSON.stringify({ valid: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
