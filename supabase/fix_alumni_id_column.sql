-- Fix: Add id column to alumni table if it doesn't exist
-- Run this in Supabase SQL Editor if you see errors about alumni.id

DO $$
BEGIN
  -- Step 1: Add UUID id column only if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'alumni'
      AND column_name  = 'id'
  ) THEN
    -- Add the id column
    ALTER TABLE public.alumni ADD COLUMN id UUID DEFAULT gen_random_uuid();

    -- Temporarily disable RLS so we can populate existing rows
    ALTER TABLE public.alumni DISABLE ROW LEVEL SECURITY;

    -- Generate UUIDs for all existing rows
    UPDATE public.alumni SET id = gen_random_uuid() WHERE id IS NULL;

    -- Re-enable RLS
    ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;

    -- Attempt to add primary key (skip if one already exists on another column)
    BEGIN
      ALTER TABLE public.alumni ADD PRIMARY KEY (id);
    EXCEPTION WHEN others THEN
      NULL; -- A primary key already exists — leave it
    END;

    RAISE NOTICE 'SUCCESS: id column added to alumni table.';
  ELSE
    -- Column exists but rows might still have NULL — fix those too
    ALTER TABLE public.alumni DISABLE ROW LEVEL SECURITY;
    UPDATE public.alumni SET id = gen_random_uuid() WHERE id IS NULL;
    ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE 'id column already exists — ensured no NULL values remain.';
  END IF;
END $$;
