
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
