import { MainLayout } from '@/components/layout/MainLayout';
import { useSiteSettings, useCharterSettings } from '@/hooks/useSiteData';
import {
  FileText, Target, Eye, Heart, Users, Award, Lightbulb, Shield,
  Download, ExternalLink, BookOpen, Scale, CheckCircle2, Star,
  ChevronRight, Gavel, UserCheck, CalendarCheck, ListChecks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { generateBreadcrumbSchema } from '@/lib/seo';

const Charter = () => {
  const { data: settings } = useSiteSettings();
  const { data: charter, isLoading } = useCharterSettings();
  const clubName = settings?.club_name || 'AISA';
  const clubFullName = settings?.club_full_name || 'Artificial Intelligence and Student Association';
  const collegeName = settings?.college_name || 'ISBM College of Engineering';

  const documentUrl = (charter as any)?.file_url || (charter as any)?.drive_url;

  const getPreviewUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  };

  const getDownloadUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    return url;
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Charter', item: '/charter' },
  ]);

  return (
    <MainLayout
      title="Charter"
      description={`Official Charter and Constitution of ${clubFullName} at ${collegeName}. Read our mission, vision, core values, club structure, and governance guidelines.`}
      keywords="AISA Club Charter ISBM, Student Club Constitution Pune, AI DS Department Charter, Club Rules ISBM"
      schema={breadcrumbSchema}
    >
      {/* Hero */}
      <section className="py-20 gradient-hero">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-white/80 text-sm mb-6">
              <BookOpen className="w-4 h-4" />
              Official Document
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {(charter as any)?.title || `${clubName} Charter`}
            </h1>
            <div className="w-16 h-1 bg-primary mx-auto mb-6" />
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {(charter as any)?.description ||
                `The official constitution and guiding principles of ${clubFullName} — defining our purpose, structure, and governance at ${collegeName}.`}
            </p>
            {documentUrl && (
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <Button
                  variant="outline"
                  className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => window.open(documentUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Document
                </Button>
                <Button
                  className="gap-2"
                  onClick={() => window.open(getDownloadUrl(documentUrl), '_blank')}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Document Embed */}
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
                  <Button variant="outline" className="gap-2" onClick={() => window.open(documentUrl, '_blank')}>
                    <ExternalLink className="h-4 w-4" />
                    Full Screen
                  </Button>
                  <Button className="gap-2" onClick={() => window.open(getDownloadUrl(documentUrl), '_blank')}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm">
                <iframe
                  src={getPreviewUrl(documentUrl)}
                  className="w-full h-[700px]"
                  title={`${clubName} Charter Document`}
                  allow="autoplay"
                />
              </div>
              <p className="text-center text-muted-foreground mt-4 text-sm">
                Scroll to read the full document or use the buttons above to download
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* CHARTER TEMPLATE CONTENT */}
      {/* ═══════════════════════════════════════════════════════ */}

      {/* Article 1 — Name & Identity */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-5xl">
          <SectionHeader
            article="Article I"
            title="Name & Identity"
            icon={<Star className="w-6 h-6" />}
          />
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <InfoCard icon={<BookOpen className="w-5 h-5" />} label="Full Name">
              {clubFullName}
            </InfoCard>
            <InfoCard icon={<Star className="w-5 h-5" />} label="Short Name">
              {clubName} Club
            </InfoCard>
            <InfoCard icon={<Users className="w-5 h-5" />} label="Institution">
              {collegeName}
            </InfoCard>
          </div>
          <div className="mt-6 p-6 rounded-xl bg-card border border-border/50">
            <p className="text-muted-foreground leading-relaxed">
              The <strong className="text-foreground">{clubFullName} ({clubName})</strong> is the official student club
              of the Artificial Intelligence &amp; Data Science (AI&amp;DS) department at {collegeName}, Pune. The club
              is a non-profit, student-run organization established under the supervision of the department faculty.
            </p>
          </div>
        </div>
      </section>

      {/* Article 2 — Mission & Vision */}
      <section className="py-16 bg-background">
        <div className="container max-w-5xl">
          <SectionHeader article="Article II" title="Mission &amp; Vision" icon={<Target className="w-6 h-6" />} />
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="p-8 rounded-2xl bg-card border border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Our Mission</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To foster technical excellence, collaborative learning, and professional development among AI &amp; DS
                students through hands-on workshops, hackathons, industry interactions, and research initiatives — bridging
                the gap between academic knowledge and real-world application.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-card border border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Our Vision</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To be the premier student-led organization that empowers future AI &amp; DS engineers with the skills,
                knowledge, and professional network needed to become innovators and responsible leaders in the evolving
                technology landscape.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Article 3 — Objectives */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-5xl">
          <SectionHeader article="Article III" title="Objectives" icon={<ListChecks className="w-6 h-6" />} />
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {[
              'Organize technical workshops, seminars, and training sessions relevant to AI, ML, and Data Science.',
              'Conduct hackathons, coding contests, and project exhibitions to encourage innovation.',
              'Facilitate industry-academia interactions through guest lectures and internship drives.',
              'Provide a platform for students to publish research, showcase projects, and build portfolios.',
              'Promote awareness of ethical AI and responsible technology development.',
              'Support interdisciplinary collaboration between students of all years.',
              'Organize cultural, sports, and social events to foster community and belonging.',
              'Publish newsletters, maintain social media presence, and document club activities.',
            ].map((obj, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{obj}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Article 4 — Core Values */}
      <section className="py-16 bg-background">
        <div className="container max-w-5xl">
          <SectionHeader article="Article IV" title="Core Values" icon={<Heart className="w-6 h-6" />} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[
              { icon: Target, title: 'Excellence', desc: 'Striving for the highest standards in all our endeavors, from events to research.' },
              { icon: Heart, title: 'Integrity', desc: 'Maintaining honesty, transparency, and ethical conduct in all club activities.' },
              { icon: Users, title: 'Collaboration', desc: 'Working together as a team to achieve shared goals and support each member.' },
              { icon: Lightbulb, title: 'Innovation', desc: 'Embracing creative thinking and new ideas to solve real-world problems.' },
              { icon: Shield, title: 'Respect', desc: 'Valuing every member\'s contributions and maintaining an inclusive environment.' },
              { icon: Award, title: 'Leadership', desc: 'Developing future leaders through mentorship, responsibility, and initiative.' },
            ].map((v, i) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/40 transition-all group">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Article 5 — Club Structure */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-5xl">
          <SectionHeader article="Article V" title="Club Structure &amp; Office Bearers" icon={<UserCheck className="w-6 h-6" />} />
          <div className="mt-8 space-y-4">
            {[
              {
                role: 'Faculty Advisor',
                resp: 'Appointed by the department. Provides guidance, approves major decisions, and acts as the liaison with the college administration.',
                badge: 'Faculty',
              },
              {
                role: 'President',
                resp: 'Elected student leader responsible for overall club operations, representing the club in official matters, and chairing all meetings.',
                badge: 'Core',
              },
              {
                role: 'Vice President',
                resp: 'Assists the President, oversees project execution, and takes over in the President\'s absence.',
                badge: 'Core',
              },
              {
                role: 'General Secretary',
                resp: 'Maintains records, manages correspondence, prepares meeting minutes, and handles administrative tasks.',
                badge: 'Core',
              },
              {
                role: 'Treasurer',
                resp: 'Manages club finances, maintains accounts, collects fees, and prepares financial reports.',
                badge: 'Core',
              },
              {
                role: 'Technical Head',
                resp: 'Leads technical events, workshops, and hackathons; oversees the technical committee members.',
                badge: 'Head',
              },
              {
                role: 'Event Manager',
                resp: 'Coordinates logistics, venue, and execution for all club events and activities.',
                badge: 'Head',
              },
              {
                role: 'PR & Media Head',
                resp: 'Manages social media, photography, graphic design, and public communications.',
                badge: 'Head',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                <div className="mt-0.5">
                  <ChevronRight className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{item.role}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.badge === 'Faculty' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      item.badge === 'Core' ? 'bg-primary/10 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.resp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Article 6 — Membership */}
      <section className="py-16 bg-background">
        <div className="container max-w-5xl">
          <SectionHeader article="Article VI" title="Membership" icon={<Users className="w-6 h-6" />} />
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border/50">
              <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> Eligibility
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Any student enrolled in the AI&amp;DS department at {collegeName}</li>
                <li>• Students from other departments may apply for associate membership</li>
                <li>• Alumni may apply for honorary membership</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border/50">
              <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> Member Responsibilities
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Attend general body meetings and club events</li>
                <li>• Pay applicable membership fees on time</li>
                <li>• Uphold the club's code of conduct and values</li>
                <li>• Contribute actively to at least one club activity per semester</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Article 7 — Meetings & Decisions */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-5xl">
          <SectionHeader article="Article VII" title="Meetings &amp; Decision Making" icon={<CalendarCheck className="w-6 h-6" />} />
          <div className="mt-8 grid sm:grid-cols-3 gap-6">
            {[
              {
                title: 'General Body Meeting',
                freq: 'Once per semester',
                desc: 'Open to all members. Key decisions, elections, and annual reports are presented.',
              },
              {
                title: 'Executive Committee',
                freq: 'Monthly',
                desc: 'Core team meetings to plan events, review progress, and allocate tasks.',
              },
              {
                title: 'Emergency Meeting',
                freq: 'As required',
                desc: 'Called by the President or Faculty Advisor to address urgent matters.',
              },
            ].map((m, i) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-border/50">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{m.freq}</p>
                <h4 className="font-bold text-foreground mb-2">{m.title}</h4>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-5 rounded-xl bg-card border border-border/50">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Quorum:</strong> A minimum of 50% of the executive committee members
              must be present for decisions to be valid. Simple majority (51%) is required for routine decisions; a
              two-thirds majority is required for constitutional amendments.
            </p>
          </div>
        </div>
      </section>

      {/* Article 8 — Rules & Code of Conduct */}
      <section className="py-16 bg-background">
        <div className="container max-w-5xl">
          <SectionHeader article="Article VIII" title="Rules &amp; Code of Conduct" icon={<Gavel className="w-6 h-6" />} />
          <div className="mt-8 space-y-3">
            {[
              'All members must behave respectfully and professionally at all club events and online platforms.',
              'Members must not misuse club resources, funds, or the club\'s name for personal gain.',
              'Plagiarism, dishonesty, or unethical behavior at any club event will lead to immediate disqualification.',
              'Any member found violating the code of conduct may be issued a warning, suspended, or removed by a majority vote of the executive committee.',
              'Conflicts of interest must be disclosed to the President or Faculty Advisor immediately.',
              'All club communications should be inclusive, free from discrimination, and respectful of diversity.',
              'Members leaving the club must return any club property and complete a proper handover of responsibilities.',
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Article 9 — Amendments */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-5xl">
          <SectionHeader article="Article IX" title="Amendments &amp; Ratification" icon={<Scale className="w-6 h-6" />} />
          <div className="mt-8 p-8 rounded-2xl bg-card border border-border/50">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Any proposed amendment to this Charter must be submitted in writing to the General Secretary at least
              <strong className="text-foreground"> 14 days</strong> before a General Body Meeting. Amendments require
              approval by a <strong className="text-foreground">two-thirds majority</strong> of members present at the
              General Body Meeting and final ratification by the Faculty Advisor.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This Charter comes into effect upon ratification and supersedes all previous governing documents of the club.
            </p>
          </div>

          {/* Download CTA */}
          {documentUrl && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 p-8 rounded-2xl gradient-hero">
              <div className="text-white text-center sm:text-left">
                <p className="font-bold text-lg">Download the Official Charter</p>
                <p className="text-white/70 text-sm">Get the full PDF for offline reference</p>
              </div>
              <Button
                size="lg"
                className="gap-2 bg-white text-primary hover:bg-white/90 font-semibold flex-shrink-0"
                onClick={() => window.open(getDownloadUrl(documentUrl), '_blank')}
              >
                <Download className="h-5 w-5" />
                Download PDF
              </Button>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ article, title, icon }: { article: string; title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0 mt-1">
        <div className="text-primary">{icon}</div>
      </div>
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">{article}</p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
        <div className="w-10 h-0.5 bg-primary mt-3" />
      </div>
    </div>
  );
}

function InfoCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-xl bg-card border border-border/50">
      <div className="flex items-center gap-2 text-primary mb-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <p className="font-semibold text-foreground text-sm">{children}</p>
    </div>
  );
}

export default Charter;
