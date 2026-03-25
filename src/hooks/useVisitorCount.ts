import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVisitorCount = () => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const increment = async () => {
      const { data, error } = await supabase.rpc('increment_visitor_count');
      if (!error && data) {
        setCount(data as number);
      }
    };
    increment();
  }, []);

  return count;
};
