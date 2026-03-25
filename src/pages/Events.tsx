import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Clock, ArrowRight, Images } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useEvents, useSiteSettings } from '@/hooks/useSiteData';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const eventTypes = ['all', 'technical', 'workshop', 'hackathon', 'cultural', 'seminar', 'competition'];

const Events = () => {
  const [filter, setFilter] = useState('all');
  const { data: settings } = useSiteSettings();
  const { data: upcomingEvents, isLoading: loadingUpcoming } = useEvents(false);
  const { data: pastEvents, isLoading: loadingPast } = useEvents(true);

  const filteredUpcoming = upcomingEvents?.filter(
    e => filter === 'all' || e.event_type === filter
  );
  const filteredPast = pastEvents?.filter(
    e => filter === 'all' || e.event_type === filter
  );

  // Generate JSON-LD for upcoming events list
  const eventsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "AISA Club Events",
    "description": "Upcoming and past innovation events at AI&DS Department, Pune",
    "itemListElement": upcomingEvents?.slice(0, 10).map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Event",
        "name": event.title,
        "description": event.description || `${event.title} - AISA Club Event`,
        "startDate": event.event_date,
        "endDate": event.end_date || event.event_date,
        "location": {
          "@type": "Place",
          "name": event.location || "AI&DS Department",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Pune",
            "addressRegion": "Maharashtra",
            "addressCountry": "IN"
          }
        },
        "image": event.image_url || "https://innovationcell.isbmcoe.in/og-image.png",
        "url": `https://innovationcell.isbmcoe.in/event/${event.id}`,
        "organizer": {
          "@type": "Organization",
          "name": "AISA Club - AI&DS Department",
          "url": "https://innovationcell.isbmcoe.in"
        },
        "offers": {
          "@type": "Offer",
          "price": event.entry_fee || 0,
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock"
        }
      }
    })) || []
  };

  return (
    <MainLayout
      title="Events"
      description="Explore AISA Club activities, workshops, hackathons, startup events, and technical programs organized by AI&DS Department, Pune."
      keywords="AISA Club Events Pune, Hackathons ISBM, Student Innovation Activities Pune, Engineering Workshops Maharashtra"
      schema={eventsJsonLd}
    >

      {/* Hero */}
      <section className="py-20 gradient-hero">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Our Events
            </h1>
            <div className="w-16 h-1 bg-primary mx-auto mb-6" />
            <p className="text-lg text-white/80">
              Join us for exciting technical events, workshops, hackathons, and networking opportunities
            </p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-muted/30 border-b border-border">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-2">
            {eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                  filter === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                )}
              >
                {type === 'all' ? 'All Events' : type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 w-8 rounded-full bg-accent" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Upcoming Events
            </h2>
          </div>

          {loadingUpcoming ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-card border border-border p-6 animate-pulse">
                  <div className="aspect-video bg-muted rounded-xl mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredUpcoming?.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUpcoming.map((event, index) => (
                <div
                  key={event.id}
                  className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Event Thumbnail */}
                  <div className="relative aspect-video bg-muted/50 overflow-hidden">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <Calendar className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                    {/* Overlay with title */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-display text-lg font-bold text-white mb-1 line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-white/70 line-clamp-1">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-5 space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-accent" />
                        <span>{format(new Date(event.event_date), 'dd/MM/yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="h-4 w-4 text-accent" />
                        <span>
                          {format(new Date(event.event_date), 'h:mm a')}
                          {event.end_date && ` - ${format(new Date(event.end_date), 'h:mm a')}`}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <MapPin className="h-4 w-4 text-accent" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Participants Progress */}
                    {event.max_participants && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Participants</span>
                          <span className="font-medium text-foreground">
                            {event.current_participants}/{event.max_participants}
                          </span>
                        </div>
                        <Progress
                          value={(event.current_participants / event.max_participants) * 100}
                          className="h-2"
                        />
                      </div>
                    )}

                    {/* Entry Fee & Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="font-bold text-primary">
                        {(event as any).entry_fee > 0 ? `₹${(event as any).entry_fee}` : 'FREE'}
                      </span>
                      <div className="flex gap-2">
                        <Link to={`/event/${event.id}`}>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </Link>
                        <Link to={`/event/${event.id}/register`}>
                          <Button size="sm" className="gradient-accent text-accent-foreground hover:opacity-90">
                            Register
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-muted/30 border border-border">
              <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No upcoming events found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Check back soon for new events!</p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 w-8 rounded-full bg-muted-foreground/30" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Past Events
            </h2>
          </div>

          {loadingPast ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl bg-card border border-border p-4 animate-pulse">
                  <div className="aspect-video bg-muted rounded-lg mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredPast?.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPast.map((event, index) => (
                <Link
                  key={event.id}
                  to={`/event/${event.id}`}
                  className="group rounded-xl bg-card border border-border overflow-hidden hover:border-border/80 transition-all duration-300 animate-fade-in block"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted/50 overflow-hidden">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <Calendar className="h-10 w-10 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 rounded-md bg-background/80 backdrop-blur text-xs font-medium text-muted-foreground capitalize">
                        {event.event_type}
                      </span>
                    </div>
                    {(event as any).drive_folder_link && (
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-1 rounded-md bg-primary/90 backdrop-blur text-xs font-medium text-primary-foreground flex items-center gap-1">
                          <Images className="w-3 h-3" />
                          Gallery
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(event.event_date), 'MMM dd, yyyy')}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl bg-card border border-border">
              <p className="text-muted-foreground">No past events found</p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Events;
