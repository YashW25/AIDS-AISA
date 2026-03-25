-- Create alumni table
CREATE TABLE public.alumni (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  graduation_year TEXT NOT NULL,
  branch TEXT,
  company TEXT,
  job_title TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  testimonial TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read alumni"
ON public.alumni
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage alumni"
ON public.alumni
FOR ALL
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_alumni_updated_at
BEFORE UPDATE ON public.alumni
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();