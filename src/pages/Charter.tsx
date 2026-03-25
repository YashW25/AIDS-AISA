import { MainLayout } from '@/components/layout/MainLayout';
import { useSiteSettings, useCharterSettings } from '@/hooks/useSiteData';
import { FileText, Target, Eye, Heart, Users, Award, Lightbulb, Shield, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Charter = () => {
  const { data: settings } = useSiteSettings();
  const { data: charter, isLoading } = useCharterSettings();
  const clubName = settings?.club_name || 'AISA';

  const values = [
    { icon: Target, title: 'Excellence', description: 'Striving for the highest standards in all our endeavors.' },
    { icon: Heart, title: 'Integrity', description: 'Maintaining honesty and transparency in all our activities.' },
    { icon: Users, title: 'Collaboration', description: 'Working together to achieve common goals.' },
    { icon: Lightbulb, title: 'Innovation', description: 'Embracing new ideas and creative solutions.' },
    { icon: Shield, title: 'Respect', description: 'Valuing every member and their contributions.' },
    { icon: Award, title: 'Leadership', description: 'Developing future leaders through mentorship.' },
  ];

  // Get the document URL (prefer file_url, fallback to drive_url)
  const documentUrl = charter?.file_url || charter?.drive_url;

  // Convert Google Drive URL to preview URL if needed
  const getPreviewUrl = (url: string) => {
    if (!url) return '';
    // If it's a Google Drive link, convert to preview format
    if (url.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return url;
  };

  const getDownloadUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    return url;
  };

  return (
    <MainLayout
      title="Charter"
      description="Read the official Innovation and Startup Policy (NISP) and Charter of AI&DS Department, guiding student entrepreneurship and research."
      keywords="Innovation Charter ISBM, Startup Policy Engineering College, NISP ISBM Pune, Student Innovation Guidelines"
    >
      {/* Hero Section */}
      <section className="py-20 gradient-hero">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {charter?.title || `${clubName} Charter`}
            </h1>
            <div className="w-16 h-1 bg-primary mx-auto mb-6" />
            <p className="text-lg text-white/80">
              {charter?.description || 'The guiding principles and constitution that define our organization\'s purpose and governance'}
            </p>
          </div>
        </div>
      </section>

      {/* Charter Document Preview */}
      {isLoading ? (
        <section className="py-16 bg-background">
          <div className="container">
            <Skeleton className="h-[600px] w-full rounded-xl" />
          </div>
        </section>
      ) : documentUrl ? (
        <section className="py-16 bg-background">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Official Charter Document
                </h2>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(documentUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Full Screen
                  </Button>
                  <Button
                    className="gap-2"
                    onClick={() => window.open(getDownloadUrl(documentUrl), '_blank')}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-border/50 bg-card">
                <iframe
                  src={getPreviewUrl(documentUrl)}
                  className="w-full h-[700px]"
                  title="AISA Charter Document"
                  allow="autoplay"
                />
              </div>

              <p className="text-center text-muted-foreground mt-4 text-sm">
                Use scroll or the controls above to navigate through the document
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-card border border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To foster technical excellence and professional growth among AI & DS students
                through workshops, competitions, and industry collaborations. We aim to bridge the gap
                between academic knowledge and practical skills.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-card border border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Our Vision</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To be the premier student organization that empowers future engineers with the skills,
                knowledge, and network needed to excel in the ever-evolving technology landscape and
                become leaders in their respective fields.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Core Values</h2>
            <div className="w-16 h-1 bg-primary mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all group"
              >
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Charter;
