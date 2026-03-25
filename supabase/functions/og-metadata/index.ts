import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get("domain") || "";
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find club by domain (primary or staging)
    let club = null;
    
    if (domain) {
      // Try primary domain first
      const { data: primaryClub } = await supabase
        .from("clubs")
        .select("*")
        .eq("primary_domain", domain)
        .eq("is_active", true)
        .maybeSingle();
      
      if (primaryClub) {
        club = primaryClub;
      } else {
        // Try staging domain
        const { data: stagingClub } = await supabase
          .from("clubs")
          .select("*")
          .eq("staging_domain", domain)
          .eq("is_active", true)
          .maybeSingle();
        
        if (stagingClub) {
          club = stagingClub;
        } else {
          // Try matching by slug in subdomain (e.g., AISA-isbmcoe from AISA-isbmcoe.netlify.app)
          const subdomain = domain.split(".")[0];
          const { data: slugClub } = await supabase
            .from("clubs")
            .select("*")
            .eq("slug", subdomain)
            .eq("is_active", true)
            .maybeSingle();
          
          club = slugClub;
        }
      }
    }

    // Default fallback if no club found
    if (!club) {
      const { data: defaultClub } = await supabase
        .from("clubs")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      
      club = defaultClub;
    }

    const clubName = club?.name || "Club";
    const clubFullName = club?.full_name || "Student Club";
    const collegeName = club?.college_name || "College";
    const tagline = club?.tagline || "Empowering future leaders through innovation and excellence";
    const logoUrl = club?.logo_url || "";
    const clubDomain = club?.primary_domain || club?.staging_domain || domain;

    const metadata = {
      title: `${clubName} - ${clubFullName} | ${collegeName}`,
      description: tagline,
      image: logoUrl,
      url: `https://${clubDomain}`,
      siteName: `${clubName} - ${collegeName}`,
      clubName,
      clubFullName,
      collegeName,
    };

    return new Response(JSON.stringify(metadata), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error fetching metadata:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
