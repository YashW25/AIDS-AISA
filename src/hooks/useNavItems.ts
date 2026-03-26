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

// Built-in items that should always be present in the nav
// They are auto-seeded into the DB if missing
const REQUIRED_NAV_ITEMS = [
  { label: 'Downloads', href: '/downloads', icon: 'Download', position: 90 },
  { label: 'Notices', href: '/notice', icon: 'Bell', position: 91 },
];

async function seedMissingNavItems(existingItems: NavItem[]) {
  const existingHrefs = new Set(existingItems.map((i) => i.href));
  const missing = REQUIRED_NAV_ITEMS.filter((r) => !existingHrefs.has(r.href));
  if (!missing.length) return;

  await supabase.from('nav_items').insert(
    missing.map((m) => ({
      label: m.label,
      href: m.href,
      icon: m.icon,
      parent_id: null,
      page_type: 'built_in',
      custom_page_id: null,
      position: m.position,
      is_active: true,
    }))
  );
}

export function useNavItems() {
  return useQuery({
    queryKey: ['nav-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nav_items')
        .select('*')
        .order('position', { ascending: true });
      if (error) {
        console.error('Error fetching nav items:', error);
        return [] as NavItem[];
      }
      const items = (data || []) as NavItem[];

      // Silently seed Downloads / Notices if missing, then re-fetch to include them
      if (items.length > 0) {
        const existingHrefs = new Set(items.map((i) => i.href));
        const needsSeed = REQUIRED_NAV_ITEMS.some((r) => !existingHrefs.has(r.href));
        if (needsSeed) {
          await seedMissingNavItems(items);
          const { data: refreshed } = await supabase
            .from('nav_items')
            .select('*')
            .order('position', { ascending: true });
          return (refreshed || items) as NavItem[];
        }
      }

      return items;
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
      if (error) {
        console.error('Error fetching all nav items:', error);
        return [] as NavItem[];
      }
      return data as NavItem[];
    },
  });
}

// Default nav items — used only when the nav_items table is completely empty
const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'def-home', label: 'Home', href: '/', icon: 'Home', parent_id: null, page_type: 'built_in', custom_page_id: null, position: 0, is_active: true, created_at: null, updated_at: null },
  { id: 'def-about', label: 'About', href: '/about', icon: 'Info', parent_id: null, page_type: 'built_in', custom_page_id: null, position: 1, is_active: true, created_at: null, updated_at: null },
  { id: 'def-events', label: 'Events', href: '/events', icon: 'Calendar', parent_id: null, page_type: 'built_in', custom_page_id: null, position: 2, is_active: true, created_at: null, updated_at: null },
  { id: 'def-team', label: 'Team', href: '/team', icon: 'Users', parent_id: null, page_type: 'built_in', custom_page_id: null, position: 3, is_active: true, created_at: null, updated_at: null },
  { id: 'def-gallery', label: 'Gallery', href: '/gallery', icon: 'Image', parent_id: null, page_type: 'built_in', custom_page_id: null, position: 4, is_active: true, created_at: null, updated_at: null },
  { id: 'def-contact', label: 'Contact', href: '/contact', icon: 'Phone', parent_id: null, page_type: 'built_in', custom_page_id: null, position: 5, is_active: true, created_at: null, updated_at: null },
  { id: 'def-notice', label: 'Notices', href: '/notice', icon: 'Bell', parent_id: null, page_type: 'built_in', custom_page_id: null, position: 6, is_active: true, created_at: null, updated_at: null },
  { id: 'def-downloads', label: 'Downloads', href: '/downloads', icon: 'Download', parent_id: null, page_type: 'built_in', custom_page_id: null, position: 7, is_active: true, created_at: null, updated_at: null },
];

export function useNavItemsTree() {
  const { data: items, ...rest } = useNavItems();

  // Use default items if database has no nav items
  const source = items && items.length > 0 ? items : DEFAULT_NAV_ITEMS;

  const tree = source
    .filter((i) => !i.parent_id && i.is_active !== false)
    .map((parent) => ({
      ...parent,
      children: source.filter((c) => c.parent_id === parent.id && c.is_active !== false),
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
