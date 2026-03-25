import { useAnnouncements } from '@/hooks/useSiteData';
import { Megaphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const Marquee = () => {
  const { data: announcements, isLoading } = useAnnouncements();

  if (isLoading) {
    return (
      <div className="bg-primary text-white overflow-hidden">
        <div className="flex items-center">
          <div className="flex items-center gap-2 shrink-0 px-4 py-2.5 bg-primary-foreground/10">
            <Megaphone className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Announcements</span>
          </div>
          <div className="flex-1 py-2.5 px-4">
            <Skeleton className="h-4 w-full bg-white/20" />
          </div>
        </div>
      </div>
    );
  }

  if (!announcements?.length) return null;

  const content = announcements.map(a => a.content).join('  •  ');

  return (
    <div className="bg-primary text-white overflow-hidden">
      <div className="flex items-center">
        <div className="flex items-center gap-2 shrink-0 px-4 py-2.5 bg-primary-foreground/10">
          <Megaphone className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Announcements</span>
        </div>
        <div className="overflow-hidden flex-1 py-2.5">
          <div className="animate-marquee whitespace-nowrap text-sm font-medium px-4">
            {content}  •  {content}
          </div>
        </div>
      </div>
    </div>
  );
};