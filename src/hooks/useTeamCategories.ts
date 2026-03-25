import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TeamCategory {
  id: string;
  name: string;
  label: string;
  position: number;
  is_active: boolean;
}

export const useTeamCategories = () => {
  return useQuery({
    queryKey: ['team-categories'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('team_categories')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      if (error) {
        console.error('Error fetching team categories:', error);
        return [] as TeamCategory[];
      }
      return (data || []) as TeamCategory[];
    },
  });
};
