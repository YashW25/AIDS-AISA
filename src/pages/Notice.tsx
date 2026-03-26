import { MainLayout } from '@/components/layout/MainLayout';
import { useNews, useSiteSettings } from '@/hooks/useSiteData';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Calendar, FileText, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';

const Notice = () => {
  const { data: settings } = useSiteSettings();
  const { data: news, isLoading } = useNews();

  return (
    <MainLayout
      title="Notices"
      description="Stay updated with the latest notices, circulars, and announcements regarding innovation activities, grants, and competitions at AI&DS Department."
      keywords="AISA Club Notices, Startup Competition Announcements Pune, Engineering Research Grants Updates, ISBM Innovation News"
    >

      {/* Hero Section */}
      <section className="py-20 gradient-hero">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Official Notices
            </h1>
            <div className="w-16 h-1 bg-primary mx-auto mb-6" />
            <p className="text-lg text-white/80">
              Important official announcements from {settings?.club_name || 'AISA Club'}
            </p>
            <p className="text-sm text-white/60 mt-2">
              These notices are kept for long-term reference
            </p>
          </div>
        </div>
      </section>

      {/* Notices List */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : news && news.length > 0 ? (
            <div className="space-y-6">
              {news.map((notice) => (
                <div
                  key={notice.id}
                  className="rounded-xl bg-card/65 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-card/85 transition-all group overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {notice.image_url && (
                      <div className="md:w-48 h-40 md:h-auto shrink-0">
                        <img
                          src={notice.image_url}
                          alt={notice.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          Notice
                        </span>
                        {notice.published_date && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(notice.published_date), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{notice.title}</h3>
                      {notice.content && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{notice.content}</p>
                      )}
                      {notice.attachment_url && (
                        <a
                          href={notice.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Download Attachment
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Bell className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No notices available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Notice;