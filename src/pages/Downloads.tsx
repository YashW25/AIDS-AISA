import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout/MainLayout';
import { useSiteSettings, useDownloads } from '@/hooks/useSiteData';
import { Download, FileText, Image, File, Archive, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const getFileIcon = (fileType: string) => {
  switch (fileType?.toLowerCase()) {
    case 'pdf':
      return FileText;
    case 'image':
      return Image;
    case 'zip':
      return Archive;
    default:
      return File;
  }
};

const Downloads = () => {
  const { data: settings } = useSiteSettings();
  const { data: downloads, isLoading } = useDownloads();

  const getDownloadUrl = (item: any) => {
    if (item.drive_url) {
      // Convert Google Drive link to download format
      const match = item.drive_url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
      return item.drive_url;
    }
    return item.file_url;
  };

  const handleDownload = (item: any) => {
    const url = getDownloadUrl(item);
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <MainLayout
      title="Downloads"
      description="Download resources, startup guides, project templates, and event calendars from the AISA Club at AI&DS Department, Pune."
      keywords="Innovation Resources Download, Startup Guides Pune, Engineering Project Templates, AISA Club Documents ISBM"
    >

      {/* Hero Section */}
      <section className="py-20 gradient-hero">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Downloads
            </h1>
            <div className="w-16 h-1 bg-primary mx-auto mb-6" />
            <p className="text-lg text-white/80">
              Access important documents, forms, and resources from {settings?.club_name || 'AISA'}
            </p>
          </div>
        </div>
      </section>

      {/* Downloads Grid */}
      <section className="py-16 bg-background">
        <div className="container">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : downloads && downloads.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {downloads.map((item) => {
                const IconComponent = getFileIcon(item.file_type);
                const hasFile = item.file_url || item.drive_url;

                return (
                  <div
                    key={item.id}
                    className="p-6 rounded-xl bg-card/65 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-card/85 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground uppercase">
                              {item.file_type}
                            </span>
                            {item.file_size && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{item.file_size}</span>
                              </>
                            )}
                            {item.drive_url && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-xs text-blue-500">Drive</span>
                              </>
                            )}
                          </div>
                          {hasFile ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                              onClick={() => handleDownload(item)}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Coming soon</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <File className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No downloads available at the moment.</p>
            </div>
          )}

          <div className="mt-12 p-6 rounded-xl bg-muted/30 border border-border/50 text-center">
            <p className="text-muted-foreground">
              Looking for specific documents? Contact us at{' '}
              <a href={`mailto:${settings?.email || 'AISA@isbm.ac.in'}`} className="text-primary hover:underline">
                {settings?.email || 'AISA@isbm.ac.in'}
              </a>
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Downloads;
