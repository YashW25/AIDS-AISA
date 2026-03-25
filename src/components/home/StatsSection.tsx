import { Users, Calendar, Award, Building, TrendingUp, BookOpen, GraduationCap, Code } from 'lucide-react';
import { useStats } from '@/hooks/useSiteData';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, React.ElementType> = {
  users: Users,
  calendar: Calendar,
  award: Award,
  building: Building,
  'trending-up': TrendingUp,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  code: Code,
};

export const StatsSection = () => {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <section className="py-16 gradient-primary">
        <div className="container">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4 bg-white/10" />
            <Skeleton className="h-5 w-96 mx-auto bg-white/10" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur">
                <Skeleton className="w-14 h-14 rounded-xl mx-auto mb-4 bg-white/10" />
                <Skeleton className="h-10 w-20 mx-auto mb-2 bg-white/10" />
                <Skeleton className="h-4 w-24 mx-auto bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!stats?.length) return null;

  return (
    <section className="py-16 gradient-primary">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Building a strong community of AI & DS students through meaningful engagement and growth
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon] || Award;
            return (
              <div
                key={stat.id}
                className="text-center p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent mb-4">
                  <Icon className="h-7 w-7 text-accent-foreground" />
                </div>
                <div className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/70">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
