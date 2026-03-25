import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClub } from '@/contexts/ClubContext';

export const usePartners = () => {
  const { clubId } = useClub();
  
  return useQuery({
    queryKey: ['partners', clubId],
    queryFn: async () => {
      if (!clubId) return [];
      
      const { data, error } = await supabase
        .from('partners')
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
