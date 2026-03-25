-- Add is_suspended column to clubs table for payment pending feature
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS suspension_reason text;

-- Fix Innovation Cell admin - remove duplicate student role
DELETE FROM public.user_roles 
WHERE user_id = 'b4adb301-3c53-4331-9b20-31bafd73e75b' 
AND role = 'student';