import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClub } from '@/contexts/ClubContext';

export const useAlumni = () => {
  const { clubId } = useClub();
  
  return useQuery({
    queryKey: ['alumni', clubId],
    queryFn: async () => {
      if (!clubId) return [];
      
      const { data, error } = await supabase
        .from('alumni')
        .select('*')
        .eq('club_id', clubId)
        .eq('is_active', true)
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clubId,
  });
};
