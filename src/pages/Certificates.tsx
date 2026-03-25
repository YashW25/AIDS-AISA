import { MainLayout } from '@/components/layout/MainLayout';
import { useSiteSettings } from '@/hooks/useSiteData';
import { useClub } from '@/contexts/ClubContext';
import { Award, Search, Download, CheckCircle, Loader2, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { generateBreadcrumbSchema } from '@/lib/seo';

interface VerificationResult {
  valid: boolean;
  error?: string;
  certificate?: {
    certificate_number: string;
    certificate_type: string;
    rank: string | null;
    issued_at: string;
    certificate_url: string | null;
  };
  participant?: {
    name: string;
    enrollment: string;
    college: string;
  };
  event?: {
    title: string;
    date: string;
  };
  issuer?: {
    club_name: string;
    club_full_name: string;
    college_name: string;
  };
}

const Certificates = () => {
  const { data: settings } = useSiteSettings();
  const { club } = useClub();
  const [searchParams] = useSearchParams();
  const [certificateId, setCertificateId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    const verifyParam = searchParams.get('verify');
    if (verifyParam) {
      setCertificateId(verifyParam);
      verifyCertificate(verifyParam);
    }
  }, [searchParams]);

  const verifyCertificate = async (certNumber: string) => {
    if (!certNumber.trim()) return;
    setIsSearching(true);
    setVerificationResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('verify-certificate', {
        body: null,
        headers: {},
      });
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-certificate?cert_number=${encodeURIComponent(certNumber)}`,
        { headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      const result = await response.json();
      setVerificationResult(result);
    } catch (error: any) {
      setVerificationResult({ valid: false, error: 'Failed to verify certificate' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => verifyCertificate(certificateId);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Certificates', item: '/certificates' },
  ]);

  return (
    <MainLayout
      title="Certificates"
      description="Verify and download your certificates from AISA Club events at AI&DS Department, Pune. Instant digital certificate verification system."
      keywords="Certificate Verification ISBM, AISA Club Certificate Download, Digital Certificate Pune, Event Certificate Verification, Engineering College Certificates"
      schema={breadcrumbSchema}
    >
      {/* Hero Section */}
      <section className="py-20 gradient-hero">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Certificate Verification
            </h1>
            <div className="w-16 h-1 bg-primary mx-auto mb-6" />
            <p className="text-lg text-white/80">
              Verify and download your certificates from {settings?.club_name || 'AISA Club'} events
            </p>
          </div>
        </div>
      </section>

      {/* Certificate Search */}
      <section className="py-16 bg-background">
        <div className="container max-w-2xl">
          <div className="p-8 rounded-2xl bg-card border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Verify Your Certificate
            </h2>
            <div className="flex gap-3">
              <Input
                placeholder="Enter Certificate ID (e.g., CERT-2025-XXXXXXXX)"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                className="flex-1 border-primary/20 focus:border-primary"
              />
              <Button onClick={handleSearch} disabled={isSearching} className="gap-2 bg-primary hover:bg-primary/90">
                <Search className="h-4 w-4" />
                {isSearching ? 'Searching...' : 'Verify'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Enter your certificate ID to verify authenticity and download your certificate.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6">
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Instant Verification</h3>
              <p className="text-sm text-muted-foreground">Verify certificate authenticity in seconds</p>
            </div>
            <div className="text-center p-6">
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Easy Download</h3>
              <p className="text-sm text-muted-foreground">Download your certificates anytime</p>
            </div>
            <div className="text-center p-6">
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Digital Credentials</h3>
              <p className="text-sm text-muted-foreground">Share your achievements online</p>
            </div>
          </div>

          <div className="mt-12 p-6 rounded-xl bg-muted/30 border border-border/50 text-center">
            <p className="text-muted-foreground">
              Can't find your certificate? Contact us at{' '}
              <a href={`mailto:${settings?.email || 'AISA@isbm.ac.in'}`} className="text-primary hover:underline">
                {settings?.email || 'AISA@isbm.ac.in'}
              </a>
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Certificates;
