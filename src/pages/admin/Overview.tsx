import { LayoutDashboard, Users, Calendar, Image, Megaphone } from 'lucide-react';
import { useStats, useEvents, useTeamMembers, useAnnouncements, useGallery } from '@/hooks/useSiteData';

const Overview = () => {
  const { data: stats } = useStats();
  const { data: events } = useEvents();
  const { data: team } = useTeamMembers();
  const { data: announcements } = useAnnouncements();
  const { data: gallery } = useGallery();

  const dashboardStats = [
    { label: 'Announcements', value: announcements?.length || 0, icon: Megaphone, color: 'bg-blue-500' },
    { label: 'Events', value: events?.length || 0, icon: Calendar, color: 'bg-green-500' },
    { label: 'Team Members', value: team?.length || 0, icon: Users, color: 'bg-purple-500' },
    { label: 'Gallery Images', value: gallery?.length || 0, icon: Image, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to the admin dashboard. Manage your club website from here.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.color} mb-4`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="font-display text-3xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/dashboard/announcements"
            className="p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <Megaphone className="h-6 w-6 text-primary mb-2" />
            <div className="font-medium text-foreground">Add Announcement</div>
            <div className="text-sm text-muted-foreground">Create new marquee announcement</div>
          </a>
          <a
            href="/admin/dashboard/events"
            className="p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <Calendar className="h-6 w-6 text-primary mb-2" />
            <div className="font-medium text-foreground">Create Event</div>
            <div className="text-sm text-muted-foreground">Add a new event</div>
          </a>
          <a
            href="/admin/dashboard/team"
            className="p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <Users className="h-6 w-6 text-primary mb-2" />
            <div className="font-medium text-foreground">Manage Team</div>
            <div className="text-sm text-muted-foreground">Add or edit team members</div>
          </a>
        </div>
      </div>

      {/* Site Stats Preview */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Website Stats (Display)</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.map((stat) => (
            <div key={stat.id} className="p-4 rounded-xl bg-muted">
              <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
