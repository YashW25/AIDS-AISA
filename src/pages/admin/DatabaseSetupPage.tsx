import { useState } from 'react';
import { Database, CheckCircle, XCircle, Loader2, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

type SeedResult = { table: string; status: 'success' | 'error' | 'skipped'; message: string };

const SEED_SQL = `-- Run this in Supabase SQL Editor (Database > SQL Editor)
-- =====================================================
-- AISA Club - Complete Schema Fix
-- =====================================================

-- Create club_admins if it does not exist yet
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
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.club_admins ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create alumni if it does not exist yet, then fix any missing columns
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

-- Create occasions if it does not exist yet, then fix any missing columns
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

-- Add theme_config for color schema admin
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS theme_config TEXT;

-- Fix missing columns in site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS club_full_name TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS college_name TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create visitor_counter table
CREATE TABLE IF NOT EXISTS public.visitor_counter (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
INSERT INTO public.visitor_counter (count)
SELECT 2300 WHERE NOT EXISTS (SELECT 1 FROM public.visitor_counter);
CREATE OR REPLACE FUNCTION public.increment_visitor_count()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE new_count integer; BEGIN
    UPDATE public.visitor_counter SET count = count + 1, updated_at = now()
    WHERE id = (SELECT id FROM public.visitor_counter LIMIT 1)
    RETURNING count INTO new_count; RETURN new_count; END; $$;
ALTER TABLE public.visitor_counter ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read visitor count" ON public.visitor_counter;
CREATE POLICY "Public can read visitor count" ON public.visitor_counter FOR SELECT USING (true);

-- Create team_categories if missing
CREATE TABLE IF NOT EXISTS public.team_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.team_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read team_categories" ON public.team_categories;
CREATE POLICY "Allow public read team_categories" ON public.team_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write team_categories" ON public.team_categories;
CREATE POLICY "Allow admin write team_categories" ON public.team_categories USING (auth.role() = 'authenticated');

-- Create news table if missing
CREATE TABLE IF NOT EXISTS public.news (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL, content TEXT, image_url TEXT, attachment_url TEXT,
    published_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_marquee BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active news" ON public.news;
CREATE POLICY "Public can read active news" ON public.news FOR SELECT USING (is_active = true);

-- Create downloads table if missing
CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL, description TEXT, file_url TEXT, drive_url TEXT,
    file_type TEXT DEFAULT 'pdf', file_size TEXT,
    is_active BOOLEAN DEFAULT true, position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active downloads" ON public.downloads;
CREATE POLICY "Public can read active downloads" ON public.downloads FOR SELECT USING (is_active = true);

-- Create popup_announcements table if missing
CREATE TABLE IF NOT EXISTS public.popup_announcements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL, content TEXT, image_url TEXT, link_url TEXT, link_text TEXT,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE, end_date TIMESTAMP WITH TIME ZONE,
    position INTEGER DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.popup_announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active popup announcements" ON public.popup_announcements;
CREATE POLICY "Public can read active popup announcements" ON public.popup_announcements FOR SELECT USING (is_active = true);`;

const DatabaseSetupPage = () => {
  const [seeding, setSeeding] = useState(false);
  const [results, setResults] = useState<SeedResult[]>([]);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const copySQL = () => {
    navigator.clipboard.writeText(SEED_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSeed = async () => {
    setSeeding(true);
    setResults([]);
    const newResults: SeedResult[] = [];

    const addResult = (table: string, status: SeedResult['status'], message: string) => {
      newResults.push({ table, status, message });
      setResults([...newResults]);
    };

    try {
      // 1. Site Settings
      const { data: existingSettings } = await supabase.from('site_settings').select('id').limit(1).maybeSingle();
      if (!existingSettings) {
        const { error } = await supabase.from('site_settings').insert({
          club_name: 'AISA',
          club_full_name: 'Artificial Intelligence and Data Science Students Association',
          college_name: 'ISBM College of Engineering, Pune',
          tagline: "A center of creativity and technological growth, driving students to design, develop, and deliver impactful solutions that shape tomorrow's world.",
          email: 'aisaclub@isbmcoe.org',
          phone: '7020640920',
          instagram_url: 'https://www.instagram.com/aisa_isbmcoe',
          linkedin_url: 'https://www.linkedin.com/company/aisa-isbmcoe',
          youtube_url: 'https://www.youtube.com/@aisa_isbmcoe',
        } as any);
        addResult('Site Settings', error ? 'error' : 'success', error ? error.message : 'Settings created');
      } else {
        addResult('Site Settings', 'skipped', 'Already exists');
      }

      // 2. Announcements
      const { count: annCount } = await supabase.from('announcements').select('*', { count: 'exact', head: true });
      if (!annCount) {
        const { error } = await supabase.from('announcements').insert([
          { content: '🎓 Applications open for AISA Core Team 2025-26 – Apply Now!', is_active: true, position: 1 },
          { content: '🏆 AISA students won 1st place at State Level Hackathon 2025!', is_active: true, position: 2 },
          { content: '📢 Workshop on Generative AI & LLMs – Register before seats fill up!', is_active: true, position: 3 },
          { content: '🌟 Congratulations to our alumni placed at top MNCs this placement season!', is_active: true, position: 4 },
        ] as any[]);
        addResult('Announcements', error ? 'error' : 'success', error ? error.message : '4 announcements added');
      } else {
        addResult('Announcements', 'skipped', `${annCount} already exist`);
      }

      // 3. Hero Slides
      const { count: slideCount } = await supabase.from('hero_slides').select('*', { count: 'exact', head: true });
      if (!slideCount) {
        const { error } = await supabase.from('hero_slides').insert([
          {
            title: 'Welcome to AISA Club',
            subtitle: 'Artificial Intelligence & Data Science Students Association at ISBM College of Engineering, Pune',
            image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1920&q=80',
            button_text: 'Explore Events',
            button_link: '/events',
            position: 1,
            is_active: true,
          },
          {
            title: 'Innovate. Build. Lead.',
            subtitle: 'Join us in shaping the future of AI & Data Science through hands-on projects, workshops, and industry collaborations.',
            image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1920&q=80',
            button_text: 'Meet Our Team',
            button_link: '/team',
            position: 2,
            is_active: true,
          },
          {
            title: 'Learn from Industry Experts',
            subtitle: 'Access workshops, seminars, and mentoring sessions with leading professionals in AI, ML, and Data Science.',
            image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80',
            button_text: 'View Gallery',
            button_link: '/gallery',
            position: 3,
            is_active: true,
          },
        ] as any[]);
        addResult('Hero Slides', error ? 'error' : 'success', error ? error.message : '3 slides added');
      } else {
        addResult('Hero Slides', 'skipped', `${slideCount} already exist`);
      }

      // 4. Stats
      const { count: statCount } = await supabase.from('stats').select('*', { count: 'exact', head: true });
      if (!statCount) {
        const { error } = await supabase.from('stats').insert([
          { label: 'Active Members', value: '200+', icon: 'users', position: 1, is_active: true },
          { label: 'Events Organized', value: '50+', icon: 'calendar', position: 2, is_active: true },
          { label: 'Awards Won', value: '15+', icon: 'award', position: 3, is_active: true },
          { label: 'Industry Partners', value: '10+', icon: 'handshake', position: 4, is_active: true },
        ] as any[]);
        addResult('Stats', error ? 'error' : 'success', error ? error.message : '4 stats added');
      } else {
        addResult('Stats', 'skipped', `${statCount} already exist`);
      }

      // 5. About Features
      const { count: featureCount } = await supabase.from('about_features').select('*', { count: 'exact', head: true });
      if (!featureCount) {
        const { error } = await supabase.from('about_features').insert([
          { title: 'Technical Excellence', description: 'Hands-on workshops and projects in AI, Machine Learning, Deep Learning, and Data Science to build real-world skills.', icon: 'code', position: 1, is_active: true },
          { title: 'Industry Connections', description: 'Direct exposure to industry professionals through guest lectures, internships, and industry-sponsored hackathons.', icon: 'handshake', position: 2, is_active: true },
          { title: 'Research & Innovation', description: 'Encouraging research culture with student-led projects, paper publications, and innovation challenges.', icon: 'trending-up', position: 3, is_active: true },
          { title: 'Holistic Development', description: 'Beyond technical skills — leadership, communication, and entrepreneurship programs for all-round growth.', icon: 'graduation-cap', position: 4, is_active: true },
          { title: 'Competitive Edge', description: 'Participation in state and national-level competitions, hackathons, and data science challenges.', icon: 'award', position: 5, is_active: true },
          { title: 'Community & Networking', description: 'A vibrant peer community fostering collaboration, knowledge sharing, and lifelong professional connections.', icon: 'users', position: 6, is_active: true },
        ] as any[]);
        addResult('About Features', error ? 'error' : 'success', error ? error.message : '6 features added');
      } else {
        addResult('About Features', 'skipped', `${featureCount} already exist`);
      }

      // 6. Team Categories
      const { count: catCount } = await supabase.from('team_categories').select('*', { count: 'exact', head: true });
      if (!catCount) {
        const { error } = await supabase.from('team_categories').insert([
          { name: 'faculty', label: 'Faculty Coordinators', position: 1, is_active: true },
          { name: 'core', label: 'Core Team', position: 2, is_active: true },
          { name: 'technical', label: 'Technical Team', position: 3, is_active: true },
          { name: 'design', label: 'Design Team', position: 4, is_active: true },
          { name: 'management', label: 'Management Team', position: 5, is_active: true },
        ] as any[]);
        addResult('Team Categories', error ? 'error' : 'success', error ? error.message : '5 categories added');
      } else {
        addResult('Team Categories', 'skipped', `${catCount} already exist`);
      }

      // 7. Team Members
      const { count: memberCount } = await supabase.from('team_members').select('*', { count: 'exact', head: true });
      if (!memberCount) {
        const { error } = await supabase.from('team_members').insert([
          { name: 'Prof. Anita Sharma', role: 'Faculty Coordinator', category: 'faculty', description: 'Faculty Coordinator for AISA with expertise in Machine Learning and Data Analytics.', position: 1, is_active: true },
          { name: 'Prof. Rajesh Patil', role: 'Co-Faculty Coordinator', category: 'faculty', description: 'Co-Faculty Coordinator specializing in Artificial Intelligence and Deep Learning.', position: 2, is_active: true },
          { name: 'Arjun Mehta', role: 'President', category: 'core', description: 'Leading AISA with vision for innovation and student development.', position: 1, is_active: true },
          { name: 'Priya Desai', role: 'Vice President', category: 'core', description: 'Driving club initiatives and managing cross-functional teams.', position: 2, is_active: true },
          { name: 'Rohan Kulkarni', role: 'General Secretary', category: 'core', description: 'Handling club operations, communications, and event planning.', position: 3, is_active: true },
          { name: 'Sneha Joshi', role: 'Technical Head', category: 'technical', description: 'Leading technical projects and workshops on AI/ML technologies.', position: 1, is_active: true },
          { name: 'Amit Patel', role: 'Data Science Lead', category: 'technical', description: 'Managing data science projects and competitions.', position: 2, is_active: true },
          { name: 'Kavya Nair', role: 'Design Head', category: 'design', description: 'Creating visual identity and design assets for the club.', position: 1, is_active: true },
          { name: 'Rahul Verma', role: 'Event Manager', category: 'management', description: 'Coordinating and organizing all AISA events and activities.', position: 1, is_active: true },
          { name: 'Pooja Rane', role: 'PR & Marketing', category: 'management', description: 'Managing public relations, social media, and club outreach.', position: 2, is_active: true },
        ] as any[]);
        addResult('Team Members', error ? 'error' : 'success', error ? error.message : '10 members added');
      } else {
        addResult('Team Members', 'skipped', `${memberCount} already exist`);
      }

      // 8. Alumni
      const { count: alumniCount } = await supabase.from('alumni').select('*', { count: 'exact', head: true });
      if (!alumniCount) {
        const { error } = await supabase.from('alumni').insert([
          { name: 'Vikram Singh', graduation_year: '2023', company: 'TCS', job_title: 'Data Analyst', branch: 'AI & DS', position: 1 },
          { name: 'Neha Kulkarni', graduation_year: '2023', company: 'Infosys', job_title: 'ML Engineer', branch: 'AI & DS', position: 2 },
          { name: 'Aditya Sharma', graduation_year: '2022', company: 'Wipro', job_title: 'Data Scientist', branch: 'AI & DS', position: 3 },
          { name: 'Manasi Patil', graduation_year: '2022', company: 'Accenture', job_title: 'AI Engineer', branch: 'AI & DS', position: 4 },
          { name: 'Siddharth Jain', graduation_year: '2021', company: 'Cognizant', job_title: 'Business Analyst', branch: 'AI & DS', position: 5 },
          { name: 'Rutuja Deshmukh', graduation_year: '2021', company: 'Tech Mahindra', job_title: 'Software Engineer', branch: 'AI & DS', position: 6 },
        ] as any[]);
        addResult('Alumni', error ? 'error' : 'success', error ? error.message : '6 alumni added');
      } else {
        addResult('Alumni', 'skipped', `${alumniCount} already exist`);
      }

      // 9. Events
      const { count: eventCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
      if (!eventCount) {
        const now = new Date();
        const future30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const future45 = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString();
        const future15 = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString();
        const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const past60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
        const { error } = await supabase.from('events').insert([
          { title: 'AI & ML Workshop Series', description: 'A comprehensive 3-day workshop series covering Machine Learning fundamentals, Neural Networks, and real-world AI applications. Hands-on sessions with industry mentors.', event_type: 'workshop', event_date: future30, location: 'ISBM College of Engineering, Pune', max_participants: 60, entry_fee: 0, is_active: true, is_completed: false, current_participants: 0 },
          { title: 'DataThon 2025', description: "AISA's flagship data science hackathon where teams compete to solve real-world data problems. Prizes worth ₹50,000+ and direct internship opportunities.", event_type: 'hackathon', event_date: future45, location: 'ISBM College of Engineering, Pune', max_participants: 100, entry_fee: 200, is_active: true, is_completed: false, current_participants: 0 },
          { title: 'Industry Talk: Future of AI', description: 'An exclusive guest lecture by senior professionals from leading AI companies. Gain insights into career paths, industry trends, and future opportunities in AI.', event_type: 'seminar', event_date: future15, location: 'ISBM College Auditorium, Pune', max_participants: 200, entry_fee: 0, is_active: true, is_completed: false, current_participants: 0 },
          { title: 'Python & Data Science Bootcamp', description: 'An intensive bootcamp covering Python programming, data analysis with Pandas, and visualization with Matplotlib and Seaborn.', event_type: 'workshop', event_date: past30, location: 'ISBM College of Engineering, Pune', entry_fee: 0, is_active: true, is_completed: true, current_participants: 55 },
          { title: 'Smart India Hackathon Prep Camp', description: 'Preparation camp for SIH with mock problem statements, team building, and mentoring sessions.', event_type: 'hackathon', event_date: past60, location: 'ISBM College of Engineering, Pune', entry_fee: 0, is_active: true, is_completed: true, current_participants: 80 },
        ] as any[]);
        addResult('Events', error ? 'error' : 'success', error ? error.message : '5 events added');
      } else {
        addResult('Events', 'skipped', `${eventCount} already exist`);
      }

      // 10. Partners
      const { count: partnerCount } = await supabase.from('partners').select('*', { count: 'exact', head: true });
      if (!partnerCount) {
        const { error } = await supabase.from('partners').insert([
          { name: 'TCS iON', website_url: 'https://iontcs.com', position: 1, is_active: true },
          { name: 'Internshala', website_url: 'https://internshala.com', position: 2, is_active: true },
          { name: 'NASSCOM', website_url: 'https://nasscom.in', position: 3, is_active: true },
          { name: 'Coursera', website_url: 'https://coursera.org', position: 4, is_active: true },
          { name: 'IEEE', website_url: 'https://ieee.org', position: 5, is_active: true },
          { name: 'GitHub Education', website_url: 'https://education.github.com', position: 6, is_active: true },
        ] as any[]);
        addResult('Partners', error ? 'error' : 'success', error ? error.message : '6 partners added');
      } else {
        addResult('Partners', 'skipped', `${partnerCount} already exist`);
      }

      // Invalidate all queries
      queryClient.invalidateQueries();
      toast.success('Database setup complete! Refreshing data...');
    } catch (err: any) {
      toast.error(`Unexpected error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" />
          Database Setup
        </h1>
        <p className="text-muted-foreground">Seed the database with default data for all sections of the website.</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: SQL Patch */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <h2 className="font-display text-lg font-semibold text-amber-900 dark:text-amber-100 mb-3">
            Step 1: Run Schema Fixes in Supabase
          </h2>
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
            Some database columns may be missing. Copy this SQL and run it in your Supabase SQL Editor 
            (Database → SQL Editor) to fix the schema first.
          </p>
          <Button variant="outline" size="sm" onClick={copySQL} className="border-amber-400 text-amber-800 hover:bg-amber-100">
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy SQL Patch'}
          </Button>
          <details className="mt-4">
            <summary className="text-xs text-amber-700 cursor-pointer hover:text-amber-900">View SQL</summary>
            <pre className="mt-2 text-xs bg-amber-100 dark:bg-amber-950 p-3 rounded overflow-auto max-h-48 text-amber-900 dark:text-amber-100">
              {SEED_SQL}
            </pre>
          </details>
        </div>

        {/* Step 2: Seed Data */}
        <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <h2 className="font-display text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Step 2: Seed Default Data
          </h2>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
            Populate the database with default AISA content: site settings, announcements, hero slides, 
            stats, team members, events, alumni, and partners.
          </p>
          <div className="text-xs text-blue-700 dark:text-blue-300 mb-4 space-y-1">
            <div>✓ Site Settings & Announcements</div>
            <div>✓ Hero Slides & Stats</div>
            <div>✓ About Features</div>
            <div>✓ Team Categories & Members</div>
            <div>✓ Alumni, Events & Partners</div>
          </div>
          <Button onClick={runSeed} disabled={seeding}>
            {seeding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {seeding ? 'Setting up...' : 'Run Database Setup'}
          </Button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Setup Results</h2>
            <div className="flex items-center gap-4 text-sm">
              {successCount > 0 && <span className="text-green-600 font-medium">{successCount} added</span>}
              {skippedCount > 0 && <span className="text-blue-600 font-medium">{skippedCount} skipped</span>}
              {errorCount > 0 && <span className="text-red-600 font-medium">{errorCount} errors</span>}
            </div>
          </div>
          <div className="space-y-2">
            {results.map((result, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                result.status === 'success' ? 'bg-green-50 dark:bg-green-950/20' :
                result.status === 'error' ? 'bg-red-50 dark:bg-red-950/20' :
                'bg-muted'
              }`}>
                {result.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : result.status === 'error' ? (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-blue-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <span className={`font-medium text-sm ${
                    result.status === 'success' ? 'text-green-800 dark:text-green-300' :
                    result.status === 'error' ? 'text-red-800 dark:text-red-300' :
                    'text-muted-foreground'
                  }`}>
                    {result.table}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">— {result.message}</span>
                </div>
              </div>
            ))}
          </div>
          {results.length > 0 && !seeding && (
            <div className="mt-4 p-3 rounded-lg bg-primary/10 text-sm text-primary">
              Setup complete! Visit the website homepage to see your content. If some items failed, 
              make sure you ran the SQL patch in Step 1 first, then try again.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseSetupPage;
