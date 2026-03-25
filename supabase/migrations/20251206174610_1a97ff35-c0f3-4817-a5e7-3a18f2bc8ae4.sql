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