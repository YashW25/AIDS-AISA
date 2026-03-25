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