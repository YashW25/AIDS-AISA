import { useAnnouncements } from '@/hooks/useSiteData';
import { Megaphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const Marquee = () => {
  const { data: announcements, isLoading } = useAnnouncements();

  if (isLoading) {
    return (
      <div className="gradient-primary text-white overflow-hidden">
        <div className="flex items-center">
          <div className="flex items-center gap-2 shrink-0 px-4 py-2.5 bg-black/20">
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

  // Join all announcements with a separator, then double for seamless loop
  const single = announcements.map(a => a.content).join('   \u2022   ');
  const content = `${single}   \u2022   `;

  return (
    <div className="gradient-primary text-white overflow-hidden">
      <div className="flex items-center">
        <div className="flex items-center gap-2 shrink-0 px-4 py-2.5 bg-black/20 backdrop-blur-sm">
          <Megaphone className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Announcements</span>
        </div>
        <div className="overflow-hidden flex-1 py-2.5">
          {/* doubled content: animation goes 0 → -50% so the loop is seamless */}
          <div className="animate-marquee text-sm font-medium drop-shadow-sm">
            {content}{content}
          </div>
        </div>
      </div>
    </div>
  );
};