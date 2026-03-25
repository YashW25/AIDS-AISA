-- ============================================
-- 🚀 COMPLETE WEBSITE SETUP (BLUE THEME)
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS (SAFE)
-- ============================================
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- CLUBS (MAIN CONFIG + THEME)
-- ============================================
CREATE TABLE IF NOT EXISTS public.clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  full_name text NOT NULL,
  slug text UNIQUE NOT NULL,
  college_name text NOT NULL,

  -- 🎨 BLUE THEME
  primary_color text DEFAULT '#2563eb',
  secondary_color text DEFAULT '#60a5fa',
  gradient_from text DEFAULT '#f8fafc',
  gradient_via text DEFAULT '#dbeafe',
  gradient_to text DEFAULT '#93c5fd',

  logo_url text,
  email text,
  phone text,
  tagline text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name text,
  mobile text,
  branch text,
  year text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role DEFAULT 'student',
  UNIQUE(user_id, role)
);

-- ============================================
-- CONTENT TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  event_date timestamptz,
  location text,
  entry_fee decimal DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  role text,
  image_url text,
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text
);

CREATE TABLE IF NOT EXISTS public.quick_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  url text
);

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  message text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- EVENT SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_id uuid REFERENCES public.events(id),
  UNIQUE(user_id, event_id)
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  amount decimal,
  status text DEFAULT 'pending'
);

-- ============================================
-- FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin','teacher')
  );
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_events_time
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- RLS
-- ============================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role"
ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role"
ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public read events"
ON public.events FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage events"
ON public.events FOR ALL USING (public.is_admin());

CREATE POLICY "Public read announcements"
ON public.announcements FOR SELECT USING (true);

CREATE POLICY "User profile access"
ON public.user_profiles FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- STORAGE
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- ============================================
-- DEFAULT DATA
-- ============================================
INSERT INTO public.clubs (name, full_name, slug, college_name)
VALUES ('AISA', 'Artificial Intelligence and Data Science Students Association', 'aisa', 'AI&DS Department');

INSERT INTO public.announcements (content) VALUES
('🎉 Welcome to AISA Portal'),
('🚀 Event registrations open');

INSERT INTO public.events (title, description, event_date) VALUES
('Hackathon 2026', '24hr coding', now() + interval '5 days'),
('Workshop', 'AI Workshop', now() + interval '2 days');

INSERT INTO public.team_members (name, role) VALUES
('President', 'Lead'),
('Vice President', 'Co-Lead');

INSERT INTO public.quick_links (title, url) VALUES
('Home','/'),
('Events','/events'),
('Team','/team');

-- ============================================
-- DONE ✅
-- ============================================