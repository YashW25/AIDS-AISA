import { usePartners } from '@/hooks/useSiteData';
import { Skeleton } from '@/components/ui/skeleton';
export const PartnersSlider = () => {
  const {
    data: partners,
    isLoading
  } = usePartners();
  if (isLoading) {
    return <section className="py-16 bg-[#1a2744]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4 bg-white/10" />
          </div>
          <div className="flex gap-6 justify-center">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 w-44 bg-white/10 rounded-lg" />)}
          </div>
        </div>
      </section>;
  }
  if (!partners || partners.length === 0) {
    return null;
  }

  // Duplicate partners for seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners, ...partners];
  return <section className="py-16 bg-[#1a2744] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white italic">Our Partners</h2>
        </div>

        <div className="relative">
          <div className="flex animate-scroll-left">
            {duplicatedPartners.map((partner, index) => <a key={`${partner.id}-${index}`} href={partner.website_url || '#'} target={partner.website_url ? '_blank' : '_self'} rel="noopener noreferrer" className="flex-shrink-0 mx-3 group">
                <div className="w-44 h-24 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-4">
                  {partner.logo_url ? <img src={partner.logo_url} alt={partner.name} className="max-h-16 max-w-full object-contain" /> : <span className="text-sm font-semibold text-gray-700 text-center">
                      {partner.name}
                    </span>}
                </div>
              </a>)}
          </div>
        </div>
      </div>
    </section>;
};