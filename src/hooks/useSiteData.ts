import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SiteSettings, Announcement, HeroSlide, AboutFeature, Stat, Event, TeamMember, GalleryItem, QuickLink, Partner, Occasion } from '@/types/database';

// Fetch site settings directly from site_settings table (single-club mode)
export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SiteSettings | null;
    },
  });
};

export const useAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      if (error) throw error;
      return data as Announcement[];
    },
  });
};

export const useHeroSlides = () => {
  return useQuery({
    queryKey: ['hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      if (error) throw error;
      return data as HeroSlide[];
    },
  });
};

export const useAboutFeatures = () => {
  return useQuery({
    queryKey: ['about-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_features')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      if (error) throw error;
      return data as AboutFeature[];
    },
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stats')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      if (error) throw error;
      return data as Stat[];
    },
  });
};

export const useEvents = (past?: boolean) => {
  return useQuery({
    queryKey: ['events', past],
    queryFn: async () => {
      const now = new Date().toISOString();
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_active', true);
      
      if (past === true) {
        query = query.lt('event_date', now).order('event_date', { ascending: false });
      } else if (past === false) {
        query = query.gte('event_date', now).order('event_date', { ascending: true });
      } else {
        query = query.order('event_date', { ascending: false });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    },
  });
};

export const useTeamMembers = (category?: string) => {
  return useQuery({
    queryKey: ['team-members', category],
    queryFn: async () => {
      let query = supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as TeamMember[];
    },
  });
};

export const useGallery = (category?: string) => {
  return useQuery({
    queryKey: ['gallery', category],
    queryFn: async () => {
      let query = supabase
        .from('gallery')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
};

export const useQuickLinks = (category?: string) => {
  return useQuery({
    queryKey: ['quick-links', category],
    queryFn: async () => {
      let query = supabase
        .from('quick_links')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
};

export const usePartners = () => {
  return useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      if (error) throw error;
      return data as Partner[];
    },
  });
};

export const useCharterSettings = () => {
  return useQuery({
    queryKey: ['charter-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('charter_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

export const useNews = (marqueeOnly?: boolean) => {
  return useQuery({
    queryKey: ['news', marqueeOnly],
    queryFn: async () => {
      let query = supabase
        .from('news')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      
      if (marqueeOnly) {
        query = query.eq('is_marquee', true);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching news:', error);
        return [] as any[];
      }
      return (data || []) as any[];
    },
  });
};

export const useDownloads = () => {
  return useQuery({
    queryKey: ['downloads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      if (error) {
        console.error('Error fetching downloads:', error);
        return [] as any[];
      }
      return (data || []) as any[];
    },
  });
};

export const useAlumni = () => {
  return useQuery({
    queryKey: ['alumni'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alumni')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      if (error) {
        console.error('Error fetching alumni:', error);
        return [] as any[];
      }
      return (data || []) as any[];
    },
  });
};

export const usePopupAnnouncements = () => {
  return useQuery({
    queryKey: ['popup-announcements'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('popup_announcements')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('position', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useOccasions = (category?: string) => {
  return useQuery({
    queryKey: ['occasions', category],
    queryFn: async () => {
      let query = supabase
        .from('occasions')
        .select('*')
        .eq('is_active', true)
        .order('occasion_date', { ascending: false });
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching occasions:', error);
        return [] as Occasion[];
      }
      return (data || []) as Occasion[];
    },
  });
};
