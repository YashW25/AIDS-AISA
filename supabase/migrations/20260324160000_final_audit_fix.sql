-- Final System Audit - Missing Tables & RPCs Fix
-- Run this in your Supabase SQL Editor if MCP application fails.

-- 1. Create news table if not exists
CREATE TABLE IF NOT EXISTS public.news (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    attachment_url TEXT,
    published_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_marquee BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create occasions table if not exists
CREATE TABLE IF NOT EXISTS public.occasions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    occasion_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    category TEXT DEFAULT 'general',
    drive_folder_link TEXT,
    cover_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create downloads table if not exists
CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    drive_url TEXT,
    file_type TEXT DEFAULT 'pdf',
    file_size TEXT,
    is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create visitor_counter table
CREATE TABLE IF NOT EXISTS public.visitor_counter (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Initialize count if empty
INSERT INTO public.visitor_counter (count)
SELECT 2300 WHERE NOT EXISTS (SELECT 1 FROM public.visitor_counter);

-- 5. Create increment_visitor_count RPC
CREATE OR REPLACE FUNCTION public.increment_visitor_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_count integer;
BEGIN
    UPDATE public.visitor_counter
    SET count = count + 1,
        updated_at = now()
    WHERE id = (SELECT id FROM public.visitor_counter LIMIT 1)
    RETURNING count INTO new_count;
    
    RETURN new_count;
END;
$$;

-- 6. Ensure alumni has is_active
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alumni' AND column_name='is_active') THEN
        ALTER TABLE public.alumni ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 7. Enable RLS and add basic policies
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_counter ENABLE ROW LEVEL SECURITY;

-- 8. Public Read Policies
DROP POLICY IF EXISTS "Public can read active news" ON public.news;
CREATE POLICY "Public can read active news" ON public.news FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can read active occasions" ON public.occasions;
CREATE POLICY "Public can read active occasions" ON public.occasions FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can read active downloads" ON public.downloads;
CREATE POLICY "Public can read active downloads" ON public.downloads FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can read visitor count" ON public.visitor_counter;
CREATE POLICY "Public can read visitor count" ON public.visitor_counter FOR SELECT USING (true);
