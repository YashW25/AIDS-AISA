import { MainLayout } from '@/components/layout/MainLayout';
import { useSiteSettings } from '@/hooks/useSiteData';
import { Award, Search, Download, CheckCircle, Loader2, XCircle, Shield, Calendar, Building2, Trophy, User, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { generateBreadcrumbSchema } from '@/lib/seo';
import { renderCertificate, downloadBlob } from '@/lib/certificateUtils';
import type { FieldDef } from '@/lib/certificateUtils';

interface VerifiedCert {
  certificate_id: string;
  full_name: string;
  event_name: string;
  event_date: string;
  college: string;
  project_title: string;
  position: string;
  team_id: string;
  email: string;
  extra_fields: Record<string, string>;
  issued_at: string;
  template?: {
    template_url: string;
    fields: FieldDef[];
    issued_by: string;
  } | null;
}

const Certificates = () => {
  const { data: settings } = useSiteSettings();
  const [searchParams] = useSearchParams();
  const [certificateId, setCertificateId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{ found: true; cert: VerifiedCert } | { found: false; error: string } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const verifyParam = searchParams.get('verify');
    if (verifyParam) {
      setCertificateId(verifyParam);
      verifyCertificate(verifyParam);
    }
  }, [searchParams]);

  const verifyCertificate = async (certId: string) => {
    const id = certId.trim();
    if (!id) return;
    setIsSearching(true);
    setResult(null);
    try {
      const { data, error } = await (supabase as any)
        .from('cert_issuances')
        .select('*, cert_templates(template_url, fields, issued_by)')
        .eq('certificate_id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setResult({ found: false, error: 'No certificate found with this ID. Please check and try again.' });
        return;
      }

      const { cert_templates, ...rest } = data;
      setResult({
        found: true,
        cert: {
          ...rest,
          extra_fields: rest.extra_fields || {},
          template: cert_templates
            ? {
                ...cert_templates,
                fields: Array.isArray(cert_templates.fields)
                  ? cert_templates.fields
                  : JSON.parse(cert_templates.fields || '[]'),
              }
            : null,
        },
      });
    } catch (e: any) {
      setResult({ found: false, error: `Verification failed: ${e.message}` });
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.found) return;
    const { cert } = result;
    if (!cert.template) return;

    setDownloading(true);
    try {
      const data: Record<string, string> = {
        full_name: cert.full_name,
        event_name: cert.event_name,
        event_date: cert.event_date,
        certificate_id: cert.certificate_id,
        college: cert.college,
        project_title: cert.project_title,
        position: cert.position,
        team_id: cert.team_id,
        email: cert.email,
        issued_by: cert.template.issued_by || settings?.club_full_name || 'AISA Club',
        ...cert.extra_fields,
      };
      const blob = await renderCertificate(cert.template.template_url, cert.template.fields, data);
      downloadBlob(blob, `certificate-${cert.certificate_id}.png`);
    } catch {
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleSearch = () => verifyCertificate(certificateId);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Certificates', item: '/certificates' },
  ]);

  const cert = result?.found ? result.cert : null;

  return (
    <MainLayout
      title="Certificate Verification"
      description="Verify and download your certificates from AISA Club events at ISBM College of Engineering, Pune."
      keywords="Certificate Verification ISBM, AISA Club Certificate Download, Digital Certificate Pune"
      schema={breadcrumbSchema}
    >
      {/* Hero */}
      <section className="py-20 gradient-hero">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Certificate Verification
            </h1>
            <div className="w-16 h-1 bg-primary mx-auto mb-6" />
            <p className="text-lg text-white/80">
              Verify and download your certificates from {settings?.club_name || 'AISA Club'} events
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-14 bg-background">
        <div className="container max-w-2xl">
          <div className="p-8 rounded-2xl bg-card border border-primary/20 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6 text-center">Enter Your Certificate ID</h2>
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                data-testid="input-certificate-id"
                placeholder="e.g., AISA-2025-0001"
                value={certificateId}
                onChange={e => setCertificateId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button
                data-testid="button-verify"
                onClick={handleSearch}
                disabled={isSearching || !certificateId.trim()}
                className="gap-2"
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {isSearching ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="mt-8">
              {!result.found ? (
                <div className="p-6 rounded-2xl bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-200">Certificate Not Found</h3>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">{result.error}</p>
                    </div>
                  </div>
                </div>
              ) : cert ? (
                <div className="space-y-6" data-testid="cert-result">
                  {/* Valid banner */}
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900 flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-200">Certificate Verified</p>
                      <p className="text-sm text-green-700 dark:text-green-300">This is a valid and authentic certificate.</p>
                    </div>
                    <Badge className="ml-auto bg-green-600 text-white">Authentic</Badge>
                  </div>

                  {/* Certificate preview (if template exists) */}
                  {cert.template && (
                    <div className="rounded-xl overflow-hidden border shadow-md">
                      <CertificatePreview cert={cert} />
                    </div>
                  )}

                  {/* Details card */}
                  <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                    <h3 className="font-bold text-lg text-foreground">Certificate Details</h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <DetailRow icon={<Hash className="h-4 w-4" />} label="Certificate ID" value={cert.certificate_id} mono />
                      <DetailRow icon={<User className="h-4 w-4" />} label="Issued To" value={cert.full_name} />
                      <DetailRow icon={<Award className="h-4 w-4" />} label="Event" value={cert.event_name} />
                      {cert.event_date && <DetailRow icon={<Calendar className="h-4 w-4" />} label="Event Date" value={cert.event_date} />}
                      {cert.college && <DetailRow icon={<Building2 className="h-4 w-4" />} label="College" value={cert.college} />}
                      {cert.project_title && <DetailRow icon={<Award className="h-4 w-4" />} label="Project" value={cert.project_title} />}
                      {cert.position && <DetailRow icon={<Trophy className="h-4 w-4" />} label="Position" value={cert.position} />}
                      {cert.team_id && <DetailRow icon={<User className="h-4 w-4" />} label="Team ID" value={cert.team_id} />}
                      <DetailRow icon={<Shield className="h-4 w-4" />} label="Issued By" value={cert.template?.issued_by || settings?.club_full_name || 'AISA Club'} />
                      <DetailRow icon={<Calendar className="h-4 w-4" />} label="Issue Date" value={format(new Date(cert.issued_at), 'PPP')} />
                    </div>

                    {/* Extra fields from CSV */}
                    {Object.entries(cert.extra_fields).filter(([, v]) => v).length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Additional Details</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {Object.entries(cert.extra_fields).filter(([, v]) => v).map(([k, v]) => (
                            <DetailRow key={k} icon={<Award className="h-4 w-4" />} label={k} value={String(v)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Download */}
                  {cert.template && (
                    <Button
                      data-testid="button-download"
                      size="lg"
                      className="w-full gap-2"
                      onClick={handleDownload}
                      disabled={downloading}
                    >
                      {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                      {downloading ? 'Generating Certificate...' : 'Download Certificate (PNG)'}
                    </Button>
                  )}

                  {/* Verification link */}
                  <p className="text-center text-xs text-muted-foreground">
                    Verify this certificate at:{' '}
                    <span className="font-mono text-primary">
                      {window.location.origin}/certificates?verify={cert.certificate_id}
                    </span>
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Features */}
          {!result && (
            <div className="grid sm:grid-cols-3 gap-6 mt-12">
              <FeatureCard icon={<CheckCircle className="h-8 w-8 text-primary" />} title="Instant Verification" desc="Verify certificate authenticity in seconds" />
              <FeatureCard icon={<Download className="h-8 w-8 text-primary" />} title="Easy Download" desc="Download your certificate as a PNG image" />
              <FeatureCard icon={<Shield className="h-8 w-8 text-primary" />} title="Tamper-Proof" desc="Each certificate has a unique verifiable ID" />
            </div>
          )}

          <div className="mt-10 p-5 rounded-xl bg-muted/30 border border-border/50 text-center">
            <p className="text-muted-foreground text-sm">
              Can't find your certificate? Contact us at{' '}
              <a href={`mailto:${settings?.email || 'aisaclub@isbmcoe.org'}`} className="text-primary hover:underline">
                {settings?.email || 'aisaclub@isbmcoe.org'}
              </a>
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-primary/60 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium text-foreground ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="text-center p-6">
      <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">{icon}</div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function CertificatePreview({ cert }: { cert: VerifiedCert }) {
  if (!cert.template) return null;
  const data: Record<string, string> = {
    full_name: cert.full_name,
    event_name: cert.event_name,
    event_date: cert.event_date,
    certificate_id: cert.certificate_id,
    college: cert.college,
    project_title: cert.project_title,
    position: cert.position,
    team_id: cert.team_id,
    email: cert.email,
    issued_by: cert.template.issued_by,
    ...cert.extra_fields,
  };

  return (
    <div className="relative inline-block w-full bg-muted">
      <img src={cert.template.template_url} alt="Certificate" className="w-full h-auto block" />
      {cert.template.fields.map((field, i) => {
        const value = data[field.key];
        if (!value) return null;
        return (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${field.x}%`,
              top: `${field.y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${Math.max(6, field.fontSize * 0.38)}px`,
              color: field.fontColor,
              fontWeight: field.fontWeight,
              fontStyle: field.fontStyle,
              fontFamily: field.fontFamily,
              textAlign: field.align,
              whiteSpace: 'nowrap',
            }}
          >
            {value}
          </div>
        );
      })}
    </div>
  );
}

export default Certificates;
