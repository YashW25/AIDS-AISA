-- Students Table
-- Run this in the Supabase SQL Editor to create the students management table.
-- Students are club members who will be auto-flagged for alumni transfer after their graduation year.

CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  enrollment_number TEXT,
  email TEXT,
  phone TEXT,
  branch TEXT DEFAULT 'AI & DS',
  batch_year TEXT NOT NULL,
  graduation_year TEXT NOT NULL,
  image_url TEXT,
  linkedin_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  transferred_to_alumni BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view students
CREATE POLICY IF NOT EXISTS "Authenticated users can view students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

-- Allow all authenticated users to view students (public read for website)
CREATE POLICY IF NOT EXISTS "Public can view active students"
  ON students FOR SELECT
  TO anon
  USING (is_active = true);

-- Allow admins to manage students (insert/update/delete)
CREATE POLICY IF NOT EXISTS "Admins can manage students"
  ON students FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Optional: Add an index for fast lookup by graduation year (used for auto-transfer detection)
CREATE INDEX IF NOT EXISTS idx_students_graduation_year ON students (graduation_year);
CREATE INDEX IF NOT EXISTS idx_students_transferred ON students (transferred_to_alumni);
