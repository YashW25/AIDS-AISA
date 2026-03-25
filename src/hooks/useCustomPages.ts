import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type CustomPage = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  meta_description: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export function useCustomPages() {
  return useQuery({
    queryKey: ['custom-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CustomPage[];
    },
  });
}

export function useCustomPageBySlug(slug: string) {
  return useQuery({
    queryKey: ['custom-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data as CustomPage;
    },
    enabled: !!slug,
  });
}

export function useCustomPageMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['custom-pages'] });

  const upsert = useMutation({
    mutationFn: async (page: Partial<CustomPage> & { id?: string }) => {
      if (page.id) {
        const { error } = await supabase.from('custom_pages').update(page).eq('id', page.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('custom_pages').insert(page as any).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => { invalidate(); toast.success('Page saved'); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_pages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Page deleted'); },
    onError: (e: any) => toast.error(e.message),
  });

  return { upsert, remove };
}
