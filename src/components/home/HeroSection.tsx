import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHeroSlides, useSiteSettings } from '@/hooks/useSiteData';
import { cn } from '@/lib/utils';

export const HeroSection = () => {
  const { data: slides, isLoading } = useHeroSlides();
  const { data: settings } = useSiteSettings();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!slides?.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides?.length]);

  const nextSlide = () => {
    if (slides?.length) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides?.length) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container relative z-10">
          <div className="max-w-3xl space-y-6">
            <Skeleton className="h-10 w-64 bg-white/10" />
            <Skeleton className="h-16 w-full bg-white/10" />
            <Skeleton className="h-16 w-3/4 bg-white/10" />
            <Skeleton className="h-6 w-2/3 bg-white/10" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-14 w-40 bg-white/10 rounded-lg" />
              <Skeleton className="h-14 w-32 bg-white/10 rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default hero content when no slides
  if (!slides?.length) {
    return (
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z" fill="white" fillOpacity="0.1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-pattern)"/>
          </svg>
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span className="text-sm font-medium text-primary">AI&DS Department</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {settings?.club_full_name || 'Artificial Intelligence and Data Science Students Association'}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
              {settings?.tagline || 'Empowering future tech leaders through innovation, collaboration, and excellence in AI and Data Science education.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/events">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-lg shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40">
                  Explore Events
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/20 px-8 py-6 text-lg rounded-lg backdrop-blur-md bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === currentSlide ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Dark overlay with gradient — keeps image readable */}
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 55%, transparent 100%)' }} />
          <img
            src={slide.image_url}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Content */}
      <div className="container relative z-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary border border-primary/30 mb-6 animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <Star className="h-4 w-4 text-white fill-white" />
            <span className="text-sm font-medium text-white">{settings?.club_name || 'AISA Club'}</span>
          </div>
          
          <h1 
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            {slides[currentSlide]?.title}
          </h1>
          
          {slides[currentSlide]?.subtitle && (
            <p 
              className="text-lg md:text-xl text-white/85 mb-8 max-w-2xl animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              {slides[currentSlide].subtitle}
            </p>
          )}
          
          {slides[currentSlide]?.button_text && (
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link to={slides[currentSlide].button_link || '#'}>
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-lg shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40">
                  {slides[currentSlide].button_text}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white border border-white/20 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white border border-white/20 group"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Dots Navigation */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "h-3 rounded-full transition-all duration-300",
                  index === currentSlide
                    ? "bg-primary w-10"
                    : "bg-white/40 w-3 hover:bg-white/60"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
