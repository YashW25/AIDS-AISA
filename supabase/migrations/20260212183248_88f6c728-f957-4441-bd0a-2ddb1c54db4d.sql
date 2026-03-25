
-- Drop and recreate admin policies for all content tables to not require club_id

-- announcements
DROP POLICY IF EXISTS "Club admins can manage their announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- about_features
DROP POLICY IF EXISTS "Club admins can manage their about features" ON public.about_features;
CREATE POLICY "Admins can manage about features" ON public.about_features FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- alumni
DROP POLICY IF EXISTS "Club admins can manage their alumni" ON public.alumni;
CREATE POLICY "Admins can manage alumni" ON public.alumni FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- hero_slides
DROP POLICY IF EXISTS "Club admins can manage their hero slides" ON public.hero_slides;
CREATE POLICY "Admins can manage hero slides" ON public.hero_slides FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- events
DROP POLICY IF EXISTS "Club admins can manage their events" ON public.events;
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- gallery
DROP POLICY IF EXISTS "Club admins can manage their gallery" ON public.gallery;
CREATE POLICY "Admins can manage gallery" ON public.gallery FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- partners
DROP POLICY IF EXISTS "Club admins can manage their partners" ON public.partners;
CREATE POLICY "Admins can manage partners" ON public.partners FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- team_members
DROP POLICY IF EXISTS "Club admins can manage their team members" ON public.team_members;
CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- stats
DROP POLICY IF EXISTS "Club admins can manage their stats" ON public.stats;
CREATE POLICY "Admins can manage stats" ON public.stats FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- news
DROP POLICY IF EXISTS "Club admins can manage their news" ON public.news;
CREATE POLICY "Admins can manage news" ON public.news FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- downloads
DROP POLICY IF EXISTS "Club admins can manage their downloads" ON public.downloads;
CREATE POLICY "Admins can manage downloads" ON public.downloads FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- occasions
DROP POLICY IF EXISTS "Club admins can manage their occasions" ON public.occasions;
CREATE POLICY "Admins can manage occasions" ON public.occasions FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- popup_announcements
DROP POLICY IF EXISTS "Club admins can manage their popups" ON public.popup_announcements;
CREATE POLICY "Admins can manage popups" ON public.popup_announcements FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- charter_settings
DROP POLICY IF EXISTS "Club admins can manage their charter" ON public.charter_settings;
CREATE POLICY "Admins can manage charter" ON public.charter_settings FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- quick_links
DROP POLICY IF EXISTS "Club admins can manage their quick links" ON public.quick_links;
CREATE POLICY "Admins can manage quick links" ON public.quick_links FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- certificate_templates
DROP POLICY IF EXISTS "Club admins can manage their templates" ON public.certificate_templates;
CREATE POLICY "Admins can manage templates" ON public.certificate_templates FOR ALL USING (is_any_club_admin()) WITH CHECK (is_any_club_admin());

-- user_profiles - update club admin policies
DROP POLICY IF EXISTS "Club admins can view profiles in their club" ON public.user_profiles;
DROP POLICY IF EXISTS "Club admins can manage profiles in their club" ON public.user_profiles;
DROP POLICY IF EXISTS "Club admins can delete profiles in their club" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles" ON public.user_profiles FOR SELECT USING (is_any_club_admin() OR (auth.uid() = user_id));
CREATE POLICY "Admins can update all profiles" ON public.user_profiles FOR UPDATE USING (is_any_club_admin() OR (auth.uid() = user_id));
CREATE POLICY "Admins can delete profiles" ON public.user_profiles FOR DELETE USING (is_any_club_admin());
