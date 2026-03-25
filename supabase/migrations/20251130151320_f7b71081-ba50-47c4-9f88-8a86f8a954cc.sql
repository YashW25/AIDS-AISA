-- Add actual_participants column to track how many actually participated
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS actual_participants integer DEFAULT 0;