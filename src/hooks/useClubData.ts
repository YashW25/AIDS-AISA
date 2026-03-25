import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  HeroSlide, 
  Announcement, 
  AboutFeature, 
  Stat, 
  Event, 
  TeamMember, 
  GalleryItem, 
  Partner, 
  QuickLink 
} from '@/types/database';

// All hooks now fetch data without club_id filtering (single-club mode)

export const useClubHeroSlides = () => {
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

export const useClubAnnouncements = () => {
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

export const useClubAboutFeatures = () => {
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

export const useClubStats = () => {
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

export const useClubEvents = (past?: boolean) => {
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

export const useClubTeamMembers = (category?: string) => {
  return useQuery({
    queryKey: ['team-members', category],
    queryFn: async () => {
      let query = supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      query = query.order('position', { ascending: true });
      
      const { data, error } = await query;
      if (error) throw error;
      return data as TeamMember[];
    },
  });
};

export const useClubGallery = (category?: string) => {
  return useQuery({
    queryKey: ['gallery', category],
    queryFn: async () => {
      let query = supabase
        .from('gallery')
        .select('*')
        .eq('is_active', true);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      query = query.order('position', { ascending: true });
      
      const { data, error } = await query;
      if (error) throw error;
      return data as GalleryItem[];
    },
  });
};

export const useClubPartners = () => {
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

export const useClubQuickLinks = (category?: string) => {
  return useQuery({
    queryKey: ['quick-links', category],
    queryFn: async () => {
      let query = supabase
        .from('quick_links')
        .select('*')
        .eq('is_active', true);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      query = query.order('position', { ascending: true });
      
      const { data, error } = await query;
      if (error) throw error;
      return data as QuickLink[];
    },
  });
};

export const useClubNews = (marqueeOnly?: boolean) => {
  return useQuery({
    queryKey: ['news', marqueeOnly],
    queryFn: async () => {
      let query = supabase
        .from('news')
        .select('*')
        .eq('is_active', true);
      
      if (marqueeOnly) {
        query = query.eq('is_marquee', true);
      }
      
      query = query.order('published_date', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useClubDownloads = () => {
  return useQuery({
    queryKey: ['downloads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useClubAlumni = () => {
  return useQuery({
    queryKey: ['alumni'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alumni')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useClubCharter = () => {
  return useQuery({
    queryKey: ['charter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('charter_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });
};

export const useClubPopupAnnouncements = () => {
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
