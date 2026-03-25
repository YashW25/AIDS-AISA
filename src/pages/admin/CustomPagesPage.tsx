import { useState } from 'react';
import { useCustomPages, useCustomPageMutations, CustomPage } from '@/hooks/useCustomPages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FormModal } from '@/components/admin/FormModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = {
  title: '',
  slug: '',
  content: '',
  meta_description: '',
  is_active: true,
};

export default function CustomPagesPage() {
  const { data: pages, isLoading } = useCustomPages();
  const { upsert, remove } = useCustomPageMutations();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const slugify = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (page: CustomPage) => {
    setEditId(page.id);
    setForm({
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      meta_description: page.meta_description || '',
      is_active: page.is_active ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title and slug are required');
      return;
    }
    const payload: any = { ...form };
    if (editId) payload.id = editId;
    upsert.mutate(payload, { onSuccess: () => setModalOpen(false) });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this page? Any nav items linking to it will be unlinked.')) remove.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Custom Pages</h1>
          <p className="text-muted-foreground text-sm">Create and manage custom content pages for your website</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> New Page
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !pages?.length ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <p className="text-muted-foreground mb-4">No custom pages yet</p>
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Create First Page</Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">/page/{page.slug}</TableCell>
                  <TableCell>
                    <Switch
                      checked={page.is_active ?? true}
                      onCheckedChange={() => upsert.mutate({ id: page.id, is_active: !(page.is_active ?? true) })}
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" asChild>
                      <a href={`/page/${page.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(page)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(page.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <FormModal title={editId ? 'Edit Page' : 'New Page'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <Label>Page Title</Label>
            <Input
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm({ ...form, title, slug: editId ? form.slug : slugify(title) });
              }}
              placeholder="My New Page"
            />
          </div>
          <div>
            <Label>URL Slug</Label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">/page/</span>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                placeholder="my-new-page"
              />
            </div>
          </div>
          <div>
            <Label>Meta Description</Label>
            <Input
              value={form.meta_description}
              onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
              placeholder="Short description for SEO"
            />
          </div>
          <div>
            <Label>Page Content (HTML supported)</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="<h2>Welcome</h2><p>Your content here...</p>"
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supports HTML tags: headings, paragraphs, lists, images, links, etc.
            </p>
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
