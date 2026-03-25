-- Create certificate templates table
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES public.clubs(id),
  event_id uuid REFERENCES public.events(id),
  template_name text NOT NULL,
  template_url text NOT NULL,
  name_position_x integer DEFAULT 50,
  name_position_y integer DEFAULT 50,
  date_position_x integer DEFAULT 50,
  date_position_y integer DEFAULT 65,
  cert_number_position_x integer DEFAULT 85,
  cert_number_position_y integer DEFAULT 90,
  qr_position_x integer DEFAULT 10,
  qr_position_y integer DEFAULT 80,
  rank_position_x integer DEFAULT 50,
  rank_position_y integer DEFAULT 45,
  font_size integer DEFAULT 24,
  font_color text DEFAULT '#000000',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for certificate templates
CREATE POLICY "Club admins can manage their templates" 
ON public.certificate_templates 
FOR ALL 
USING (is_club_admin(club_id) OR is_super_admin());

CREATE POLICY "Public can read active templates" 
ON public.certificate_templates 
FOR SELECT 
USING (is_active = true);

-- Add certificate_url column to certificates if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'certificates' AND column_name = 'certificate_url'
  ) THEN
    ALTER TABLE public.certificates ADD COLUMN certificate_url text;
  END IF;
END $$;

-- Add rank column to certificates for position (1st, 2nd, 3rd, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'certificates' AND column_name = 'rank'
  ) THEN
    ALTER TABLE public.certificates ADD COLUMN rank text;
  END IF;
END $$;

-- Add template_id to certificates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'certificates' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE public.certificates ADD COLUMN template_id uuid REFERENCES public.certificate_templates(id);
  END IF;
END $$;

-- Create trigger for updated_at
CREATE TRIGGER update_certificate_templates_updated_at
BEFORE UPDATE ON public.certificate_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();