-- File: 20251129101820_0405e734-11e1-4582-8c57-c6a49195b3f7.sql
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

-- File: 20251129101830_3ac49188-6d29-4efe-acfb-0033affe0fc9.sql
-- Fix function search path
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
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

-- File: 20251129104647_287bdb0c-adc7-426f-a875-40fb81a6ab4a.sql
-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Allow public read access to images
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Allow admins to upload images
CREATE POLICY "Admins can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND public.is_admin());

-- Allow admins to update images
CREATE POLICY "Admins can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND public.is_admin());

-- Allow admins to delete images
CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND public.is_admin());

-- File: 20251129111539_547dba08-5344-49ee-b44e-a2ccf5585b8b.sql
-- Add entry_fee to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS entry_fee decimal(10,2) DEFAULT 0;

-- Create user_profiles table for registered users
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text NOT NULL,
  mobile text NOT NULL,
  enrollment_number text NOT NULL UNIQUE,
  year text NOT NULL,
  branch text NOT NULL,
  college text NOT NULL,
  avatar_url text,
  is_profile_complete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create event_registrations table
CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  registration_status text DEFAULT 'pending' CHECK (registration_status IN ('pending', 'confirmed', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_registration_id uuid REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cashfree', 'manual', 'free')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id text,
  payment_gateway_response jsonb,
  receipt_number text UNIQUE,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create certificates table
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  certificate_type text NOT NULL CHECK (certificate_type IN ('participation', 'winner', 'runner_up', 'special')),
  certificate_url text,
  certificate_number text UNIQUE,
  issued_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, event_id, certificate_type)
);

-- Create event_winners table for tracking winners
CREATE TABLE public.event_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  position integer NOT NULL CHECK (position >= 1),
  prize_details text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(event_id, user_id),
  UNIQUE(event_id, position)
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_winners ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.user_profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage profiles" ON public.user_profiles FOR ALL USING (is_admin());

-- Event registrations policies
CREATE POLICY "Users can view own registrations" ON public.event_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register for events" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own registration" ON public.event_registrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage registrations" ON public.event_registrations FOR ALL USING (is_admin());

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (is_admin());

-- Certificates policies
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage certificates" ON public.certificates FOR ALL USING (is_admin());

-- Event winners policies
CREATE POLICY "Public can view winners" ON public.event_winners FOR SELECT USING (true);
CREATE POLICY "Admins can manage winners" ON public.event_winners FOR ALL USING (is_admin());

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON public.event_registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND NEW.receipt_number IS NULL THEN
    NEW.receipt_number := 'CESA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_payment_receipt BEFORE INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION generate_receipt_number();

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.certificate_number IS NULL THEN
    NEW.certificate_number := 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || SUBSTRING(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_cert_number BEFORE INSERT ON public.certificates FOR EACH ROW EXECUTE FUNCTION generate_certificate_number();

-- File: 20251129113244_cd9f8ca9-699c-40f6-99d2-25dc18af88e6.sql
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Function to auto-assign student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

-- Trigger to assign role on user creation
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- File: 20251129114516_ce660c59-c3b5-4816-9c5c-39e47bf4026d.sql
-- Update is_admin function to check user_roles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'teacher')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- File: 20251129132300_268b48ce-64df-4dd1-b512-d9cde7630511.sql
-- Create popup_announcements table
CREATE TABLE public.popup_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT DEFAULT 'Register Now',
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.popup_announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read active popups" ON public.popup_announcements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage popups" ON public.popup_announcements
  FOR ALL USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_popup_announcements_updated_at
  BEFORE UPDATE ON public.popup_announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- File: 20251129180539_c30dea5e-82b2-4cd9-bd4a-7d226f939119.sql
-- Create alumni table
CREATE TABLE public.alumni (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  graduation_year TEXT NOT NULL,
  branch TEXT,
  company TEXT,
  job_title TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  testimonial TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read alumni"
ON public.alumni
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage alumni"
ON public.alumni
FOR ALL
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_alumni_updated_at
BEFORE UPDATE ON public.alumni
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- File: 20251129184928_5d93ad6d-838a-4c28-a525-357589501af8.sql
-- Add drive_folder_link column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS drive_folder_link text;

-- Add comment for documentation
COMMENT ON COLUMN public.events.drive_folder_link IS 'Google Drive folder link for event photos';

-- File: 20251130151320_f7b71081-ba50-47c4-9f88-8a86f8a954cc.sql
-- Add actual_participants column to track how many actually participated
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS actual_participants integer DEFAULT 0;

-- File: 20251202161401_a251cf41-251e-454f-afdb-b43b1d497b30.sql
-- 1. Create charter_settings table for CESA Charter document
CREATE TABLE public.charter_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT 'CESA Charter',
  description text,
  file_url text,
  drive_url text,
  file_type text DEFAULT 'pdf',
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.charter_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can read charter" ON public.charter_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage charter" ON public.charter_settings FOR ALL USING (is_admin());

-- Insert default row
INSERT INTO public.charter_settings (title, description) VALUES ('CESA Charter', 'Official CESA Charter Document');

-- 2. Create news table for News/Marquee (short-term current events)
CREATE TABLE public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text,
  image_url text,
  attachment_url text,
  attachment_type text,
  published_date timestamp with time zone DEFAULT now(),
  expire_date timestamp with time zone,
  is_marquee boolean DEFAULT false,
  is_active boolean DEFAULT true,
  position integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can read active news" ON public.news FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage news" ON public.news FOR ALL USING (is_admin());

-- 3. Create downloads table for downloadable files
CREATE TABLE public.downloads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  file_url text,
  drive_url text,
  file_type text DEFAULT 'pdf',
  file_size text,
  category text DEFAULT 'general',
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can read downloads" ON public.downloads FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage downloads" ON public.downloads FOR ALL USING (is_admin());

-- Add triggers for updated_at
CREATE TRIGGER update_charter_settings_updated_at BEFORE UPDATE ON public.charter_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_downloads_updated_at BEFORE UPDATE ON public.downloads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- File: 20251204141133_74789ad6-6049-4732-8536-3157856e57cd.sql
-- Migration 1: Add super_admin to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- File: 20251204141220_be71a8fe-a36b-476a-a98f-1a6bee3224fc.sql

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


-- File: 20251204182011_38d68a7b-856f-467f-875c-bc5773cc3980.sql
-- Add is_suspended column to clubs table for payment pending feature
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS suspension_reason text;

-- Fix Innovation Cell admin - remove duplicate student role
DELETE FROM public.user_roles 
WHERE user_id = 'b4adb301-3c53-4331-9b20-31bafd73e75b' 
AND role = 'student';

-- File: 20251204190441_77eaf02b-253c-43fb-92fe-1e3369e6dbf6.sql
-- Allow club admins to update their own club's settings
CREATE POLICY "Club admins can update their own club" 
ON public.clubs 
FOR UPDATE 
USING (is_club_admin(id))
WITH CHECK (is_club_admin(id));

-- File: 20251206174610_1a97ff35-c0f3-4817-a5e7-3a18f2bc8ae4.sql
-- Create occasions table for general events like farewell, teachers day, etc.
CREATE TABLE public.occasions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id),
  title TEXT NOT NULL,
  description TEXT,
  occasion_date DATE,
  category TEXT DEFAULT 'celebration',
  drive_folder_link TEXT,
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;

-- Public can read active occasions
CREATE POLICY "Public can read active occasions"
ON public.occasions
FOR SELECT
USING (is_active = true);

-- Club admins can manage their occasions
CREATE POLICY "Club admins can manage their occasions"
ON public.occasions
FOR ALL
USING (is_club_admin(club_id) OR is_super_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_occasions_updated_at
BEFORE UPDATE ON public.occasions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- File: 20251211141510_76171078-76d9-41a3-9490-3cce38d0410a.sql
-- Create certificate templates table
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES public.clubs(id),
  event_id uuid REFERENCES public.events(id),
  template_name text NOT NULL,
  template_url text NOT NULL,
  name_position_x integer DEFAULT 50,
  name_position_y integer DEFAULT 50,
  date_position_x integer DEFAULT 50,
  date_position_y integer DEFAULT 65,
  cert_number_position_x integer DEFAULT 85,
  cert_number_position_y integer DEFAULT 90,
  qr_position_x integer DEFAULT 10,
  qr_position_y integer DEFAULT 80,
  rank_position_x integer DEFAULT 50,
  rank_position_y integer DEFAULT 45,
  font_size integer DEFAULT 24,
  font_color text DEFAULT '#000000',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for certificate templates
CREATE POLICY "Club admins can manage their templates" 
ON public.certificate_templates 
FOR ALL 
USING (is_club_admin(club_id) OR is_super_admin());

CREATE POLICY "Public can read active templates" 
ON public.certificate_templates 
FOR SELECT 
USING (is_active = true);

-- Add certificate_url column to certificates if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'certificates' AND column_name = 'certificate_url'
  ) THEN
    ALTER TABLE public.certificates ADD COLUMN certificate_url text;
  END IF;
END $$;

-- Add rank column to certificates for position (1st, 2nd, 3rd, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'certificates' AND column_name = 'rank'
  ) THEN
    ALTER TABLE public.certificates ADD COLUMN rank text;
  END IF;
END $$;

-- Add template_id to certificates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'certificates' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE public.certificates ADD COLUMN template_id uuid REFERENCES public.certificate_templates(id);
  END IF;
END $$;

-- Create trigger for updated_at
CREATE TRIGGER update_certificate_templates_updated_at
BEFORE UPDATE ON public.certificate_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- File: 20260212183248_88f6c728-f957-4441-bd0a-2ddb1c54db4d.sql

-- Drop and recreate admin policies for all content tables to not require club_id

-- announcements
DROP POLICY IF EXISTS "Club admins can manage their announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- about_features
DROP POLICY IF EXISTS "Club admins can manage their about features" ON public.about_features;
CREATE POLICY "Admins can manage about features" ON public.about_features FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- alumni
DROP POLICY IF EXISTS "Club admins can manage their alumni" ON public.alumni;
CREATE POLICY "Admins can manage alumni" ON public.alumni FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- hero_slides
DROP POLICY IF EXISTS "Club admins can manage their hero slides" ON public.hero_slides;
CREATE POLICY "Admins can manage hero slides" ON public.hero_slides FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- events
DROP POLICY IF EXISTS "Club admins can manage their events" ON public.events;
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- gallery
DROP POLICY IF EXISTS "Club admins can manage their gallery" ON public.gallery;
CREATE POLICY "Admins can manage gallery" ON public.gallery FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- partners
DROP POLICY IF EXISTS "Club admins can manage their partners" ON public.partners;
CREATE POLICY "Admins can manage partners" ON public.partners FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- team_members
DROP POLICY IF EXISTS "Club admins can manage their team members" ON public.team_members;
CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- stats
DROP POLICY IF EXISTS "Club admins can manage their stats" ON public.stats;
CREATE POLICY "Admins can manage stats" ON public.stats FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- news
DROP POLICY IF EXISTS "Club admins can manage their news" ON public.news;
CREATE POLICY "Admins can manage news" ON public.news FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- downloads
DROP POLICY IF EXISTS "Club admins can manage their downloads" ON public.downloads;
CREATE POLICY "Admins can manage downloads" ON public.downloads FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- occasions
DROP POLICY IF EXISTS "Club admins can manage their occasions" ON public.occasions;
CREATE POLICY "Admins can manage occasions" ON public.occasions FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- popup_announcements
DROP POLICY IF EXISTS "Club admins can manage their popups" ON public.popup_announcements;
CREATE POLICY "Admins can manage popups" ON public.popup_announcements FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- charter_settings
DROP POLICY IF EXISTS "Club admins can manage their charter" ON public.charter_settings;
CREATE POLICY "Admins can manage charter" ON public.charter_settings FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- quick_links
DROP POLICY IF EXISTS "Club admins can manage their quick links" ON public.quick_links;
CREATE POLICY "Admins can manage quick links" ON public.quick_links FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- certificate_templates
DROP POLICY IF EXISTS "Club admins can manage their templates" ON public.certificate_templates;
CREATE POLICY "Admins can manage templates" ON public.certificate_templates FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- user_profiles - update club admin policies
DROP POLICY IF EXISTS "Club admins can view profiles in their club" ON public.user_profiles;
DROP POLICY IF EXISTS "Club admins can manage profiles in their club" ON public.user_profiles;
DROP POLICY IF EXISTS "Club admins can delete profiles in their club" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles" ON public.user_profiles FOR SELECT USING (is_any_club_admin() OR (auth.uid() = user_id));
CREATE POLICY "Admins can update all profiles" ON public.user_profiles FOR UPDATE USING (is_any_club_admin() OR (auth.uid() = user_id));
CREATE POLICY "Admins can delete profiles" ON public.user_profiles FOR DELETE USING (is_any_club_admin());


-- File: 20260213051623_b7811b3f-5c90-4713-9878-ac1f45790251.sql

-- Update is_any_club_admin to also check user_roles for admin/teacher roles
CREATE OR REPLACE FUNCTION public.is_any_club_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_admins 
    WHERE user_id = auth.uid()
  ) OR public.is_super_admin() OR public.is_admin()
$$;


-- File: 20260213061643_5c533da3-272a-4595-b49f-722cd995d7b4.sql
UPDATE storage.buckets SET file_size_limit = NULL WHERE id = 'images';

-- File: 20260214052450_d807239c-d758-44b7-a015-e296421a91b9.sql

-- Create visitor counter table
CREATE TABLE public.visitor_counter (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  count bigint NOT NULL DEFAULT 2300,
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert initial row
INSERT INTO public.visitor_counter (count) VALUES (2300);

-- Enable RLS
ALTER TABLE public.visitor_counter ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Public can read visitor count" ON public.visitor_counter FOR SELECT USING (true);

-- Create increment function
CREATE OR REPLACE FUNCTION public.increment_visitor_count()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  UPDATE public.visitor_counter
  SET count = count + 1, updated_at = now()
  WHERE id = (SELECT id FROM public.visitor_counter LIMIT 1)
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;


-- File: 20260215154923_13bfcf13-1321-46c1-9d44-d9f2f0911e46.sql

-- Create team_categories table
CREATE TABLE public.team_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  label text NOT NULL,
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_categories ENABLE ROW LEVEL SECURITY;

-- Public can read active categories
CREATE POLICY "Public can read active team categories"
ON public.team_categories FOR SELECT
USING (is_active = true);

-- Admins can manage categories
CREATE POLICY "Admins can manage team categories"
ON public.team_categories FOR ALL
USING (is_any_club_admin())
WITH CHECK (is_any_club_admin());

-- Insert default categories
INSERT INTO public.team_categories (name, label, position) VALUES
  ('faculty', 'Faculty Coordinator', 0),
  ('core', 'Core Team', 1),
  ('technical', 'Technical Team', 2),
  ('media', 'Media Team', 3),
  ('cultural', 'Cultural Team', 4),
  ('sports', 'Sports Team', 5);

-- Add trigger for updated_at
CREATE TRIGGER update_team_categories_updated_at
BEFORE UPDATE ON public.team_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- File: 20260215155757_4ff16143-934a-407d-b82a-c3de6553544f.sql

-- Create contact submissions table
CREATE TABLE public.contact_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact form
CREATE POLICY "Public can submit contact form"
ON public.contact_submissions
FOR INSERT
WITH CHECK (true);

-- Admins can read all submissions
CREATE POLICY "Admins can read contact submissions"
ON public.contact_submissions
FOR SELECT
USING (is_any_club_admin());

-- Admins can update submissions (status, priority, notes)
CREATE POLICY "Admins can update contact submissions"
ON public.contact_submissions
FOR UPDATE
USING (is_any_club_admin());

-- Admins can delete submissions
CREATE POLICY "Admins can delete contact submissions"
ON public.contact_submissions
FOR DELETE
USING (is_any_club_admin());

-- Trigger for updated_at
CREATE TRIGGER update_contact_submissions_updated_at
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- File: 20260216161948_f1eabb5f-daec-4429-8be2-465d7c61e235.sql

-- Navigation items table
CREATE TABLE public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL DEFAULT '/',
  icon text DEFAULT 'FileText',
  parent_id uuid REFERENCES public.nav_items(id) ON DELETE CASCADE,
  page_type text NOT NULL DEFAULT 'built_in', -- 'built_in' or 'custom'
  custom_page_id uuid,
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Custom pages table
CREATE TABLE public.custom_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text DEFAULT '',
  meta_description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add FK from nav_items to custom_pages
ALTER TABLE public.nav_items
  ADD CONSTRAINT nav_items_custom_page_id_fkey
  FOREIGN KEY (custom_page_id) REFERENCES public.custom_pages(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

-- Nav items policies
CREATE POLICY "Public can read active nav items"
  ON public.nav_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage nav items"
  ON public.nav_items FOR ALL
  USING (is_any_club_admin())
  WITH CHECK (is_any_club_admin());

-- Custom pages policies
CREATE POLICY "Public can read active custom pages"
  ON public.custom_pages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage custom pages"
  ON public.custom_pages FOR ALL
  USING (is_any_club_admin())
  WITH CHECK (is_any_club_admin());

-- Triggers for updated_at
CREATE TRIGGER update_nav_items_updated_at
  BEFORE UPDATE ON public.nav_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_pages_updated_at
  BEFORE UPDATE ON public.custom_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default nav items matching current header
INSERT INTO public.nav_items (label, href, icon, parent_id, page_type, position) VALUES
  ('Home', '/', 'Home', NULL, 'built_in', 0),
  ('About Us', '#', 'Info', NULL, 'built_in', 1),
  ('Events', '/events', 'Calendar', NULL, 'built_in', 3),
  ('Team', '/team', 'Users', NULL, 'built_in', 4),
  ('Gallery', '/gallery', 'Image', NULL, 'built_in', 5),
  ('Download', '#', 'Download', NULL, 'built_in', 6),
  ('Contact Us', '/contact', 'Phone', NULL, 'built_in', 8);

-- Insert children for About Us
INSERT INTO public.nav_items (label, href, icon, parent_id, page_type, position)
SELECT 'About Club', '/about', 'Info', id, 'built_in', 0 FROM public.nav_items WHERE label = 'About Us' AND parent_id IS NULL;

INSERT INTO public.nav_items (label, href, icon, parent_id, page_type, position)
SELECT 'Our Partners', '/partners', 'Handshake', id, 'built_in', 1 FROM public.nav_items WHERE label = 'About Us' AND parent_id IS NULL;

-- Insert children for Download
INSERT INTO public.nav_items (label, href, icon, parent_id, page_type, position)
SELECT 'Certificates', '/certificates', 'Award', id, 'built_in', 0 FROM public.nav_items WHERE label = 'Download' AND parent_id IS NULL;

INSERT INTO public.nav_items (label, href, icon, parent_id, page_type, position)
SELECT 'Charter', '/charter', 'FileText', id, 'built_in', 1 FROM public.nav_items WHERE label = 'Download' AND parent_id IS NULL;

INSERT INTO public.nav_items (label, href, icon, parent_id, page_type, position)
SELECT 'Notice', '/notice', 'Bell', id, 'built_in', 2 FROM public.nav_items WHERE label = 'Download' AND parent_id IS NULL;

INSERT INTO public.nav_items (label, href, icon, parent_id, page_type, position)
SELECT 'Downloads', '/downloads', 'Download', id, 'built_in', 3 FROM public.nav_items WHERE label = 'Download' AND parent_id IS NULL;


