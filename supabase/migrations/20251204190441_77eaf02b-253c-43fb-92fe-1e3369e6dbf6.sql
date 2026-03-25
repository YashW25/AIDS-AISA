-- Allow club admins to update their own club's settings
CREATE POLICY "Club admins can update their own club" 
ON public.clubs 
FOR UPDATE 
USING (is_club_admin(id))
WITH CHECK (is_club_admin(id));