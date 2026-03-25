import { MainLayout } from '@/components/layout/MainLayout';
import { usePartners, useSiteSettings } from '@/hooks/useSiteData';
import { Skeleton } from '@/components/ui/skeleton';
import { Handshake } from 'lucide-react';
import { generateBreadcrumbSchema } from '@/lib/seo';

const Partners = () => {
  const { data: settings } = useSiteSettings();
  const { data: partners, isLoading } = usePartners();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Partners', item: '/partners' },
  ]);

  return (
    <MainLayout
      title="Partners"
      description="Explore the industry partners and collaborators supporting student innovation, research, and entrepreneurship at AI&DS Department, Pune."
      keywords="AISA Club Partners Pune, Industry Collaboration ISBM, Engineering College Sponsors Maharashtra, Student Innovation Partners, Technology Partners Pune"
      schema={breadcrumbSchema}
    >
      {/* Hero Section */}
      <section className="py-20 gradient-hero">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Our Partners
            </h1>
            <div className="w-16 h-1 bg-primary mx-auto mb-6" />
            <p className="text-lg text-white/80">
              {settings?.club_name || 'AISA Club'} is proud to collaborate with industry leaders and organizations
              who support our mission to empower students
            </p>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-16 bg-background">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-xl" />
              ))}
            </div>
          ) : partners && partners.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {partners.map((partner) => (
                <a
                  key={partner.id}
                  href={partner.website_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center p-8 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
                  aria-label={`Visit ${partner.name} website`}
                >
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={`${partner.name} - AISA Club partner`}
                      className="max-h-20 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                      {partner.name}
                    </span>
                  )}
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Handshake className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No partners listed yet.</p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Partners;
