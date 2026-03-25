
-- Update is_any_club_admin to also check user_roles for admin/teacher roles
CREATE OR REPLACE FUNCTION public.is_any_club_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_admins 
    WHERE user_id = auth.uid()
  ) OR public.is_super_admin() OR public.is_admin()
$$;
