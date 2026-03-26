import { useState } from 'react';
import { useAlumni } from '@/hooks/useSiteData';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Linkedin } from 'lucide-react';

export const AlumniSection = () => {
  const { data: alumni, isLoading } = useAlumni();
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-5 w-20 mx-auto mb-3" />
            <Skeleton className="h-10 w-48 mx-auto" />
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-64">
                <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
                <Skeleton className="h-52 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!alumni || alumni.length === 0) return null;

  const topAlumni = alumni.slice(0, 3);
  const visibleAlumni = showAll ? alumni : topAlumni;
  const hasMore = alumni.length > 3;

  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-muted-foreground mb-2 text-sm uppercase tracking-wider">Meet our</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Top Alumni
          </h2>
        </div>

        {/* Centered grid — 1 col on mobile, 3 on desktop */}
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          {visibleAlumni.map((person) => (
            <div key={person.id} className="relative w-64 flex-shrink-0">
              {/* Floating profile image */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-muted shadow-lg bg-white">
                  {person.image_url ? (
                    <img
                      src={person.image_url}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {person.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card */}
              <div className="bg-secondary/80 backdrop-blur-sm rounded-2xl pt-14 pb-6 px-6 text-center min-h-[230px] flex flex-col justify-center mt-4 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-1">{person.name}</h3>
                <p className="text-primary/80 text-xs mb-1 uppercase tracking-wide">AI & DS</p>
                <p className="text-primary/80 text-sm mb-4">Batch: {person.graduation_year}</p>

                <div className="text-white space-y-1">
                  {person.company && (
                    <p className="font-semibold text-sm">{person.company}</p>
                  )}
                  {person.job_title && (
                    <p className="text-xs text-white/70">{person.job_title}</p>
                  )}
                  {person.branch && (
                    <p className="text-xs text-white/60">{person.branch}</p>
                  )}
                </div>

                {person.linkedin_url && (
                  <a
                    href={person.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs text-primary/80 hover:text-white transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View More / Show Less button */}
        {hasMore && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="gap-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  View More Alumni ({alumni.length - 3} more)
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
