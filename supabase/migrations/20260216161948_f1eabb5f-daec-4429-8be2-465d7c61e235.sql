
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
