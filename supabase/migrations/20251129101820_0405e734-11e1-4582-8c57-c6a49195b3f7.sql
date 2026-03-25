-- Club website settings table
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_name TEXT NOT NULL DEFAULT 'CESA',
  club_full_name TEXT NOT NULL DEFAULT 'Computer Engineering Students Association',
  college_name TEXT NOT NULL DEFAULT 'ISBM College of Engineering',
  logo_url TEXT,
  tagline TEXT DEFAULT 'Empowering future tech leaders through innovation, collaboration, and excellence in computer engineering education.',
  email TEXT DEFAULT 'cesa@isbmcoe.org',
  phone TEXT DEFAULT '+91 1234567890',
  address TEXT DEFAULT 'ISBM College of Engineering, Nande, Pune, Maharashtra 412115',
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  youtube_url TEXT,
  twitter_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Announcements/Marquee table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Hero Slider table
CREATE TABLE public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  button_text TEXT,
  button_link TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- About features table
CREATE TABLE public.about_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'star',
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stats/Impact numbers table
CREATE TABLE public.stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT DEFAULT 'users',
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'technical',
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'core',
  image_url TEXT,
  email TEXT,
  linkedin_url TEXT,
  skills TEXT[],
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Gallery table
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quick links table
CREATE TABLE public.quick_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'quick_links',
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Partners table
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admin users role enum and table
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin', 'editor');

CREATE TABLE public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role admin_role DEFAULT 'editor',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Public read policies for website content
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public can read announcements" ON public.announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read hero slides" ON public.hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read about features" ON public.about_features FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read stats" ON public.stats FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read events" ON public.events FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read team members" ON public.team_members FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read gallery" ON public.gallery FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read quick links" ON public.quick_links FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read partners" ON public.partners FOR SELECT USING (is_active = true);

-- Admin function to check role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND is_active = true
  )
$$;

-- Admin write policies
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage hero slides" ON public.hero_slides FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage about features" ON public.about_features FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage stats" ON public.stats FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage gallery" ON public.gallery FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage quick links" ON public.quick_links FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage partners" ON public.partners FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can view own profile" ON public.admin_profiles FOR SELECT USING (id = auth.uid());

-- Insert default data
INSERT INTO public.site_settings (club_name, club_full_name, college_name, tagline, email, phone, address) VALUES 
('CESA', 'Computer Engineering Students Association', 'ISBM College of Engineering', 
'Empowering future tech leaders through innovation, collaboration, and excellence in computer engineering education.',
'cesa@isbmcoe.org', '+91 1234567890', 'ISBM College of Engineering, Nande, Pune, Maharashtra 412115');

INSERT INTO public.announcements (content, position) VALUES 
('🎉 Welcome to CESA - Computer Engineering Students Association!', 1),
('📢 Upcoming Event: CodeStorm 2.0 - Annual Coding Competition', 2),
('🏆 CESA awarded Best Technical Club 2024', 3);

INSERT INTO public.stats (label, value, icon, position) VALUES 
('Active Members', '500+', 'users', 1),
('Events Organized', '50+', 'calendar', 2),
('Certificates Issued', '1000+', 'award', 3),
('Industry Partners', '10+', 'building', 4);

INSERT INTO public.about_features (title, description, icon, position) VALUES 
('NAAC B++ Accredited', 'Highest quality standards achieved', 'award', 1),
('Expert Faculty', 'Industry experienced professors', 'graduation-cap', 2),
('Extended Library Hours', 'Pioneer in 24/7 library access', 'book-open', 3),
('Industry Partnerships', 'MOUs with leading companies', 'handshake', 4),
('Project Based Learning', 'Live projects with industry', 'code', 5),
('Career Growth', 'Comprehensive placement training', 'trending-up', 6);

INSERT INTO public.team_members (name, role, description, category, skills, position) VALUES 
('Dr. Vilas R. Joshi', 'Faculty Coordinator', 'Associate Professor & CESA Faculty Coordinator', 'faculty', ARRAY['Leadership', 'Research', 'Mentoring'], 1),
('Vedanth Bakwad', 'President', 'Student leader and president of CESA', 'core', ARRAY['Leadership', 'Management', 'Communication'], 2),
('Gaurav Singh', 'Vice President', 'Vice President of CESA', 'core', ARRAY['Leadership', 'Event Management', 'Teamwork'], 3),
('Anuj Gurap', 'Technical Head', 'Technical lead responsible for all technical activities', 'technical', ARRAY['Programming', 'Web Development', 'System Design'], 4),
('Shreeyash Mandage', 'Media Head', 'Media head responsible for all media and design activities', 'media', ARRAY['Design', 'Photography', 'Video Editing'], 5);

INSERT INTO public.quick_links (title, url, category, position) VALUES 
('Home', '/', 'quick_links', 1),
('About Us', '/about', 'quick_links', 2),
('Events', '/events', 'quick_links', 3),
('Team', '/team', 'quick_links', 4),
('Gallery', '/gallery', 'quick_links', 5),
('CESA Charter', '#', 'resources', 1),
('Student Portal', '#', 'resources', 2),
('Downloads', '#', 'resources', 3),
('FAQs', '#', 'resources', 4);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_about_features_updated_at BEFORE UPDATE ON public.about_features FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stats_updated_at BEFORE UPDATE ON public.stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON public.gallery FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quick_links_updated_at BEFORE UPDATE ON public.quick_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON public.admin_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();