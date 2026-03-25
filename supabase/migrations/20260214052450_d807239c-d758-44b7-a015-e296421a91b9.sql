
-- Create visitor counter table
CREATE TABLE public.visitor_counter (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  count bigint NOT NULL DEFAULT 2300,
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert initial row
INSERT INTO public.visitor_counter (count) VALUES (2300);

-- Enable RLS
ALTER TABLE public.visitor_counter ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Public can read visitor count" ON public.visitor_counter FOR SELECT USING (true);

-- Create increment function
CREATE OR REPLACE FUNCTION public.increment_visitor_count()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  UPDATE public.visitor_counter
  SET count = count + 1, updated_at = now()
  WHERE id = (SELECT id FROM public.visitor_counter LIMIT 1)
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;
