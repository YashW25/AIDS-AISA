-- Fix: Add id column to alumni table if it doesn't exist
-- Run this in Supabase SQL Editor if you see "column alumni.id does not exist"

DO $$
BEGIN
  -- Add UUID id column only if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'alumni'
      AND column_name  = 'id'
  ) THEN
    -- Add the column
    ALTER TABLE public.alumni ADD COLUMN id UUID DEFAULT gen_random_uuid();

    -- Populate any existing rows that have a NULL id
    UPDATE public.alumni SET id = gen_random_uuid() WHERE id IS NULL;

    -- Attempt to set it as the primary key (skip if one already exists)
    BEGIN
      ALTER TABLE public.alumni ADD PRIMARY KEY (id);
    EXCEPTION WHEN others THEN
      -- A primary key already exists on another column — that's fine, leave it
      NULL;
    END;

    RAISE NOTICE 'id column added to alumni table successfully.';
  ELSE
    RAISE NOTICE 'id column already exists on alumni table — no changes made.';
  END IF;
END $$;
