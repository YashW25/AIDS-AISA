import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Generic fetch all hook - no club filtering (single-club mode)
export const useAdminFetch = <T>(table: string, queryKey: string, orderBy: string = 'position', ascending: boolean = true) => {
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from(table)
        .select('*')
        .order(orderBy, { ascending });
      if (error) {
        // If ordering by position fails (column missing), try without ordering
        if (error.code === '42703' || error.message?.includes('does not exist')) {
          const fallback = await (supabase as any).from(table).select('*');
          if (fallback.error) {
            console.error(`Error fetching ${table}:`, fallback.error);
            return [] as T[];
          }
          return (fallback.data || []) as T[];
        }
        console.error(`Error fetching ${table}:`, error);
        return [] as T[];
      }
      return (data || []) as T[];
    },
  });
};

// Generic create mutation - no club_id needed
export const useAdminCreate = <T>(table: string, queryKey: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Partial<T>) => {
      const { data, error } = await (supabase as any)
        .from(table)
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success('Created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Generic update mutation
export const useAdminUpdate = <T>(table: string, queryKey: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...item }: { id: string } & Partial<T>) => {
      const { data, error } = await (supabase as any)
        .from(table)
        .update(item)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success('Updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Generic delete mutation
export const useAdminDelete = (table: string, queryKey: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success('Deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Fetch all admins
export const useAdmins = () => {
  return useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('club_admins')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching admins:', error);
        return [] as any[];
      }
      return data;
    },
  });
};

// Fetch admin profiles (legacy)
export const useAdminProfiles = () => {
  return useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('admin_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching admin profiles:', error);
        return [] as any[];
      }
      return data;
    },
  });
};

// Fetch event registrations
export const useEventRegistrations = (eventId?: string) => {
  return useQuery({
    queryKey: ['event-registrations', eventId],
    queryFn: async () => {
      let query = supabase
        .from('event_registrations')
        .select(`
          *,
          events!inner(id, title),
          user_profiles(full_name, email:enrollment_number, mobile, branch, year)
        `);
      
      if (eventId) {
        query = query.eq('event_id', eventId);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching event registrations:', error);
        return [] as any[];
      }
      return data;
    },
  });
};

// Fetch certificates
export const useCertificates = () => {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          events!inner(id, title),
          user_profiles(full_name)
        `)
        .order('issued_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching certificates:', error);
        return [] as any[];
      }
      return data;
    },
  });
};
