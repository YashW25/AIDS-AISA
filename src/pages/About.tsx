import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout/MainLayout';
import { useSiteSettings, useAboutFeatures, useStats } from '@/hooks/useSiteData';
import { Users, Calendar, Award, Building, TrendingUp, BookOpen, GraduationCap, Code, Star, Handshake, Target, Eye, Lightbulb, Rocket, Heart, Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const iconMap: Record<string, React.ElementType> = {
  users: Users, calendar: Calendar, award: Award, building: Building,
  'trending-up': TrendingUp, 'book-open': BookOpen, 'graduation-cap': GraduationCap,
  code: Code, star: Star, handshake: Handshake, target: Target, eye: Eye,
  lightbulb: Lightbulb, rocket: Rocket, heart: Heart, shield: Shield,
};

const About = () => {
  const { data: settings } = useSiteSettings();
  const { data: features = [] } = useAboutFeatures();
  const { data: stats = [] } = useStats();

  const clubName = settings?.club_name || 'Our Club';
  const clubFullName = settings?.club_full_name || 'Student Activity Club';
  const collegeName = settings?.college_name || 'College';

  const scrollToContent = () => {
    document.getElementById('about-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <MainLayout
      title="About"
      description={settings?.tagline || `Learn about ${clubFullName} at ${collegeName}, dedicated to fostering creativity, research, innovation, and entrepreneurship among students.`}
      keywords={`About ${clubName}, ${clubFullName}, ${collegeName}, Student Club`}
    >

      <section className="relative min-h-[70vh] flex items-center justify-center gradient-hero overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">{clubFullName}</h1>
            <div className="w-16 h-1 bg-primary mx-auto mb-6" />
            <p className="text-xl md:text-2xl text-white/80 mb-8 font-light">Where Passion Meets Purpose</p>
            {stats.length > 0 && (
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                {stats.slice(0, 3).map((stat) => (
                  <div key={stat.id} className="text-center">
                    <div className="font-display text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={scrollToContent} className="inline-flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer animate-bounce">
              <span className="text-sm">Scroll to explore</span>
              <ChevronDown className="h-6 w-6" />
            </button>
          </div>
        </div>
      </section>

      <section id="about-content" className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-accent font-medium text-sm uppercase tracking-wider">Our Story</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">About {clubName}</h2>
            </div>
            <div className="prose prose-lg mx-auto text-center mb-12">
              <p className="text-xl text-muted-foreground leading-relaxed">
                {settings?.tagline || 'Empowering future tech leaders through innovation, collaboration, and excellence in education.'}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="group p-8 rounded-2xl bg-card/65 backdrop-blur-sm border border-border/60 hover:border-primary/40 hover:shadow-xl hover:bg-card/85 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl gradient-accent mb-6 group-hover:scale-110 transition-transform">
                  <Target className="h-7 w-7 text-accent-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">To foster a vibrant community of students, providing them with opportunities for professional development, technical skill enhancement, and industry exposure.</p>
              </div>
              <div className="group p-8 rounded-2xl bg-card/65 backdrop-blur-sm border border-border/60 hover:border-primary/40 hover:shadow-xl hover:bg-card/85 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl gradient-accent mb-6 group-hover:scale-110 transition-transform">
                  <Eye className="h-7 w-7 text-accent-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">To be the leading student organization that bridges the gap between academic learning and industry requirements.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {features.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <span className="text-accent font-medium text-sm uppercase tracking-wider">What We Offer</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">Why Choose {clubName}?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = iconMap[feature.icon] || Star;
                return (
                  <div key={feature.id} className="group p-6 rounded-2xl bg-card/65 backdrop-blur-sm border border-border/60 hover:border-primary/40 hover:shadow-lg hover:bg-card/85 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl gradient-accent mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {stats.length > 0 && (
        <section className="py-16 gradient-primary">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-3">Our Impact in Numbers</h2>
              <p className="text-primary-foreground/70">Building a strong community of students</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => {
                const Icon = iconMap[stat.icon] || Award;
                return (
                  <div key={stat.id} className="text-center p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent mb-4">
                      <Icon className="h-7 w-7 text-accent-foreground" />
                    </div>
                    <div className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-2">{stat.value}</div>
                    <div className="text-sm text-primary-foreground/70">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Join Us?</h2>
            <p className="text-lg text-muted-foreground mb-8">Be part of {clubName} and unlock opportunities for growth, learning, and innovation.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gradient-accent text-accent-foreground hover:opacity-90">
                <Link to="/events">View Events</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/team">Meet Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default About;
