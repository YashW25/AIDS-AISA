import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Clock, ArrowLeft, ExternalLink } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { DriveGallery } from '@/components/gallery/DriveGallery';
import { useEventDetails } from '@/hooks/useUserData';

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading, error } = useEventDetails(eventId);

  if (isLoading) {
    return (
      <MainLayout>
        <section className="py-20 gradient-hero">
          <div className="container">
            <Skeleton className="h-12 w-3/4 mx-auto bg-white/20" />
          </div>
        </section>
        <section className="py-16">
          <div className="container max-w-4xl">
            <Skeleton className="h-64 w-full rounded-xl mb-8" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </section>
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout>
        <section className="py-20 gradient-hero">
          <div className="container">
            <h1 className="font-display text-4xl font-bold text-white text-center">
              Event Not Found
            </h1>
          </div>
        </section>
        <section className="py-16">
          <div className="container text-center">
            <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist.</p>
            <Link to="/events">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
        </section>
      </MainLayout>
    );
  }

  const isPast = new Date(event.event_date) < new Date();
  const eventWithDrive = event as typeof event & { drive_folder_link?: string | null };

  // Generate JSON-LD structured data for the event
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description || `${event.title} - AISA Club Event at AI&DS Department`,
    "startDate": event.event_date,
    "endDate": event.end_date || event.event_date,
    "eventStatus": isPast ? "https://schema.org/EventScheduled" : "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
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
    "organizer": {
      "@type": "Organization",
      "name": "AISA Club - AI&DS Department",
      "url": "https://innovationcell.isbmcoe.in"
    },
    "offers": {
      "@type": "Offer",
      "price": event.entry_fee || 0,
      "priceCurrency": "INR",
      "availability": isPast ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      "url": `https://innovationcell.isbmcoe.in/event/${event.id}/register`
    },
    "maximumAttendeeCapacity": event.max_participants || undefined,
    "remainingAttendeeCapacity": event.max_participants ? event.max_participants - (event.current_participants || 0) : undefined
  };

  return (
    <MainLayout
      title={event.title}
      description={event.description || `Join ${event.title}, a premier innovation event at AI&DS Department, Pune. Register now to participate.`}
      keywords={`${event.title}, Innovation Event Pune, Student Hackathon ISBM, Technology Workshop Maharashtra, ${event.event_type}`}
      image={event.image_url}
      type="article"
      schema={eventJsonLd}
    >

      {/* Hero */}
      <section className="py-20 gradient-hero">
        <div className="container">
          <Link to="/events" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${isPast ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'
                }`}>
                {isPast ? 'Past Event' : 'Upcoming'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm capitalize">
                {event.event_type}
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              {event.title}
            </h1>
            {event.description && (
              <p className="text-lg text-white/80">{event.description}</p>
            )}
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-12 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Image */}
              {event.image_url && (
                <div className="rounded-2xl overflow-hidden border border-border">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {/* Gallery Section */}
              {eventWithDrive.drive_folder_link && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Event Gallery
                  </h2>
                  <DriveGallery folderUrl={eventWithDrive.drive_folder_link} pageSize={12} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Info Card */}
              <div className="rounded-2xl bg-card border border-border p-6 space-y-6">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Event Details
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">
                        {format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.event_date), 'h:mm a')}
                        {event.end_date && ` - ${format(new Date(event.end_date), 'h:mm a')}`}
                      </p>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">{event.location}</p>
                      </div>
                    </div>
                  )}

                  {event.max_participants && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {event.current_participants} / {event.max_participants} participants
                        </p>
                        <Progress
                          value={(event.current_participants / event.max_participants) * 100}
                          className="h-2 mt-2"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">Entry Fee</span>
                    <span className="text-2xl font-bold text-primary">
                      {event.entry_fee > 0 ? `₹${event.entry_fee}` : 'FREE'}
                    </span>
                  </div>

                  {!isPast && (
                    <Link to={`/event/${event.id}/register`} className="block">
                      <Button className="w-full gradient-accent text-accent-foreground">
                        Register Now
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default EventDetail;