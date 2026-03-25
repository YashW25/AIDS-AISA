-- =====================================================
-- AISA Club Website - Schema Fix & Seed Data
-- Run this in your Supabase SQL Editor
-- Safe to re-run multiple times (all statements are idempotent)
-- =====================================================

-- =====================================================
-- STEP 0: ENSURE ALL CORE TABLES EXIST FIRST
-- (Must come before any ALTER TABLE statements)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    club_name TEXT DEFAULT 'AISA',
    club_full_name TEXT,
    college_name TEXT,
    logo_url TEXT,
    tagline TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    linkedin_url TEXT,
    youtube_url TEXT,
    twitter_url TEXT,
    theme_config TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT,
    button_text TEXT,
    button_link TEXT,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.about_features (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stats (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    icon TEXT,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.partners (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- TABLE SCHEMA FIXES (ALTER TABLE ADD COLUMN IF NOT EXISTS)
-- =====================================================

-- 0. Add theme_config column to site_settings for color schema admin
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS theme_config TEXT;

-- 0. Fix missing columns in contact_submissions (critical - breaks contact form!)
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS subject TEXT NOT NULL DEFAULT '';
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open';
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 0a. Create charter_settings table if not exists
CREATE TABLE IF NOT EXISTS public.charter_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'AISA Charter',
    description TEXT,
    file_url TEXT,
    drive_url TEXT,
    file_type TEXT DEFAULT 'pdf',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.charter_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read charter" ON public.charter_settings;
CREATE POLICY "Public can read charter" ON public.charter_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage charter" ON public.charter_settings;
CREATE POLICY "Admins can manage charter" ON public.charter_settings FOR ALL USING (auth.role() = 'authenticated');
INSERT INTO public.charter_settings (title, description)
SELECT 'AISA Charter', 'Official AISA Club Charter Document'
WHERE NOT EXISTS (SELECT 1 FROM public.charter_settings);

-- 0b. Create custom_pages table if not exists
CREATE TABLE IF NOT EXISTS public.custom_pages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    meta_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active custom pages" ON public.custom_pages;
CREATE POLICY "Public can read active custom pages" ON public.custom_pages FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage custom pages" ON public.custom_pages;
CREATE POLICY "Admins can manage custom pages" ON public.custom_pages FOR ALL USING (auth.role() = 'authenticated');

-- 0c. Create nav_items table if not exists
CREATE TABLE IF NOT EXISTS public.nav_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL,
    href TEXT NOT NULL,
    icon TEXT,
    parent_id UUID REFERENCES public.nav_items(id),
    page_type TEXT NOT NULL DEFAULT 'built_in',
    custom_page_id UUID REFERENCES public.custom_pages(id) ON DELETE SET NULL,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read nav items" ON public.nav_items;
CREATE POLICY "Public can read nav items" ON public.nav_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage nav items" ON public.nav_items;
CREATE POLICY "Admins can manage nav items" ON public.nav_items FOR ALL USING (auth.role() = 'authenticated');

-- 0d. Create certificate_templates table if not exists
CREATE TABLE IF NOT EXISTS public.certificate_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name TEXT NOT NULL,
    template_url TEXT,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    font_size INTEGER DEFAULT 36,
    font_color TEXT DEFAULT '#000000',
    name_position_x DECIMAL DEFAULT 50,
    name_position_y DECIMAL DEFAULT 50,
    date_position_x DECIMAL DEFAULT 50,
    date_position_y DECIMAL DEFAULT 60,
    cert_number_position_x DECIMAL DEFAULT 50,
    cert_number_position_y DECIMAL DEFAULT 70,
    qr_position_x DECIMAL DEFAULT 85,
    qr_position_y DECIMAL DEFAULT 85,
    rank_position_x DECIMAL DEFAULT 50,
    rank_position_y DECIMAL DEFAULT 55,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read certificate templates" ON public.certificate_templates;
CREATE POLICY "Public can read certificate templates" ON public.certificate_templates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage certificate templates" ON public.certificate_templates;
CREATE POLICY "Admins can manage certificate templates" ON public.certificate_templates FOR ALL USING (auth.role() = 'authenticated');

-- 0e. Create club_admins table if not exists (safe for both new and existing DBs)
CREATE TABLE IF NOT EXISTS public.club_admins (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.club_admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read club_admins" ON public.club_admins;
CREATE POLICY "Admins can read club_admins" ON public.club_admins FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admins can manage club_admins" ON public.club_admins;
CREATE POLICY "Admins can manage club_admins" ON public.club_admins FOR ALL USING (auth.role() = 'authenticated');
-- Also add missing columns in case the table already existed with fewer columns
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 1. Create alumni table if not exists, then fix any missing columns
CREATE TABLE IF NOT EXISTS public.alumni (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    graduation_year TEXT,
    branch TEXT,
    company TEXT,
    job_title TEXT,
    image_url TEXT,
    linkedin_url TEXT,
    testimonial TEXT,
    is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active alumni" ON public.alumni;
CREATE POLICY "Public can read active alumni" ON public.alumni FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage alumni" ON public.alumni;
CREATE POLICY "Admins can manage alumni" ON public.alumni FOR ALL USING (auth.role() = 'authenticated');
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS graduation_year TEXT;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS testimonial TEXT;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- 2. Create occasions table if not exists, then fix any missing columns
CREATE TABLE IF NOT EXISTS public.occasions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    occasion_date DATE,
    category TEXT DEFAULT 'celebration',
    cover_image_url TEXT,
    drive_folder_link TEXT,
    is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active occasions" ON public.occasions;
CREATE POLICY "Public can read active occasions" ON public.occasions FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage occasions" ON public.occasions;
CREATE POLICY "Admins can manage occasions" ON public.occasions FOR ALL USING (auth.role() = 'authenticated');
ALTER TABLE public.occasions ADD COLUMN IF NOT EXISTS occasion_date DATE;
ALTER TABLE public.occasions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'celebration';
ALTER TABLE public.occasions ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.occasions ADD COLUMN IF NOT EXISTS drive_folder_link TEXT;
ALTER TABLE public.occasions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.occasions ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- 3. Fix site_settings table columns
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS club_full_name TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS college_name TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 4. Create visitor_counter table and RPC
CREATE TABLE IF NOT EXISTS public.visitor_counter (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO public.visitor_counter (count)
SELECT 2300 WHERE NOT EXISTS (SELECT 1 FROM public.visitor_counter);

CREATE OR REPLACE FUNCTION public.increment_visitor_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_count integer;
BEGIN
    UPDATE public.visitor_counter
    SET count = count + 1, updated_at = now()
    WHERE id = (SELECT id FROM public.visitor_counter LIMIT 1)
    RETURNING count INTO new_count;
    RETURN new_count;
END;
$$;

ALTER TABLE public.visitor_counter ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read visitor count" ON public.visitor_counter;
CREATE POLICY "Public can read visitor count" ON public.visitor_counter FOR SELECT USING (true);

-- 5. Create news table if not exists
CREATE TABLE IF NOT EXISTS public.news (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    attachment_url TEXT,
    attachment_type TEXT DEFAULT 'pdf',
    published_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expire_date TIMESTAMP WITH TIME ZONE,
    is_marquee BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS attachment_type TEXT DEFAULT 'pdf';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS expire_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active news" ON public.news;
CREATE POLICY "Public can read active news" ON public.news FOR SELECT USING (is_active = true);

-- 6. Create downloads table if not exists
CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    drive_url TEXT,
    file_type TEXT DEFAULT 'pdf',
    file_size TEXT,
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active downloads" ON public.downloads;
CREATE POLICY "Public can read active downloads" ON public.downloads FOR SELECT USING (is_active = true);

-- 7. Create popup_announcements table if not exists
CREATE TABLE IF NOT EXISTS public.popup_announcements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    link_url TEXT,
    link_text TEXT,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.popup_announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active popup announcements" ON public.popup_announcements;
CREATE POLICY "Public can read active popup announcements" ON public.popup_announcements FOR SELECT USING (is_active = true);

-- 8. Fix team_categories table
CREATE TABLE IF NOT EXISTS public.team_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- ADDITIONAL TABLES (certificates, event_winners)
-- =====================================================

-- certificates
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    certificate_type TEXT DEFAULT 'participation',
    certificate_url TEXT,
    certificate_number TEXT UNIQUE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- event_winners
CREATE TABLE IF NOT EXISTS public.event_winners (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    position INTEGER,
    prize_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.event_winners ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- MISSING COLUMNS IN EXISTING BASE TABLES
-- The initial migration creates very minimal schemas;
-- these ALTER statements add all columns the code uses
-- =====================================================

-- announcements: add position column
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- events: add all missing columns used by admin/public pages
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'general';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_participants INTEGER;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS drive_folder_link TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- team_members: add all missing columns
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- gallery: add all missing columns
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS drive_folder_link TEXT;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- quick_links: add missing columns
ALTER TABLE public.quick_links ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE public.quick_links ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.quick_links ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.quick_links ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- user_profiles: add all missing columns used by code
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS enrollment_number TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT false;

-- event_registrations: add all missing columns
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'pending';
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- payments: add all missing columns
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS event_registration_id UUID REFERENCES public.event_registrations(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verified_by UUID;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- =====================================================
-- RLS POLICIES FOR NEW TABLES
-- =====================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stats' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.stats FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partners' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.partners FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'announcements' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.announcements FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.certificates FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_winners' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.event_winners FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_profiles' AND policyname = 'Allow admin access') THEN
    CREATE POLICY "Allow admin access" ON public.admin_profiles USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Allow admin full access') THEN
    CREATE POLICY "Allow admin full access" ON public.certificates USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Seed site_settings
INSERT INTO public.site_settings (club_name, club_full_name, college_name, tagline, email, phone, instagram_url, linkedin_url, youtube_url)
VALUES (
    'AISA',
    'Artificial Intelligence and Data Science Students Association',
    'ISBM College of Engineering, Pune',
    'A center of creativity and technological growth, driving students to design, develop, and deliver impactful solutions that shape tomorrow''s world.',
    'aisaclub@isbmcoe.org',
    '7020640920',
    'https://www.instagram.com/aisa_isbmcoe',
    'https://www.linkedin.com/company/aisa-isbmcoe',
    'https://www.youtube.com/@aisa_isbmcoe'
)
ON CONFLICT DO NOTHING;

-- Seed announcements
INSERT INTO public.announcements (content, is_active, position) VALUES
('🎓 Applications open for AISA Core Team 2025-26 – Apply Now!', true, 1),
('🏆 AISA students won 1st place at State Level Hackathon 2025!', true, 2),
('📢 Workshop on Generative AI & LLMs – Register before seats fill up!', true, 3),
('🌟 Congratulations to our alumni placed at top MNCs this placement season!', true, 4)
ON CONFLICT DO NOTHING;

-- Seed hero_slides
INSERT INTO public.hero_slides (title, subtitle, image_url, button_text, button_link, position, is_active) VALUES
(
    'Welcome to AISA Club',
    'Artificial Intelligence & Data Science Students Association at ISBM College of Engineering, Pune',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1920&q=80',
    'Explore Events',
    '/events',
    1,
    true
),
(
    'Innovate. Build. Lead.',
    'Join us in shaping the future of AI & Data Science through hands-on projects, workshops, and industry collaborations.',
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1920&q=80',
    'Meet Our Team',
    '/team',
    2,
    true
),
(
    'Learn from Industry Experts',
    'Access workshops, seminars, and mentoring sessions with leading professionals in AI, ML, and Data Science.',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80',
    'View Gallery',
    '/gallery',
    3,
    true
)
ON CONFLICT DO NOTHING;

-- Seed stats
INSERT INTO public.stats (label, value, icon, position, is_active) VALUES
('Active Members', '200+', 'users', 1, true),
('Events Organized', '50+', 'calendar', 2, true),
('Awards Won', '15+', 'award', 3, true),
('Industry Partners', '10+', 'handshake', 4, true)
ON CONFLICT DO NOTHING;

-- Seed about_features
INSERT INTO public.about_features (title, description, icon, position, is_active) VALUES
('Technical Excellence', 'Hands-on workshops and projects in AI, Machine Learning, Deep Learning, and Data Science to build real-world skills.', 'code', 1, true),
('Industry Connections', 'Direct exposure to industry professionals through guest lectures, internships, and industry-sponsored hackathons.', 'handshake', 2, true),
('Research & Innovation', 'Encouraging research culture with student-led projects, paper publications, and innovation challenges.', 'trending-up', 3, true),
('Holistic Development', 'Beyond technical skills — leadership, communication, and entrepreneurship programs for all-round growth.', 'graduation-cap', 4, true),
('Competitive Edge', 'Participation in state and national-level competitions, hackathons, and data science challenges.', 'award', 5, true),
('Community & Networking', 'A vibrant peer community fostering collaboration, knowledge sharing, and lifelong professional connections.', 'users', 6, true)
ON CONFLICT DO NOTHING;

-- Seed team_categories
INSERT INTO public.team_categories (name, label, position, is_active) VALUES
('faculty', 'Faculty Coordinators', 1, true),
('core', 'Core Team', 2, true),
('technical', 'Technical Team', 3, true),
('design', 'Design Team', 4, true),
('management', 'Management Team', 5, true)
ON CONFLICT (name) DO NOTHING;

-- Seed team members
INSERT INTO public.team_members (name, role, category, description, position, is_active) VALUES
('Prof. Anita Sharma', 'Faculty Coordinator', 'faculty', 'Faculty Coordinator for AISA with expertise in Machine Learning and Data Analytics.', 1, true),
('Prof. Rajesh Patil', 'Co-Faculty Coordinator', 'faculty', 'Co-Faculty Coordinator specializing in Artificial Intelligence and Deep Learning.', 2, true),
('Arjun Mehta', 'President', 'core', 'Leading AISA with vision for innovation and student development.', 1, true),
('Priya Desai', 'Vice President', 'core', 'Driving club initiatives and managing cross-functional teams.', 2, true),
('Rohan Kulkarni', 'General Secretary', 'core', 'Handling club operations, communications, and event planning.', 3, true),
('Sneha Joshi', 'Technical Head', 'technical', 'Leading technical projects and workshops on AI/ML technologies.', 1, true),
('Amit Patel', 'Data Science Lead', 'technical', 'Managing data science projects and competitions.', 2, true),
('Kavya Nair', 'Design Head', 'design', 'Creating visual identity and design assets for the club.', 1, true),
('Rahul Verma', 'Event Manager', 'management', 'Coordinating and organizing all AISA events and activities.', 1, true),
('Pooja Rane', 'PR & Marketing', 'management', 'Managing public relations, social media, and club outreach.', 2, true)
ON CONFLICT DO NOTHING;

-- Seed alumni
INSERT INTO public.alumni (name, graduation_year, company, job_title, branch, position, is_active) VALUES
('Vikram Singh', '2023', 'TCS', 'Data Analyst', 'AI & DS', 1, true),
('Neha Kulkarni', '2023', 'Infosys', 'ML Engineer', 'AI & DS', 2, true),
('Aditya Sharma', '2022', 'Wipro', 'Data Scientist', 'AI & DS', 3, true),
('Manasi Patil', '2022', 'Accenture', 'AI Engineer', 'AI & DS', 4, true),
('Siddharth Jain', '2021', 'Cognizant', 'Business Analyst', 'AI & DS', 5, true),
('Rutuja Deshmukh', '2021', 'Tech Mahindra', 'Software Engineer', 'AI & DS', 6, true)
ON CONFLICT DO NOTHING;

-- Seed upcoming events
INSERT INTO public.events (title, description, event_type, event_date, location, max_participants, entry_fee, is_active, is_completed) VALUES
(
    'AI & ML Workshop Series',
    'A comprehensive 3-day workshop series covering Machine Learning fundamentals, Neural Networks, and real-world AI applications. Hands-on sessions with industry mentors.',
    'workshop',
    NOW() + INTERVAL '30 days',
    'ISBM College of Engineering, Pune',
    60,
    0,
    true,
    false
),
(
    'DataThon 2025',
    'AISA''s flagship data science hackathon where teams compete to solve real-world data problems. Prizes worth ₹50,000+ and direct internship opportunities.',
    'hackathon',
    NOW() + INTERVAL '45 days',
    'ISBM College of Engineering, Pune',
    100,
    200,
    true,
    false
),
(
    'Industry Talk: Future of AI',
    'An exclusive guest lecture by senior professionals from leading AI companies. Gain insights into career paths, industry trends, and future opportunities in AI.',
    'seminar',
    NOW() + INTERVAL '15 days',
    'ISBM College Auditorium, Pune',
    200,
    0,
    true,
    false
)
ON CONFLICT DO NOTHING;

-- Seed past events
INSERT INTO public.events (title, description, event_type, event_date, location, entry_fee, is_active, is_completed) VALUES
(
    'Python & Data Science Bootcamp',
    'An intensive bootcamp covering Python programming, data analysis with Pandas, and visualization with Matplotlib and Seaborn.',
    'workshop',
    NOW() - INTERVAL '30 days',
    'ISBM College of Engineering, Pune',
    0,
    true,
    true
),
(
    'Smart India Hackathon Preparation Camp',
    'Preparation camp for SIH with mock problem statements, team building, and mentoring sessions.',
    'hackathon',
    NOW() - INTERVAL '60 days',
    'ISBM College of Engineering, Pune',
    0,
    true,
    true
)
ON CONFLICT DO NOTHING;

-- Seed partners
INSERT INTO public.partners (name, website_url, position, is_active) VALUES
('TCS iON', 'https://iontcs.com', 1, true),
('Internshala', 'https://internshala.com', 2, true),
('NASSCOM', 'https://nasscom.in', 3, true),
('Coursera', 'https://coursera.org', 4, true),
('IEEE', 'https://ieee.org', 5, true),
('GitHub Education', 'https://education.github.com', 6, true)
ON CONFLICT DO NOTHING;

-- Seed nav items (default navigation)
INSERT INTO public.nav_items (label, href, position, is_active, is_visible, icon) VALUES
('Home', '/', 1, true, true, 'Home'),
('About', '/about', 2, true, true, 'Info'),
('Events', '/events', 3, true, true, 'Calendar'),
('Team', '/team', 4, true, true, 'Users'),
('Gallery', '/gallery', 5, true, true, 'Image'),
('Contact', '/contact', 6, true, true, 'Phone')
ON CONFLICT DO NOTHING;

-- =====================================================
-- RLS POLICIES - Enable read access for public
-- =====================================================

-- Enable RLS and add read policies for public tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;

-- Create read policies (allow anyone to read)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.site_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'announcements' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.announcements FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hero_slides' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.hero_slides FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stats' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.stats FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'about_features' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.about_features FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.team_members FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_categories' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.team_categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.events FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'alumni' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.alumni FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partners' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.partners FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gallery' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.gallery FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'occasions' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.occasions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'nav_items' AND policyname = 'Allow public read') THEN
    CREATE POLICY "Allow public read" ON public.nav_items FOR SELECT USING (true);
  END IF;
END $$;

-- Admin full access policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Allow admin full access') THEN
    CREATE POLICY "Allow admin full access" ON public.site_settings USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'announcements' AND policyname = 'Allow admin full access') THEN
    CREATE POLICY "Allow admin full access" ON public.announcements USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hero_slides' AND policyname = 'Allow admin full access') THEN
    CREATE POLICY "Allow admin full access" ON public.hero_slides USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stats' AND policyname = 'Allow admin full access') THEN
    CREATE POLICY "Allow admin full access" ON public.stats USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'about_features' AND policyname = 'Allow admin full access') THEN
    CREATE POLICY "Allow admin full access" ON public.about_features USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Allow admin full access') THEN
    CREATE POLICY "Allow admin full access" ON public.team_members USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_categories' AND policyname = 'Allow admin full access') THEN
    CREATE POLICY "Allow admin full access" ON public.team_categories USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Allow admin full access') THEN
    CREATE POLICY "Allow admin full access" ON public.events USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'alumni' AND policyname = 'Allow admin full access') THEN
    CREATE POLICY "Allow admin full access" ON public.alumni USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partners' AND policyname = 'Allow admin full access') THEN
    CREATE POLICY "Allow admin full access" ON public.partners USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gallery' AND policyname = 'Allow admin full access') THEN
    CREATE POLICY "Allow admin full access" ON public.gallery USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'occasions' AND policyname = 'Allow admin full access') THEN
    CREATE POLICY "Allow admin full access" ON public.occasions USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'nav_items' AND policyname = 'Allow admin full access') THEN
    CREATE POLICY "Allow admin full access" ON public.nav_items USING (auth.role() = 'authenticated');
  END IF;
END $$;
-- =====================================================