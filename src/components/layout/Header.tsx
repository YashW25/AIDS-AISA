import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, GraduationCap, User, LogOut, LayoutDashboard, ChevronDown, Home, Info, Calendar, Users, Image, Award, Phone, Download, FileText, Bell, Handshake, Star, Heart, Settings, Mail, Globe, BookOpen, Newspaper, Video, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/useSiteData';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Marquee } from '@/components/home/Marquee';
import { useNavItemsTree } from '@/hooks/useNavItems';
import type { NavItem } from '@/hooks/useNavItems';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const iconMap: Record<string, any> = {
  Home, Info, Calendar, Users, Image, Phone, Download, FileText, Award, Bell,
  Handshake, Star, Heart, Settings, Mail, Globe, BookOpen, Newspaper, Video, Music,
};

const getIcon = (name: string | null) => iconMap[name || 'FileText'] || FileText;

type MobileSection = string | null;

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [mobileOpenSection, setMobileOpenSection] = useState<MobileSection>(null);
  const location = useLocation();
  const { data: settings } = useSiteSettings();
  const { user, profile, role, isClubAdmin, signOut } = useAuth();
  const { data: navTree } = useNavItemsTree();

  const clubName = settings?.club_name || 'AISA Club';
  const isAdminOrTeacher = role === 'admin' || role === 'teacher' || role === 'super_admin' || isClubAdmin;

  const isActiveRoute = (href: string) => location.pathname === href;
  const isInSection = (item: NavItem & { children?: NavItem[] }) =>
    item.children?.some((c) => isActiveRoute(c.href)) || false;

  const toggleDropdown = (id: string, open: boolean) => {
    setOpenDropdowns((prev) => ({ ...prev, [id]: open }));
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* White Top Bar */}
      <div className="bg-white border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt={settings.club_name} className="h-10 w-10 object-contain" />
              ) : (
                <GraduationCap className="h-7 w-7 text-primary" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-foreground">{clubName}</span>
              <span className="text-xs text-muted-foreground leading-tight hidden sm:block">
                {settings?.college_name || 'AI&DS Department'}
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {settings?.phone && (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-primary" />{settings.phone}
              </a>
            )}
            {settings?.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <span className="text-primary">✉</span>{settings.email}
              </a>
            )}
          </div>

          <button className="lg:hidden p-2 rounded-lg hover:bg-muted text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <Marquee />

      {/* Desktop Navigation */}
      <nav className="hidden lg:block gradient-hero">
        <div className="container flex items-center justify-between py-0">
          <div className="flex items-center">
            {navTree?.map((item) => {
              if (item.children && item.children.length > 0) {
                const isOpen = openDropdowns[item.id] || false;
                const active = isInSection(item);
                return (
                  <DropdownMenu key={item.id} open={isOpen} onOpenChange={(o) => toggleDropdown(item.id, o)}>
                    <DropdownMenuTrigger asChild>
                      <button className={cn(
                        "flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all border-b-2",
                        active ? "text-white border-primary bg-white/10" : "text-white/90 border-transparent hover:text-white hover:bg-white/10"
                      )}>
                        {item.label}
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 bg-white border-border">
                      {item.children.map((child) => {
                        const Icon = getIcon(child.icon);
                        return (
                          <DropdownMenuItem key={child.id} asChild>
                            <Link to={child.href} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleDropdown(item.id, false)}>
                              <Icon className="h-4 w-4 text-primary" />
                              {child.label}
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              return (
                <Link key={item.id} to={item.href} className={cn(
                  "flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all border-b-2",
                  isActiveRoute(item.href) ? "text-white border-primary bg-white/10" : "text-white/90 border-transparent hover:text-white hover:bg-white/10"
                )}>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Login */}
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/10 hover:text-white">
                    <User className="h-4 w-4" />
                    {profile?.full_name?.split(' ')[0] || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-border">
                  {isAdminOrTeacher ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />My Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-background overflow-y-auto">
          <nav className="container py-4 space-y-1">
            {navTree?.map((item) => {
              const Icon = getIcon(item.icon);
              if (item.children && item.children.length > 0) {
                const active = isInSection(item);
                return (
                  <Collapsible key={item.id} open={mobileOpenSection === item.id} onOpenChange={() => setMobileOpenSection(mobileOpenSection === item.id ? null : item.id)}>
                    <CollapsibleTrigger className="w-full">
                      <div className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all",
                        active ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}>
                        <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{item.label}</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", mobileOpenSection === item.id && "rotate-180")} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                      <div className="pl-2 pt-1 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = getIcon(child.icon);
                          return (
                            <Link key={child.id} to={child.href} onClick={() => setIsMenuOpen(false)} className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all",
                              isActiveRoute(child.href) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                            )}>
                              <ChildIcon className="h-5 w-5" />{child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }
              return (
                <Link key={item.id} to={item.href} onClick={() => setIsMenuOpen(false)} className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all",
                  isActiveRoute(item.href) ? "bg-primary text-primary-foreground shadow-md" : "text-foreground hover:bg-primary/5"
                )}>
                  <Icon className="h-5 w-5" />{item.label}
                </Link>
              );
            })}

            <div className="my-4 border-t border-border" />

            {user ? (
              <div className="space-y-2 px-2">
                {isAdminOrTeacher ? (
                  <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                      <LayoutDashboard className="h-5 w-5" />Admin Panel
                    </Button>
                  </Link>
                ) : (
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                      <User className="h-5 w-5" />My Dashboard
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { signOut(); setIsMenuOpen(false); }}>
                  <LogOut className="h-5 w-5" />Logout
                </Button>
              </div>
            ) : (
              <div className="px-2">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base">
                    <User className="h-5 w-5 mr-2" />Account
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
