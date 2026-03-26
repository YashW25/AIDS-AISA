-- Run this ONCE in the Supabase SQL Editor to enable admin/teacher creation
-- from the frontend without needing the Edge Function.
-- If you ran the previous version, just run this again to replace it.

CREATE OR REPLACE FUNCTION public.assign_admin_role(
  p_user_id   uuid,
  p_role      text,
  p_full_name text,
  p_email     text,
  p_club_id   uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_db_role      app_role;
  v_profile_role text;
BEGIN
  -- Cast text → app_role enum
  v_db_role      := CASE p_role WHEN 'teacher' THEN 'teacher'::app_role ELSE 'admin'::app_role END;
  v_profile_role := CASE p_role WHEN 'teacher' THEN 'editor' ELSE 'admin' END;

  -- Upsert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, v_db_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Upsert into admin_profiles
  INSERT INTO public.admin_profiles (id, email, full_name, role, is_active)
  VALUES (p_user_id, p_email, p_full_name, v_profile_role, true)
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role      = EXCLUDED.role,
        is_active = true;

  -- Upsert into club_admins (only when a club_id is supplied)
  IF p_club_id IS NOT NULL THEN
    INSERT INTO public.club_admins (club_id, user_id, role, is_primary)
    VALUES (p_club_id, p_user_id, p_role, false)
    ON CONFLICT (club_id, user_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object('success', true, 'user_id', p_user_id);
END;
$$;

-- Allow any authenticated user to call this function
GRANT EXECUTE ON FUNCTION public.assign_admin_role TO authenticated;
