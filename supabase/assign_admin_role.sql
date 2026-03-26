-- Run this entire script in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Replaces any previous version.

-- ─────────────────────────────────────────────────────────────────
-- assign_admin_role
-- Called AFTER the auth user has already been created via the
-- Supabase Admin API (adminClient.auth.admin.createUser).
-- It only handles the role + profile side, not auth.users.
-- ─────────────────────────────────────────────────────────────────
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
  -- Normalise role → app_role enum
  v_db_role      := CASE p_role WHEN 'teacher' THEN 'teacher'::app_role ELSE 'admin'::app_role END;
  v_profile_role := CASE p_role WHEN 'teacher' THEN 'editor' ELSE 'admin' END;

  -- Upsert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, v_db_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Upsert into admin_profiles (this is what the admin list reads)
  INSERT INTO public.admin_profiles (id, email, full_name, role, is_active)
  VALUES (p_user_id, lower(p_email), p_full_name, v_profile_role, true)
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role      = EXCLUDED.role,
        email     = EXCLUDED.email,
        is_active = true;

  -- Optionally add to club_admins (only when club_id is supplied)
  IF p_club_id IS NOT NULL THEN
    INSERT INTO public.club_admins (club_id, user_id, role, is_primary)
    VALUES (p_club_id, p_user_id, p_role, false)
    ON CONFLICT (club_id, user_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object('success', true, 'user_id', p_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_admin_role TO authenticated;


-- ─────────────────────────────────────────────────────────────────
-- create_admin_user_direct  (legacy — kept for reference only)
-- Previously used direct auth.users insertion which was unreliable.
-- The new approach uses the Admin API + assign_admin_role above.
-- ─────────────────────────────────────────────────────────────────
