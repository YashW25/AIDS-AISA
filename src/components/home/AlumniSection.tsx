import { useState } from 'react';
import { useAlumni } from '@/hooks/useSiteData';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const AlumniSection = () => {
  const { data: alumni, isLoading } = useAlumni();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <section className="py-16 bg-[#e8e8e8]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-6 w-24 mx-auto mb-2" />
            <Skeleton className="h-10 w-48 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="w-24 h-24 rounded-full mb-4" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!alumni || alumni.length === 0) {
    return null;
  }

  const itemsPerPage = 4;
  const maxIndex = Math.max(0, alumni.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleAlumni = alumni.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <section className="py-16 bg-[#e8e8e8]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-muted-foreground mb-2">Meet our</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Top Alumni
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {visibleAlumni.map((person) => (
            <div key={person.id} className="relative">
              {/* Profile Image - positioned at top-left */}
              <div className="absolute -top-6 left-6 z-10">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#e8e8e8] shadow-lg bg-white">
                  {person.image_url ? (
                    <img
                      src={person.image_url}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">
                        {person.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card */}
              <div className="bg-[#1a2744] rounded-2xl pt-10 pb-6 px-6 text-center min-h-[220px] flex flex-col justify-center mt-6">
                <h3 className="text-lg font-bold text-white mb-2">{person.name}</h3>
                <p className="text-[#4a90d9] text-sm mb-1">ISM&B</p>
                <p className="text-[#4a90d9] text-sm mb-4">Batch: {person.graduation_year}</p>
                
                <div className="text-white space-y-1">
                  <p className="font-bold">{person.company}</p>
                  <p className="text-sm">{person.job_title}</p>
                  <p className="text-sm">{person.branch}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {alumni.length > itemsPerPage && (
          <div className="flex justify-center gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
