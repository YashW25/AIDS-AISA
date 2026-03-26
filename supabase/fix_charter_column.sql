-- Run this in your Supabase SQL Editor to fix the missing file_type column
ALTER TABLE public.charter_settings
  ADD COLUMN IF NOT EXISTS file_type text DEFAULT 'pdf';
