import { useState } from 'react';
import { useAlumni } from '@/hooks/useSiteData';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Linkedin, Building2, GraduationCap } from 'lucide-react';

export const AlumniSection = () => {
  const { data: alumni, isLoading } = useAlumni();
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Skeleton className="h-4 w-20 mx-auto mb-3" />
            <Skeleton className="h-10 w-48 mx-auto" />
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-64 rounded-2xl bg-card border border-border overflow-hidden shadow-sm animate-pulse">
                <div className="h-1.5 bg-muted" />
                <div className="p-6 flex flex-col items-center">
                  <Skeleton className="w-20 h-20 rounded-full mb-4" />
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-3 w-20 mb-4" />
                  <Skeleton className="h-px w-full mb-4" />
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
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
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-2">Meet our</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Top Alumni
          </h2>
          <div className="mt-4 mx-auto w-16 h-1 rounded-full bg-primary" />
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {visibleAlumni.map((person, index) => (
            <div
              key={person.id}
              className="w-64 flex-shrink-0 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Accent top bar */}
              <div className="h-1.5 bg-primary w-full" />

              <div className="p-6 flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-primary/30 ring-offset-2 ring-offset-card shadow-sm group-hover:ring-primary/60 transition-all duration-300">
                    {person.image_url ? (
                      <img
                        src={person.image_url}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/50 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {person.name?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-base font-bold text-foreground mb-1 leading-tight">
                  {person.name}
                </h3>

                {/* Batch badge */}
                {person.graduation_year && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
                    <GraduationCap className="w-3 h-3" />
                    Batch {person.graduation_year}
                  </div>
                )}

                {/* Divider */}
                <div className="w-full h-px bg-border mb-4" />

                {/* Company & role */}
                <div className="w-full space-y-1.5">
                  {person.company && (
                    <div className="flex items-start gap-2 justify-center">
                      <Building2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm font-semibold text-foreground leading-tight">{person.company}</p>
                    </div>
                  )}
                  {person.job_title && (
                    <p className="text-xs text-muted-foreground">{person.job_title}</p>
                  )}
                  {person.branch && (
                    <p className="text-xs text-muted-foreground/70">{person.branch}</p>
                  )}
                </div>

                {/* LinkedIn */}
                {person.linkedin_url && (
                  <a
                    href={person.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full border border-primary/30 text-xs text-primary font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View More / Show Less */}
        {hasMore && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              {showAll ? (
                <><ChevronUp className="w-4 h-4" /> Show Less</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> View More Alumni ({alumni.length - 3} more)</>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
