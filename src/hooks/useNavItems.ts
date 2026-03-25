import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: string | null;
  parent_id: string | null;
  page_type: string;
  custom_page_id: string | null;
  position: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  children?: NavItem[];
};

export function useNavItems() {
  return useQuery({
    queryKey: ['nav-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nav_items')
        .select('*')
        .order('position', { ascending: true });
      if (error) throw error;
      return data as NavItem[];
    },
  });
}

export function useAllNavItems() {
  return useQuery({
    queryKey: ['nav-items-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nav_items')
        .select('*')
        .order('position', { ascending: true });
      if (error) throw error;
      return data as NavItem[];
    },
  });
}

// Default nav items shown when nav_items table is empty (e.g. cloned projects)
const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'def-home', label: 'Home', href: '/', icon: 'Home', parent_id: null, page_type: 'built_in', custom_page_id: null, position: 0, is_active: true, created_at: null, updated_at: null },
  { id: 'def-about', label: 'About', href: '/about', icon: 'Info', parent_id: null, page_type: 'built_in', custom_page_id: null, position: 1, is_active: true, created_at: null, updated_at: null },
  { id: 'def-events', label: 'Events', href: '/events', icon: 'Calendar', parent_id: null, page_type: 'built_in', custom_page_id: null, position: 2, is_active: true, created_at: null, updated_at: null },
  { id: 'def-team', label: 'Team', href: '/team', icon: 'Users', parent_id: null, page_type: 'built_in', custom_page_id: null, position: 3, is_active: true, created_at: null, updated_at: null },
  { id: 'def-gallery', label: 'Gallery', href: '/gallery', icon: 'Image', parent_id: null, page_type: 'built_in', custom_page_id: null, position: 4, is_active: true, created_at: null, updated_at: null },
  { id: 'def-contact', label: 'Contact', href: '/contact', icon: 'Phone', parent_id: null, page_type: 'built_in', custom_page_id: null, position: 5, is_active: true, created_at: null, updated_at: null },
];

export function useNavItemsTree() {
  const { data: items, ...rest } = useNavItems();

  // Use default items if database has no nav items
  const source = items && items.length > 0 ? items : DEFAULT_NAV_ITEMS;

  const tree = source
    .filter((i) => !i.parent_id)
    .map((parent) => ({
      ...parent,
      children: source.filter((c) => c.parent_id === parent.id),
    }));

  return { data: tree, ...rest };
}

export function useNavItemMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['nav-items'] });
    qc.invalidateQueries({ queryKey: ['nav-items-all'] });
  };

  const upsert = useMutation({
    mutationFn: async (item: Partial<NavItem> & { id?: string }) => {
      if (item.id) {
        const { error } = await supabase.from('nav_items').update(item).eq('id', item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('nav_items').insert(item as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { invalidate(); toast.success('Nav item saved'); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('nav_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Nav item deleted'); },
    onError: (e: any) => toast.error(e.message),
  });

  return { upsert, remove };
}
