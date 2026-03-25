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