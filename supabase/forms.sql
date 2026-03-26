-- Run this in Supabase Dashboard → SQL Editor → New Query
-- Creates forms and form_submissions tables

CREATE TABLE IF NOT EXISTS public.forms (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text NOT NULL,
  description text DEFAULT '',
  slug        text UNIQUE NOT NULL,
  fields      jsonb DEFAULT '[]'::jsonb,
  settings    jsonb DEFAULT '{}'::jsonb,
  is_published boolean DEFAULT false,
  created_by  uuid REFERENCES auth.users(id),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.form_submissions (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id      uuid REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
  responses    jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Drop old policies if re-running
DROP POLICY IF EXISTS "admins_manage_forms" ON public.forms;
DROP POLICY IF EXISTS "teachers_manage_own_forms" ON public.forms;
DROP POLICY IF EXISTS "public_read_published_forms" ON public.forms;
DROP POLICY IF EXISTS "public_submit_forms" ON public.form_submissions;
DROP POLICY IF EXISTS "admins_view_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "teachers_view_own_submissions" ON public.form_submissions;

-- Admins manage ALL forms
CREATE POLICY "admins_manage_forms" ON public.forms FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

-- Teachers manage their OWN forms
CREATE POLICY "teachers_manage_own_forms" ON public.forms FOR ALL TO authenticated
  USING (
    created_by = auth.uid() AND
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'teacher'::app_role)
  )
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'teacher'::app_role)
  );

-- Anyone (including anonymous) can READ published forms
CREATE POLICY "public_read_published_forms" ON public.forms FOR SELECT TO anon, authenticated
  USING (is_published = true);

-- Anyone can SUBMIT to published forms
CREATE POLICY "public_submit_forms" ON public.form_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.forms WHERE id = form_id AND is_published = true)
  );

-- Admins see ALL submissions
CREATE POLICY "admins_view_submissions" ON public.form_submissions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

-- Teachers see submissions for their own forms
CREATE POLICY "teachers_view_own_submissions" ON public.form_submissions FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.forms WHERE forms.id = form_id AND forms.created_by = auth.uid())
  );

GRANT ALL ON public.forms TO authenticated;
GRANT ALL ON public.form_submissions TO authenticated;
GRANT SELECT ON public.forms TO anon;
GRANT INSERT ON public.form_submissions TO anon;
