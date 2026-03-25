import { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Image, Users, Calendar, Settings, LogOut, 
  Menu, X, GraduationCap, Megaphone, ChevronDown, ChevronRight, ImageIcon, Handshake, UserCog, User, BarChart3,
  ClipboardList, Award, Bell, Download, Newspaper, ScrollText, MessageSquare, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSiteSettings } from '@/hooks/useSiteData';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Layers, Navigation, FilePlus, Palette } from 'lucide-react';

type SideNavItem = {
  label: string;
  href: string;
  icon: any;
  children?: { label: string; href: string; icon: any }[];
};

const navItems: SideNavItem[] = [
  { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Site Settings', href: '/admin/dashboard/settings', icon: Settings },
  { label: 'Color Schema', href: '/admin/dashboard/theme', icon: Palette },
  { label: 'Navigation', href: '/admin/dashboard/navigation', icon: Navigation },
  { label: 'Custom Pages', href: '/admin/dashboard/pages', icon: FilePlus },
  { label: 'Announcements', href: '/admin/dashboard/announcements', icon: Megaphone },
  { label: 'Popup Banners', href: '/admin/dashboard/popups', icon: Bell },
  { label: 'Hero Slider', href: '/admin/dashboard/slides', icon: Image },
  { label: 'About Features', href: '/admin/dashboard/features', icon: FileText },
  { label: 'Stats', href: '/admin/dashboard/stats', icon: BarChart3 },
  { label: 'Events', href: '/admin/dashboard/events', icon: Calendar },
  { label: 'Registrations', href: '/admin/dashboard/registrations', icon: ClipboardList },
  { label: 'Certificates', href: '/admin/dashboard/certificates', icon: Award },
  { label: 'Team', href: '/admin/dashboard/team', icon: Users, children: [
    { label: 'Team Members', href: '/admin/dashboard/team', icon: Users },
    { label: 'Categories', href: '/admin/dashboard/team-categories', icon: Layers },
  ]},
  { label: 'Gallery', href: '/admin/dashboard/gallery', icon: ImageIcon },
  { label: 'Partners', href: '/admin/dashboard/partners', icon: Handshake },
  { label: 'Alumni', href: '/admin/dashboard/alumni', icon: GraduationCap },
  { label: 'Charter', href: '/admin/dashboard/charter', icon: ScrollText },
  { label: 'Notice', href: '/admin/dashboard/news', icon: Newspaper },
  { label: 'Downloads', href: '/admin/dashboard/downloads', icon: Download },
  { label: 'Contact Messages', href: '/admin/dashboard/contact', icon: MessageSquare },
  { label: 'Admin Users', href: '/admin/dashboard/admins', icon: UserCog },
  { label: 'Database Setup', href: '/admin/dashboard/setup', icon: Database },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: settings } = useSiteSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [expandedNavs, setExpandedNavs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate('/auth');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                {settings?.logo_url ? (
                  <img src={settings.logo_url} alt={settings.club_name} className="h-8 w-8 object-contain" />
                ) : (
                  <GraduationCap className="h-6 w-6 text-primary-foreground" />
                )}
              </div>
              <div className="hidden sm:block">
                <span className="font-display text-lg font-bold text-foreground">
                  {settings?.club_name || 'Admin'}
                </span>
                <span className="text-xs text-muted-foreground block">Admin Dashboard</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">View Site</Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-sm font-medium text-primary-foreground">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-muted-foreground">{user?.email}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/admin/dashboard/profile')}>
                  <User className="h-4 w-4 mr-2" />Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-background border-r border-border pt-16 transition-transform lg:translate-x-0 overflow-y-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <nav className="p-4 space-y-1 pb-8">
            {navItems.map((item) => {
              if (item.children) {
                const isParentActive = item.children.some(c => location.pathname === c.href);
                const isExpanded = expandedNavs.has(item.label) || isParentActive;
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => {
                        setExpandedNavs(prev => {
                          const next = new Set(prev);
                          if (next.has(item.label)) next.delete(item.label);
                          else next.add(item.label);
                          return next;
                        });
                      }}
                      className={cn(
                        "flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        isParentActive ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}>
                      <span className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </span>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    {isExpanded && (
                      <div className="ml-6 space-y-1 mt-1">
                        {item.children.map((child) => (
                          <Link key={child.href} to={child.href} onClick={() => setSidebarOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                              location.pathname === child.href
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}>
                            <child.icon className="h-4 w-4" />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link key={item.href} to={item.href} onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 lg:ml-64 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
