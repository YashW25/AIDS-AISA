-- ============================================================
-- AISA Club Website — COMPLETE & SAFE SCHEMA
-- Run this ONCE or MULTIPLE TIMES in Supabase SQL Editor
-- Completely idempotent: safe to re-run without duplicating data
-- ============================================================

-- ============================================================
-- SECTION 1: CREATE ALL TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_name         TEXT DEFAULT 'AISA',
  club_full_name    TEXT,
  college_name      TEXT,
  logo_url          TEXT,
  tagline           TEXT,
  email             TEXT,
  phone             TEXT,
  address           TEXT,
  facebook_url      TEXT,
  instagram_url     TEXT,
  linkedin_url      TEXT,
  youtube_url       TEXT,
  twitter_url       TEXT,
  theme_config      TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  subtitle     TEXT,
  image_url    TEXT,
  button_text  TEXT,
  button_link  TEXT,
  position     INT DEFAULT 0,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.about_features (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  icon         TEXT,
  position     INT DEFAULT 0,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stats (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label       TEXT NOT NULL,
  value       TEXT NOT NULL,
  icon        TEXT,
  position    INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.partners (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  logo_url     TEXT,
  website_url  TEXT,
  description  TEXT,
  position     INT DEFAULT 0,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content     TEXT,
  is_active   BOOLEAN DEFAULT true,
  position    INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT,
  description           TEXT,
  event_type            TEXT DEFAULT 'general',
  event_date            TIMESTAMPTZ,
  end_date              TIMESTAMPTZ,
  location              TEXT,
  image_url             TEXT,
  max_participants      INT,
  current_participants  INT DEFAULT 0,
  entry_fee             DECIMAL DEFAULT 0,
  drive_folder_link     TEXT,
  is_active             BOOLEAN DEFAULT true,
  is_completed          BOOLEAN DEFAULT false,
  position              INT DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  position    INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT,
  role         TEXT,
  description  TEXT,
  category     TEXT,
  image_url    TEXT,
  email        TEXT,
  linkedin_url TEXT,
  skills       TEXT[],
  position     INT DEFAULT 0,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gallery (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT,
  image_url         TEXT,
  description       TEXT,
  category          TEXT,
  event_id          UUID REFERENCES public.events(id) ON DELETE SET NULL,
  drive_folder_link TEXT,
  position          INT DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alumni (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  graduation_year TEXT,
  branch          TEXT,
  company         TEXT,
  job_title       TEXT,
  image_url       TEXT,
  linkedin_url    TEXT,
  testimonial     TEXT,
  position        INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.occasions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  description       TEXT,
  occasion_date     DATE,
  category          TEXT DEFAULT 'celebration',
  cover_image_url   TEXT,
  drive_folder_link TEXT,
  position          INT DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.news (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  content         TEXT,
  image_url       TEXT,
  attachment_url  TEXT,
  attachment_type TEXT DEFAULT 'pdf',
  published_date  TIMESTAMPTZ DEFAULT now(),
  expire_date     TIMESTAMPTZ,
  is_marquee      BOOLEAN DEFAULT false,
  is_active       BOOLEAN DEFAULT true,
  position        INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.downloads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  file_url     TEXT,
  drive_url    TEXT,
  file_type    TEXT DEFAULT 'pdf',
  file_size    TEXT,
  category     TEXT DEFAULT 'general',
  position     INT DEFAULT 0,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.popup_announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  content     TEXT,
  image_url   TEXT,
  link_url    TEXT,
  link_text   TEXT,
  start_date  TIMESTAMPTZ,
  end_date    TIMESTAMPTZ,
  position    INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quick_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT,
  url         TEXT,
  category    TEXT,
  position    INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT,
  email        TEXT,
  subject      TEXT DEFAULT '',
  message      TEXT,
  status       TEXT DEFAULT 'open',
  priority     TEXT DEFAULT 'medium',
  admin_notes  TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.charter_settings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT DEFAULT 'AISA Club Charter',
  description  TEXT,
  file_url     TEXT,
  drive_url    TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.custom_pages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  content          TEXT,
  meta_title       TEXT,
  meta_description TEXT,
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nav_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label          TEXT NOT NULL,
  href           TEXT NOT NULL DEFAULT '/',
  icon           TEXT,
  parent_id      UUID REFERENCES public.nav_items(id) ON DELETE SET NULL,
  page_type      TEXT DEFAULT 'built_in',
  custom_page_id UUID REFERENCES public.custom_pages(id) ON DELETE SET NULL,
  position       INT DEFAULT 0,
  is_active      BOOLEAN DEFAULT true,
  is_visible     BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.club_admins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  role        TEXT DEFAULT 'admin',
  is_primary  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT,
  full_name   TEXT,
  role        TEXT DEFAULT 'admin',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name           TEXT,
  mobile              TEXT,
  enrollment_number   TEXT,
  branch              TEXT,
  year                TEXT,
  college             TEXT,
  avatar_url          TEXT,
  is_profile_complete BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role     TEXT DEFAULT 'student',
  UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id            UUID REFERENCES public.events(id) ON DELETE CASCADE,
  registration_status TEXT DEFAULT 'pending',
  payment_status      TEXT DEFAULT 'pending',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, event_id)
);

CREATE TABLE IF NOT EXISTS public.payments (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_registration_id  UUID REFERENCES public.event_registrations(id) ON DELETE SET NULL,
  amount                 DECIMAL DEFAULT 0,
  payment_method         TEXT DEFAULT 'cash',
  payment_status         TEXT DEFAULT 'pending',
  transaction_id         TEXT,
  receipt_number         TEXT,
  verified_by            UUID,
  verified_at            TIMESTAMPTZ,
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id           UUID REFERENCES public.events(id) ON DELETE CASCADE,
  certificate_type   TEXT DEFAULT 'participation',
  certificate_url    TEXT,
  certificate_number TEXT UNIQUE,
  issued_at          TIMESTAMPTZ DEFAULT now(),
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  base_image_url  TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_winners (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  position      INT,
  prize_details TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.visitor_counter (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  count       BIGINT DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- SECTION 2: CRITICAL CONSTRAINTS & MISSING COLUMNS
-- ============================================================

-- FIX FOR ERROR 42P10: Ensure the unique constraint exists if table was made previously
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_categories_name_key') THEN
    ALTER TABLE public.team_categories ADD CONSTRAINT team_categories_name_key UNIQUE (name);
  END IF;
END $$;

-- site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS club_name TEXT DEFAULT 'AISA';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS club_full_name TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS college_name TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS theme_config TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- announcements
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'general';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_participants INT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS current_participants INT DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS drive_folder_link TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- team_members
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- gallery
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS drive_folder_link TEXT;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- alumni
-- Ensure id column exists (in case table was created manually without it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='alumni' AND column_name='id'
  ) THEN
    ALTER TABLE public.alumni ADD COLUMN id UUID DEFAULT gen_random_uuid();
    UPDATE public.alumni SET id = gen_random_uuid() WHERE id IS NULL;
    BEGIN
      ALTER TABLE public.alumni ADD PRIMARY KEY (id);
    EXCEPTION WHEN others THEN NULL;
    END;
  END IF;
END $$;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS graduation_year TEXT;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS testimonial TEXT;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- occasions
ALTER TABLE public.occasions ADD COLUMN IF NOT EXISTS occasion_date DATE;
ALTER TABLE public.occasions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'celebration';
ALTER TABLE public.occasions ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.occasions ADD COLUMN IF NOT EXISTS drive_folder_link TEXT;
ALTER TABLE public.occasions ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
ALTER TABLE public.occasions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.occasions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.occasions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- news
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS attachment_type TEXT DEFAULT 'pdf';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS expire_date TIMESTAMPTZ;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS is_marquee BOOLEAN DEFAULT false;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS published_date TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- downloads
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS drive_url TEXT;
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'pdf';
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS file_size TEXT;
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.downloads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- popup_announcements
ALTER TABLE public.popup_announcements ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.popup_announcements ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.popup_announcements ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE public.popup_announcements ADD COLUMN IF NOT EXISTS link_text TEXT;
ALTER TABLE public.popup_announcements ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE public.popup_announcements ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE public.popup_announcements ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
ALTER TABLE public.popup_announcements ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.popup_announcements ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.popup_announcements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- quick_links
ALTER TABLE public.quick_links ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.quick_links ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
ALTER TABLE public.quick_links ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.quick_links ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.quick_links ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- contact_submissions
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT '';
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- charter_settings
ALTER TABLE public.charter_settings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.charter_settings ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.charter_settings ADD COLUMN IF NOT EXISTS drive_url TEXT;
ALTER TABLE public.charter_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.charter_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- custom_pages
ALTER TABLE public.custom_pages ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.custom_pages ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.custom_pages ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.custom_pages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.custom_pages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- nav_items
ALTER TABLE public.nav_items ADD COLUMN IF NOT EXISTS href TEXT DEFAULT '/';
ALTER TABLE public.nav_items ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.nav_items ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'built_in';
ALTER TABLE public.nav_items ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
ALTER TABLE public.nav_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.nav_items ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
ALTER TABLE public.nav_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.nav_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- club_admins
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS enrollment_number TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS year TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- event_registrations
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'pending';
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS event_registration_id UUID REFERENCES public.event_registrations(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verified_by UUID;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- certificates
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS certificate_type TEXT DEFAULT 'participation';
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS certificate_url TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();


-- ============================================================
-- SECTION 3: ROW LEVEL SECURITY & POLICIES
-- ============================================================

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popup_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charter_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_counter ENABLE ROW LEVEL SECURITY;

-- Public read policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='public_read_site_settings') THEN
    CREATE POLICY public_read_site_settings ON public.site_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hero_slides' AND policyname='public_read_hero_slides') THEN
    CREATE POLICY public_read_hero_slides ON public.hero_slides FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='about_features' AND policyname='public_read_about_features') THEN
    CREATE POLICY public_read_about_features ON public.about_features FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='stats' AND policyname='public_read_stats') THEN
    CREATE POLICY public_read_stats ON public.stats FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='partners' AND policyname='public_read_partners') THEN
    CREATE POLICY public_read_partners ON public.partners FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='announcements' AND policyname='public_read_announcements') THEN
    CREATE POLICY public_read_announcements ON public.announcements FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='events' AND policyname='public_read_events') THEN
    CREATE POLICY public_read_events ON public.events FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_members' AND policyname='public_read_team_members') THEN
    CREATE POLICY public_read_team_members ON public.team_members FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_categories' AND policyname='public_read_team_categories') THEN
    CREATE POLICY public_read_team_categories ON public.team_categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gallery' AND policyname='public_read_gallery') THEN
    CREATE POLICY public_read_gallery ON public.gallery FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='alumni' AND policyname='public_read_alumni') THEN
    CREATE POLICY public_read_alumni ON public.alumni FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='occasions' AND policyname='public_read_occasions') THEN
    CREATE POLICY public_read_occasions ON public.occasions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='news' AND policyname='public_read_news') THEN
    CREATE POLICY public_read_news ON public.news FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='downloads' AND policyname='public_read_downloads') THEN
    CREATE POLICY public_read_downloads ON public.downloads FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='popup_announcements' AND policyname='public_read_popups') THEN
    CREATE POLICY public_read_popups ON public.popup_announcements FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='quick_links' AND policyname='public_read_quick_links') THEN
    CREATE POLICY public_read_quick_links ON public.quick_links FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='charter_settings' AND policyname='public_read_charter') THEN
    CREATE POLICY public_read_charter ON public.charter_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='custom_pages' AND policyname='public_read_custom_pages') THEN
    CREATE POLICY public_read_custom_pages ON public.custom_pages FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='nav_items' AND policyname='public_read_nav_items') THEN
    CREATE POLICY public_read_nav_items ON public.nav_items FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='visitor_counter' AND policyname='public_read_visitor_counter') THEN
    CREATE POLICY public_read_visitor_counter ON public.visitor_counter FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='certificates' AND policyname='public_read_certificates') THEN
    CREATE POLICY public_read_certificates ON public.certificates FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='event_winners' AND policyname='public_read_event_winners') THEN
    CREATE POLICY public_read_event_winners ON public.event_winners FOR SELECT USING (true);
  END IF;
END $$;

-- Admin full-access policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='admin_all_site_settings') THEN
    CREATE POLICY admin_all_site_settings ON public.site_settings USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hero_slides' AND policyname='admin_all_hero_slides') THEN
    CREATE POLICY admin_all_hero_slides ON public.hero_slides USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='about_features' AND policyname='admin_all_about_features') THEN
    CREATE POLICY admin_all_about_features ON public.about_features USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='stats' AND policyname='admin_all_stats') THEN
    CREATE POLICY admin_all_stats ON public.stats USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='partners' AND policyname='admin_all_partners') THEN
    CREATE POLICY admin_all_partners ON public.partners USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='announcements' AND policyname='admin_all_announcements') THEN
    CREATE POLICY admin_all_announcements ON public.announcements USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='events' AND policyname='admin_all_events') THEN
    CREATE POLICY admin_all_events ON public.events USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_members' AND policyname='admin_all_team_members') THEN
    CREATE POLICY admin_all_team_members ON public.team_members USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_categories' AND policyname='admin_all_team_categories') THEN
    CREATE POLICY admin_all_team_categories ON public.team_categories USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gallery' AND policyname='admin_all_gallery') THEN
    CREATE POLICY admin_all_gallery ON public.gallery USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='alumni' AND policyname='admin_all_alumni') THEN
    CREATE POLICY admin_all_alumni ON public.alumni USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='occasions' AND policyname='admin_all_occasions') THEN
    CREATE POLICY admin_all_occasions ON public.occasions USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='news' AND policyname='admin_all_news') THEN
    CREATE POLICY admin_all_news ON public.news USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='downloads' AND policyname='admin_all_downloads') THEN
    CREATE POLICY admin_all_downloads ON public.downloads USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='popup_announcements' AND policyname='admin_all_popups') THEN
    CREATE POLICY admin_all_popups ON public.popup_announcements USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='quick_links' AND policyname='admin_all_quick_links') THEN
    CREATE POLICY admin_all_quick_links ON public.quick_links USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contact_submissions' AND policyname='admin_all_contact') THEN
    CREATE POLICY admin_all_contact ON public.contact_submissions USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='charter_settings' AND policyname='admin_all_charter') THEN
    CREATE POLICY admin_all_charter ON public.charter_settings USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='custom_pages' AND policyname='admin_all_custom_pages') THEN
    CREATE POLICY admin_all_custom_pages ON public.custom_pages USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='nav_items' AND policyname='admin_all_nav_items') THEN
    CREATE POLICY admin_all_nav_items ON public.nav_items USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='club_admins' AND policyname='admin_all_club_admins') THEN
    CREATE POLICY admin_all_club_admins ON public.club_admins USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_profiles' AND policyname='admin_all_admin_profiles') THEN
    CREATE POLICY admin_all_admin_profiles ON public.admin_profiles USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_profiles' AND policyname='admin_all_user_profiles') THEN
    CREATE POLICY admin_all_user_profiles ON public.user_profiles USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='event_registrations' AND policyname='admin_all_registrations') THEN
    CREATE POLICY admin_all_registrations ON public.event_registrations USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='admin_all_payments') THEN
    CREATE POLICY admin_all_payments ON public.payments USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='certificates' AND policyname='admin_all_certificates') THEN
    CREATE POLICY admin_all_certificates ON public.certificates USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='certificate_templates' AND policyname='admin_all_cert_templates') THEN
    CREATE POLICY admin_all_cert_templates ON public.certificate_templates USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='event_winners' AND policyname='admin_all_event_winners') THEN
    CREATE POLICY admin_all_event_winners ON public.event_winners USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='visitor_counter' AND policyname='admin_all_visitor_counter') THEN
    CREATE POLICY admin_all_visitor_counter ON public.visitor_counter USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Contact form: allow anyone to INSERT
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contact_submissions' AND policyname='public_insert_contact') THEN
    CREATE POLICY public_insert_contact ON public.contact_submissions FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- SECTION 4: VISITOR COUNTER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_visitor_count()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE new_count bigint;
BEGIN
  UPDATE public.visitor_counter
  SET count = count + 1,
      updated_at = now()
  WHERE id = (SELECT id FROM public.visitor_counter LIMIT 1)
  RETURNING count INTO new_count;

  RETURN new_count;
END;
$$;

-- Insert a default visitor count row if none exists
INSERT INTO public.visitor_counter (count)
SELECT 2300 WHERE NOT EXISTS (SELECT 1 FROM public.visitor_counter);


-- ============================================================
-- SECTION 5: SEED INITIAL DATA (Safely skips if data exists)
-- ============================================================

-- Site Settings
INSERT INTO public.site_settings (club_name, club_full_name, college_name, tagline, email, phone, instagram_url, linkedin_url, youtube_url)
SELECT 'AISA', 'Artificial Intelligence and Data Science Students Association', 'ISBM College of Engineering, Pune', 'A center of creativity and technological growth...', 'aisaclub@isbmcoe.org', '7020640920', 'https://www.instagram.com/aisa_isbmcoe', 'https://www.linkedin.com/company/aisa-isbmcoe', 'https://www.youtube.com/@aisa_isbmcoe'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- Announcements
INSERT INTO public.announcements (content, is_active, position)
SELECT * FROM (VALUES
  ('🎓 Applications open for AISA Core Team 2025-26 – Apply Now!', true, 1),
  ('🏆 AISA students won 1st place at State Level Hackathon 2025!', true, 2),
  ('📢 Workshop on Generative AI & LLMs – Register before seats fill up!', true, 3),
  ('🌟 Congratulations to our alumni placed at top MNCs this placement season!', true, 4)
) AS v(content, is_active, position)
WHERE NOT EXISTS (SELECT 1 FROM public.announcements);

-- Hero Slides
INSERT INTO public.hero_slides (title, subtitle, image_url, button_text, button_link, position, is_active)
SELECT * FROM (VALUES
  ('Welcome to AISA Club', 'Artificial Intelligence & Data Science Students Association at ISBM College of Engineering, Pune', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1920&q=80', 'Explore Events', '/events', 1, true),
  ('Innovate. Build. Lead.', 'Join us in shaping the future of AI & Data Science...', 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1920&q=80', 'Meet Our Team', '/team', 2, true),
  ('Learn from Industry Experts', 'Access workshops, seminars, and mentoring sessions...', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80', 'View Gallery', '/gallery', 3, true)
) AS v(title, subtitle, image_url, button_text, button_link, position, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides);

-- Stats
INSERT INTO public.stats (label, value, icon, position, is_active)
SELECT * FROM (VALUES
  ('Active Members', '200+', 'users', 1, true),
  ('Events Organized', '50+', 'calendar', 2, true),
  ('Awards Won', '15+', 'award', 3, true),
  ('Industry Partners', '10+', 'handshake', 4, true)
) AS v(label, value, icon, position, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.stats);

-- About Features
INSERT INTO public.about_features (title, description, icon, position, is_active)
SELECT * FROM (VALUES
  ('Technical Excellence', 'Hands-on workshops and projects in AI, Machine Learning, Deep Learning, and Data Science to build real-world skills.', 'code', 1, true),
  ('Industry Connections', 'Direct exposure to industry professionals through guest lectures, internships, and industry-sponsored hackathons.', 'handshake', 2, true),
  ('Research & Innovation', 'Encouraging research culture with student-led projects, paper publications, and innovation challenges.', 'trending-up', 3, true),
  ('Holistic Development', 'Beyond technical skills — leadership, communication, and entrepreneurship programs for all-round growth.', 'graduation-cap', 4, true),
  ('Competitive Edge', 'Participation in state and national-level competitions, hackathons, and data science challenges.', 'award', 5, true),
  ('Community & Networking', 'A vibrant peer community fostering collaboration, knowledge sharing, and lifelong professional connections.', 'users', 6, true)
) AS v(title, description, icon, position, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.about_features);

-- Team Categories (Safe ON CONFLICT now that the unique constraint is guaranteed)
INSERT INTO public.team_categories (name, label, position, is_active) VALUES
  ('faculty', 'Faculty Coordinators', 1, true),
  ('core', 'Core Team', 2, true),
  ('technical', 'Technical Team', 3, true),
  ('design', 'Design Team', 4, true),
  ('management', 'Management Team', 5, true)
ON CONFLICT (name) DO NOTHING;

-- Team Members
INSERT INTO public.team_members (name, role, category, description, position, is_active)
SELECT * FROM (VALUES
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
) AS v(name, role, category, description, position, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.team_members);

-- Alumni
INSERT INTO public.alumni (name, graduation_year, company, job_title, branch, position, is_active)
SELECT * FROM (VALUES
  ('Vikram Singh', '2023', 'TCS', 'Data Analyst', 'AI & DS', 1, true),
  ('Neha Kulkarni', '2023', 'Infosys', 'ML Engineer', 'AI & DS', 2, true),
  ('Aditya Sharma', '2022', 'Wipro', 'Data Scientist', 'AI & DS', 3, true),
  ('Manasi Patil', '2022', 'Accenture', 'AI Engineer', 'AI & DS', 4, true),
  ('Siddharth Jain', '2021', 'Cognizant', 'Business Analyst', 'AI & DS', 5, true),
  ('Rutuja Deshmukh', '2021', 'Tech Mahindra', 'Software Engineer', 'AI & DS', 6, true)
) AS v(name, graduation_year, company, job_title, branch, position, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni);

-- Partners
INSERT INTO public.partners (name, website_url, position, is_active)
SELECT * FROM (VALUES
  ('TCS iON', 'https://iontcs.com', 1, true),
  ('Internshala', 'https://internshala.com', 2, true),
  ('NASSCOM', 'https://nasscom.in', 3, true),
  ('Coursera', 'https://coursera.org', 4, true),
  ('IEEE', 'https://ieee.org', 5, true),
  ('GitHub Education', 'https://education.github.com', 6, true)
) AS v(name, website_url, position, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.partners);

-- Events
INSERT INTO public.events (title, description, event_type, event_date, location, max_participants, entry_fee, is_active, is_completed)
SELECT CAST(v.title AS TEXT), CAST(v.description AS TEXT), CAST(v.event_type AS TEXT), CAST(v.event_date AS TIMESTAMPTZ), CAST(v.location AS TEXT), CAST(v.max_participants AS INT), CAST(v.entry_fee AS DECIMAL), CAST(v.is_active AS BOOLEAN), CAST(v.is_completed AS BOOLEAN) 
FROM (VALUES
  ('AI & ML Workshop Series', 'A comprehensive 3-day workshop series...', 'workshop', NOW() + INTERVAL '30 days', 'ISBM College of Engineering, Pune', 60, 0, true, false),
  ('DataThon 2025', 'AISA flagship data science hackathon...', 'hackathon', NOW() + INTERVAL '45 days', 'ISBM College of Engineering, Pune', 100, 200, true, false),
  ('Industry Talk: Future of AI', 'Exclusive guest lecture by senior professionals...', 'seminar', NOW() + INTERVAL '15 days', 'ISBM College Auditorium, Pune', 200, 0, true, false),
  ('Python & Data Science Bootcamp', 'Intensive bootcamp covering Python programming...', 'workshop', NOW() - INTERVAL '30 days', 'ISBM College of Engineering, Pune', NULL, 0, true, true),
  ('Smart India Hackathon Preparation Camp', 'Preparation camp for SIH with mock problem statements...', 'hackathon', NOW() - INTERVAL '60 days', 'ISBM College of Engineering, Pune', NULL, 0, true, true)
) AS v(title, description, event_type, event_date, location, max_participants, entry_fee, is_active, is_completed)
WHERE NOT EXISTS (SELECT 1 FROM public.events);

-- Nav Items
INSERT INTO public.nav_items (label, href, position, is_active, is_visible, icon)
SELECT * FROM (VALUES
  ('Home', '/', 1, true, true, 'Home'),
  ('About', '/about', 2, true, true, 'Info'),
  ('Events', '/events', 3, true, true, 'Calendar'),
  ('Team', '/team', 4, true, true, 'Users'),
  ('Gallery', '/gallery', 5, true, true, 'Image'),
  ('Contact', '/contact', 6, true, true, 'Phone')
) AS v(label, href, position, is_active, is_visible, icon)
WHERE NOT EXISTS (SELECT 1 FROM public.nav_items);

-- Charter Settings
INSERT INTO public.charter_settings (title, description)
SELECT 'AISA Club Charter', 'The official charter and constitution of the AISA Club at ISBM College of Engineering.'
WHERE NOT EXISTS (SELECT 1 FROM public.charter_settings);