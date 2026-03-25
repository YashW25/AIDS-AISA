import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClub } from '@/contexts/ClubContext';
import { toast } from 'sonner';
import { Club, ClubAdmin } from '@/types/database';

// Fetch all clubs (for super admin)
export const useAllClubs = () => {
  return useQuery({
    queryKey: ['all-clubs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Club[];
    },
  });
};

// Fetch club admins for a specific club
export const useClubAdmins = (clubId?: string) => {
  const { clubId: currentClubId } = useClub();
  const targetClubId = clubId || currentClubId;

  return useQuery({
    queryKey: ['club-admins', targetClubId],
    queryFn: async () => {
      if (!targetClubId) return [];
      
      const { data, error } = await supabase
        .from('club_admins')
        .select('*')
        .eq('club_id', targetClubId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ClubAdmin[];
    },
    enabled: !!targetClubId,
  });
};

// Check if current user is admin of current club
export const useIsClubAdmin = () => {
  const { clubId } = useClub();

  return useQuery({
    queryKey: ['is-club-admin', clubId],
    queryFn: async () => {
      if (!clubId) return false;
      
      const { data, error } = await supabase.rpc('is_club_admin', { _club_id: clubId });
      
      if (error) {
        console.error('Error checking club admin status:', error);
        return false;
      }
      return data as boolean;
    },
    enabled: !!clubId,
  });
};

// Check if current user is super admin
export const useIsSuperAdmin = () => {
  return useQuery({
    queryKey: ['is-super-admin'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_super_admin');
      
      if (error) {
        console.error('Error checking super admin status:', error);
        return false;
      }
      return data as boolean;
    },
  });
};

// Get clubs that current user is admin of
export const useUserClubs = () => {
  return useQuery({
    queryKey: ['user-clubs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('club_admins')
        .select(`
          club_id,
          role,
          is_primary,
          clubs (*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
  });
};

// Create a new club (super admin only)
export const useCreateClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (club: Omit<Club, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('clubs')
        .insert(club)
        .select()
        .single();
      
      if (error) throw error;
      return data as Club;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-clubs'] });
      toast.success('Club created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create club: ${error.message}`);
    },
  });
};

// Update a club (super admin only)
export const useUpdateClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Club>) => {
      const { data, error } = await supabase
        .from('clubs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Club;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-clubs'] });
      toast.success('Club updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update club: ${error.message}`);
    },
  });
};

// Delete a club (super admin only)
export const useDeleteClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-clubs'] });
      toast.success('Club deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete club: ${error.message}`);
    },
  });
};

// Add club admin
export const useAddClubAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (admin: Omit<ClubAdmin, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('club_admins')
        .insert(admin)
        .select()
        .single();
      
      if (error) throw error;
      return data as ClubAdmin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-admins'] });
      toast.success('Admin added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add admin: ${error.message}`);
    },
  });
};

// Remove club admin
export const useRemoveClubAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('club_admins')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-admins'] });
      toast.success('Admin removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove admin: ${error.message}`);
    },
  });
};
