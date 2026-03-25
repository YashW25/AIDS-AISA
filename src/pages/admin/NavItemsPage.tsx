import { useState } from 'react';
import { useAllNavItems, useNavItemMutations, NavItem } from '@/hooks/useNavItems';
import { useCustomPages } from '@/hooks/useCustomPages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormModal } from '@/components/admin/FormModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, GripVertical, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const ICON_OPTIONS = [
  'Home', 'Info', 'Calendar', 'Users', 'Image', 'Phone', 'Download',
  'FileText', 'Award', 'Bell', 'Handshake', 'Star', 'Heart', 'Settings',
  'Mail', 'Globe', 'BookOpen', 'Newspaper', 'Video', 'Music',
];

const emptyForm = {
  label: '',
  href: '/',
  icon: 'FileText',
  parent_id: null as string | null,
  page_type: 'built_in' as string,
  custom_page_id: null as string | null,
  position: 0,
  is_active: true,
};

export default function NavItemsPage() {
  const { data: allItems, isLoading } = useAllNavItems();
  const { data: customPages } = useCustomPages();
  const { upsert, remove } = useNavItemMutations();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const parentItems = allItems?.filter((i) => !i.parent_id) || [];
  const getChildren = (parentId: string) => allItems?.filter((i) => i.parent_id === parentId) || [];

  const openAdd = (parentId?: string) => {
    setEditId(null);
    setForm({ ...emptyForm, parent_id: parentId || null });
    setModalOpen(true);
  };

  const openEdit = (item: NavItem) => {
    setEditId(item.id);
    setForm({
      label: item.label,
      href: item.href,
      icon: item.icon || 'FileText',
      parent_id: item.parent_id,
      page_type: item.page_type,
      custom_page_id: item.custom_page_id,
      position: item.position || 0,
      is_active: item.is_active ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.label.trim()) {
      toast.error('Label is required');
      return;
    }
    const payload: any = { ...form };
    if (editId) payload.id = editId;

    // If custom page, set href from slug
    if (form.page_type === 'custom' && form.custom_page_id) {
      const page = customPages?.find((p) => p.id === form.custom_page_id);
      if (page) payload.href = `/page/${page.slug}`;
    }

    upsert.mutate(payload, { onSuccess: () => setModalOpen(false) });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this nav item and all its children?')) remove.mutate(id);
  };

  const handleToggle = (item: NavItem) => {
    upsert.mutate({ id: item.id, is_active: !item.is_active });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Navigation Management</h1>
          <p className="text-muted-foreground text-sm">Control which pages appear in the website navbar</p>
        </div>
        <Button onClick={() => openAdd()}>
          <Plus className="h-4 w-4 mr-2" /> Add Nav Item
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parentItems.map((item) => (
                <>
                  <TableRow key={item.id}>
                    <TableCell><GripVertical className="h-4 w-4 text-muted-foreground" /></TableCell>
                    <TableCell className="font-medium">{item.label}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.href}</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted">
                        {item.page_type === 'custom' ? 'Custom' : 'Built-in'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch checked={item.is_active ?? true} onCheckedChange={() => handleToggle(item)} />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => openAdd(item.id)} title="Add child">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {getChildren(item.id).map((child) => (
                    <TableRow key={child.id} className="bg-muted/30">
                      <TableCell></TableCell>
                      <TableCell className="font-medium pl-8 flex items-center gap-2">
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        {child.label}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{child.href}</TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted">
                          {child.page_type === 'custom' ? 'Custom' : 'Built-in'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch checked={child.is_active ?? true} onCheckedChange={() => handleToggle(child)} />
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(child)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(child.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <FormModal title={editId ? 'Edit Nav Item' : 'Add Nav Item'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <Label>Label</Label>
            <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Page Name" />
          </div>

          <div>
            <Label>Type</Label>
            <Select value={form.page_type} onValueChange={(v) => setForm({ ...form, page_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="built_in">Built-in Page</SelectItem>
                <SelectItem value="custom">Custom Page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.page_type === 'built_in' ? (
            <div>
              <Label>Path (href)</Label>
              <Input value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} placeholder="/about" />
              <p className="text-xs text-muted-foreground mt-1">Use # for dropdown parents with no own page</p>
            </div>
          ) : (
            <div>
              <Label>Custom Page</Label>
              <Select
                value={form.custom_page_id || ''}
                onValueChange={(v) => setForm({ ...form, custom_page_id: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select a page" /></SelectTrigger>
                <SelectContent>
                  {customPages?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Create pages in "Custom Pages" first</p>
            </div>
          )}

          <div>
            <Label>Icon</Label>
            <Select value={form.icon || 'FileText'} onValueChange={(v) => setForm({ ...form, icon: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((ic) => (
                  <SelectItem key={ic} value={ic}>{ic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Parent</Label>
            <Select
              value={form.parent_id || 'none'}
              onValueChange={(v) => setForm({ ...form, parent_id: v === 'none' ? null : v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Top Level —</SelectItem>
                {parentItems
                  .filter((p) => p.id !== editId)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Position</Label>
            <Input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} />
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            <Label>Active</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={upsert.isPending}>
              {upsert.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
