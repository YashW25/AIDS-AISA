-- Run this in the Supabase SQL Editor (replace any previous version).
-- Creates admins/teachers directly — NO email confirmation required.

CREATE OR REPLACE FUNCTION public.create_admin_user_direct(
  p_email     text,
  p_password  text,
  p_full_name text,
  p_role      text,
  p_club_id   uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_user_id      uuid;
  v_db_role      app_role;
  v_profile_role text;
BEGIN
  -- Check if user already exists in auth
  SELECT id INTO v_user_id FROM auth.users WHERE email = lower(p_email);

  IF v_user_id IS NULL THEN
    -- Create auth user directly — email already confirmed, no email sent
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      raw_app_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      lower(p_email),
      crypt(p_password, gen_salt('bf')),
      now(),
      jsonb_build_object('full_name', p_full_name),
      '{"provider":"email","providers":["email"]}'::jsonb,
      now(),
      now(),
      '',
      ''
    );

    -- Also create the public profile entry
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', lower(p_email)),
      'email',
      lower(p_email),
      now(),
      now(),
      now()
    );
  END IF;

  -- Normalise role
  v_db_role      := CASE p_role WHEN 'teacher' THEN 'teacher'::app_role ELSE 'admin'::app_role END;
  v_profile_role := CASE p_role WHEN 'teacher' THEN 'editor' ELSE 'admin' END;

  -- Upsert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, v_db_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Upsert into admin_profiles
  INSERT INTO public.admin_profiles (id, email, full_name, role, is_active)
  VALUES (v_user_id, lower(p_email), p_full_name, v_profile_role, true)
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role      = EXCLUDED.role,
        is_active = true;

  -- Upsert into club_admins (only when club_id supplied)
  IF p_club_id IS NOT NULL THEN
    INSERT INTO public.club_admins (club_id, user_id, role, is_primary)
    VALUES (p_club_id, v_user_id, p_role, false)
    ON CONFLICT (club_id, user_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_admin_user_direct TO authenticated;
