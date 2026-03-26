import { Lightbulb, Users, Rocket, Code } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteData';

export const ClubAdvantageSection = () => {
  const { data: settings, isLoading } = useSiteSettings();

  const features = [
    { icon: Lightbulb, title: 'Innovation', description: 'Foster creative thinking and problem-solving skills' },
    { icon: Users, title: 'Collaboration', description: 'Work together on real-world projects' },
    { icon: Code, title: 'Technical Excellence', description: 'Master cutting-edge technologies' },
    { icon: Rocket, title: 'Career Growth', description: 'Prepare for global tech careers' },
  ];

  const clubName = settings?.club_name || 'AISA Club';
  const clubFullName = settings?.club_full_name || 'AI&DS Students Association';

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            The {clubName} Advantage
          </h2>
          <p className="text-lg text-primary font-medium mb-6">Empowering Future Innovators</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>At {clubFullName} ({clubName}), we focus on nurturing technical excellence through innovation, collaboration, and practical learning.</p>
            <p>Through hands-on workshops, coding competitions, hackathons, tech talks, and project-based activities, {clubName} ensures that every student gains real-world exposure beyond the classroom.</p>
            <p>Whether you're sharpening your coding skills, working on innovative ideas, or preparing for a global tech career, {clubName} provides the right platform to grow, learn, and lead.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-xl bg-background/60 backdrop-blur-sm border border-border/60 hover:border-primary/50 hover:bg-background/80 transition-all duration-300 hover:shadow-lg group">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const AISAAdvantageSection = ClubAdvantageSection;
