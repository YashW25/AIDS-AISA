-- Run this in Supabase Dashboard → SQL Editor → New Query
-- Creates the teacher_messages table for the teacher → admin messaging feature

CREATE TABLE IF NOT EXISTS public.teacher_messages (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_name text,
  teacher_email text,
  subject      text NOT NULL,
  message      text NOT NULL,
  is_read      boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teacher_messages ENABLE ROW LEVEL SECURITY;

-- Teachers can INSERT their own messages
CREATE POLICY "teachers_can_send"
  ON public.teacher_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = teacher_id);

-- Teachers can view only their own messages
CREATE POLICY "teachers_view_own"
  ON public.teacher_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

-- Admins / super_admins can do everything
CREATE POLICY "admins_full_access"
  ON public.teacher_messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

GRANT ALL ON public.teacher_messages TO authenticated;
