
-- Migration 2: Multi-Tenant Architecture - Tables and Functions

-- 2.1 Create clubs table (Master table for all clubs)
CREATE TABLE public.clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  full_name text NOT NULL,
  slug text UNIQUE NOT NULL,
  college_name text NOT NULL,
  
  -- Branding
  logo_url text,
  primary_color text DEFAULT '#3b82f6',
  secondary_color text DEFAULT '#f59e0b',
  gradient_from text DEFAULT '#0f172a',
  gradient_via text DEFAULT '#1e3a5f',
  gradient_to text DEFAULT '#2563eb',
  
  -- Contact
  email text,
  phone text,
  address text,
  tagline text,
  
  -- Social Links
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  youtube_url text,
  twitter_url text,
  
  -- Domains (for URL detection)
  primary_domain text,
  staging_domain text,
  
  -- Status
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2.2 Create club_admins junction table
CREATE TABLE public.club_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'teacher')),
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(club_id, user_id)
);

-- 2.3 Add club_id to all content tables
ALTER TABLE public.hero_slides ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE;
ALTER TABLE public.announcements ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE;
ALTER TABLE public.about_features ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE;
ALTER TABLE public.stats ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE;
ALTER TABLE public.events ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE;
ALTER TABLE public.team_members ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE;
ALTER TABLE public.gallery ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE;
ALTER TABLE public.partners ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE;
ALTER TABLE public.downloads ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE;
ALTER TABLE public.news ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE;
ALTER TABLE public.popup_announcements ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE;
ALTER TABLE public.quick_links ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE;
ALTER TABLE public.charter_settings ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE;
ALTER TABLE public.alumni ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE;
ALTER TABLE public.user_profiles ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE SET NULL;

-- 2.4 Create indexes for performance
CREATE INDEX idx_hero_slides_club_id ON public.hero_slides(club_id);
CREATE INDEX idx_announcements_club_id ON public.announcements(club_id);
CREATE INDEX idx_about_features_club_id ON public.about_features(club_id);
CREATE INDEX idx_stats_club_id ON public.stats(club_id);
CREATE INDEX idx_events_club_id ON public.events(club_id);
CREATE INDEX idx_team_members_club_id ON public.team_members(club_id);
CREATE INDEX idx_gallery_club_id ON public.gallery(club_id);
CREATE INDEX idx_partners_club_id ON public.partners(club_id);
CREATE INDEX idx_downloads_club_id ON public.downloads(club_id);
CREATE INDEX idx_news_club_id ON public.news(club_id);
CREATE INDEX idx_popup_announcements_club_id ON public.popup_announcements(club_id);
CREATE INDEX idx_quick_links_club_id ON public.quick_links(club_id);
CREATE INDEX idx_charter_settings_club_id ON public.charter_settings(club_id);
CREATE INDEX idx_alumni_club_id ON public.alumni(club_id);
CREATE INDEX idx_user_profiles_club_id ON public.user_profiles(club_id);
CREATE INDEX idx_club_admins_club_id ON public.club_admins(club_id);
CREATE INDEX idx_club_admins_user_id ON public.club_admins(user_id);

-- 2.5 Create security functions

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
$$;

-- Get all clubs a user is admin of
CREATE OR REPLACE FUNCTION public.get_user_clubs(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT club_id FROM public.club_admins WHERE user_id = _user_id
$$;

-- Check if user is admin of a specific club
CREATE OR REPLACE FUNCTION public.is_club_admin(_club_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_admins 
    WHERE user_id = auth.uid() AND club_id = _club_id
  ) OR public.is_super_admin()
$$;

-- Check if user is admin of ANY club (for general admin access)
CREATE OR REPLACE FUNCTION public.is_any_club_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_admins 
    WHERE user_id = auth.uid()
  ) OR public.is_super_admin()
$$;

-- 2.6 Enable RLS on new tables
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_admins ENABLE ROW LEVEL SECURITY;

-- 2.7 RLS Policies for clubs table
CREATE POLICY "Public can read active clubs"
ON public.clubs FOR SELECT
USING (is_active = true);

CREATE POLICY "Super admins can manage all clubs"
ON public.clubs FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- 2.8 RLS Policies for club_admins table
CREATE POLICY "Super admins can manage all club admins"
ON public.club_admins FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Club admins can view their club's admins"
ON public.club_admins FOR SELECT
USING (public.is_club_admin(club_id));

-- 2.9 Update RLS policies for content tables to include club filtering

-- hero_slides
DROP POLICY IF EXISTS "Admins can manage hero slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Public can read hero slides" ON public.hero_slides;

CREATE POLICY "Club admins can manage their hero slides"
ON public.hero_slides FOR ALL
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Public can read active hero slides"
ON public.hero_slides FOR SELECT
USING (is_active = true);

-- announcements
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Public can read announcements" ON public.announcements;

CREATE POLICY "Club admins can manage their announcements"
ON public.announcements FOR ALL
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Public can read active announcements"
ON public.announcements FOR SELECT
USING (is_active = true);

-- about_features
DROP POLICY IF EXISTS "Admins can manage about features" ON public.about_features;
DROP POLICY IF EXISTS "Public can read about features" ON public.about_features;

CREATE POLICY "Club admins can manage their about features"
ON public.about_features FOR ALL
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Public can read active about features"
ON public.about_features FOR SELECT
USING (is_active = true);

-- stats
DROP POLICY IF EXISTS "Admins can manage stats" ON public.stats;
DROP POLICY IF EXISTS "Public can read stats" ON public.stats;

CREATE POLICY "Club admins can manage their stats"
ON public.stats FOR ALL
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Public can read active stats"
ON public.stats FOR SELECT
USING (is_active = true);

-- events
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Public can read events" ON public.events;

CREATE POLICY "Club admins can manage their events"
ON public.events FOR ALL
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Public can read active events"
ON public.events FOR SELECT
USING (is_active = true);

-- team_members
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Public can read team members" ON public.team_members;

CREATE POLICY "Club admins can manage their team members"
ON public.team_members FOR ALL
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Public can read active team members"
ON public.team_members FOR SELECT
USING (is_active = true);

-- gallery
DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;
DROP POLICY IF EXISTS "Public can read gallery" ON public.gallery;

CREATE POLICY "Club admins can manage their gallery"
ON public.gallery FOR ALL
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Public can read active gallery"
ON public.gallery FOR SELECT
USING (is_active = true);

-- partners
DROP POLICY IF EXISTS "Admins can manage partners" ON public.partners;
DROP POLICY IF EXISTS "Public can read partners" ON public.partners;

CREATE POLICY "Club admins can manage their partners"
ON public.partners FOR ALL
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Public can read active partners"
ON public.partners FOR SELECT
USING (is_active = true);

-- downloads
DROP POLICY IF EXISTS "Admins can manage downloads" ON public.downloads;
DROP POLICY IF EXISTS "Public can read downloads" ON public.downloads;

CREATE POLICY "Club admins can manage their downloads"
ON public.downloads FOR ALL
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Public can read active downloads"
ON public.downloads FOR SELECT
USING (is_active = true);

-- news
DROP POLICY IF EXISTS "Admins can manage news" ON public.news;
DROP POLICY IF EXISTS "Public can read active news" ON public.news;

CREATE POLICY "Club admins can manage their news"
ON public.news FOR ALL
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Public can read active news"
ON public.news FOR SELECT
USING (is_active = true);

-- popup_announcements
DROP POLICY IF EXISTS "Admins can manage popups" ON public.popup_announcements;
DROP POLICY IF EXISTS "Public can read active popups" ON public.popup_announcements;

CREATE POLICY "Club admins can manage their popups"
ON public.popup_announcements FOR ALL
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Public can read active popups"
ON public.popup_announcements FOR SELECT
USING (is_active = true);

-- quick_links
DROP POLICY IF EXISTS "Admins can manage quick links" ON public.quick_links;
DROP POLICY IF EXISTS "Public can read quick links" ON public.quick_links;

CREATE POLICY "Club admins can manage their quick links"
ON public.quick_links FOR ALL
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Public can read active quick links"
ON public.quick_links FOR SELECT
USING (is_active = true);

-- charter_settings
DROP POLICY IF EXISTS "Admins can manage charter" ON public.charter_settings;
DROP POLICY IF EXISTS "Public can read charter" ON public.charter_settings;

CREATE POLICY "Club admins can manage their charter"
ON public.charter_settings FOR ALL
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Public can read charter"
ON public.charter_settings FOR SELECT
USING (true);

-- alumni
DROP POLICY IF EXISTS "Admins can manage alumni" ON public.alumni;
DROP POLICY IF EXISTS "Public can read alumni" ON public.alumni;

CREATE POLICY "Club admins can manage their alumni"
ON public.alumni FOR ALL
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Public can read active alumni"
ON public.alumni FOR SELECT
USING (is_active = true);

-- Update user_profiles policies to include club context
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

CREATE POLICY "Club admins can view profiles in their club"
ON public.user_profiles FOR SELECT
USING (public.is_club_admin(club_id) OR public.is_super_admin() OR auth.uid() = user_id);

CREATE POLICY "Club admins can manage profiles in their club"
ON public.user_profiles FOR UPDATE
USING (public.is_club_admin(club_id) OR public.is_super_admin());

CREATE POLICY "Club admins can delete profiles in their club"
ON public.user_profiles FOR DELETE
USING (public.is_club_admin(club_id) OR public.is_super_admin());

-- Add trigger for clubs updated_at
CREATE TRIGGER update_clubs_updated_at
BEFORE UPDATE ON public.clubs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
