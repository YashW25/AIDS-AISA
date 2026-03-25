import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AdminTable } from '@/components/admin/AdminTable';
import { FormModal } from '@/components/admin/FormModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useAdminFetch, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/useAdminData';
import { Star } from 'lucide-react';

type Alumni = {
  id: string;
  name: string;
  graduation_year: string;
  branch: string | null;
  company: string | null;
  job_title: string | null;
  image_url: string | null;
  linkedin_url: string | null;
  testimonial: string | null;
  position: number | null;
  is_active: boolean | null;
};

export default function AlumniPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Alumni | null>(null);

  const { data: alumni, isLoading } = useAdminFetch<Alumni>('alumni', 'alumni');
  const createMutation = useAdminCreate<Alumni>('alumni', 'alumni');
  const updateMutation = useAdminUpdate<Alumni>('alumni', 'alumni');
  const deleteMutation = useAdminDelete('alumni', 'alumni');

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<Alumni>();

  const nextPosition = () => {
    if (!alumni || alumni.length === 0) return 4;
    const max = Math.max(...alumni.map((a) => a.position ?? 0));
    return max + 1;
  };

  const openModal = (item?: Alumni) => {
    if (item) {
      setEditingItem(item);
      reset(item);
    } else {
      setEditingItem(null);
      reset({
        name: '',
        graduation_year: '',
        branch: '',
        company: '',
        job_title: '',
        image_url: '',
        linkedin_url: '',
        testimonial: '',
        position: nextPosition(),
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    reset();
  };

  const onSubmit = (data: Alumni) => {
    // Strip id from form data — DB generates it on create; we use editingItem.id on update
    const { id: _formId, ...payload } = data as any;
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...payload }, { onSuccess: closeModal });
    } else {
      createMutation.mutate(payload, { onSuccess: closeModal });
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateMutation.mutate({ id, is_active: isActive });
  };

  const columns = [
    {
      key: 'image_url',
      label: 'Photo',
      render: (item: Alumni) => item.image_url ? (
        <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs">N/A</div>
      ),
    },
    { key: 'name', label: 'Name' },
    { key: 'graduation_year', label: 'Batch' },
    { key: 'company', label: 'Company' },
    { key: 'job_title', label: 'Role' },
    {
      key: 'position',
      label: 'Homepage',
      render: (item: Alumni) => {
        const pos = item.position ?? 999;
        if (pos >= 1 && pos <= 3) {
          return (
            <Badge className="bg-amber-100 text-amber-700 border-amber-300 gap-1">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              Featured #{pos}
            </Badge>
          );
        }
        return <span className="text-xs text-muted-foreground">—</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Alumni Management</h1>
        <p className="text-muted-foreground">Manage alumni profiles</p>
      </div>

      <AdminTable
        title="Alumni"
        data={alumni || []}
        columns={columns}
        isLoading={isLoading}
        onAdd={() => openModal()}
        onEdit={openModal}
        onDelete={(id) => deleteMutation.mutate(id)}
        onToggleActive={handleToggleActive}
      />

      <FormModal
        title={editingItem ? 'Edit Alumni' : 'Add Alumni'}
        open={modalOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register('name', { required: true })} />
              {errors.name && <span className="text-sm text-destructive">Required</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduation_year">Graduation Year *</Label>
              <Input id="graduation_year" {...register('graduation_year', { required: true })} placeholder="2024" />
              {errors.graduation_year && <span className="text-sm text-destructive">Required</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" {...register('branch')} placeholder="AI & DS" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" {...register('company')} placeholder="Google" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input id="job_title" {...register('job_title')} placeholder="Software Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input id="position" type="number" {...register('position', { valueAsNumber: true })} placeholder="e.g. 1" />
              <p className="text-xs text-muted-foreground">
                Auto-assigned to next available slot. Set <strong>1, 2, or 3</strong> to feature on the homepage — any other number stays off the homepage.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photo</Label>
            <Controller
              name="image_url"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  value={field.value || ''}
                  onChange={field.onChange}
                  folder="alumni"
                  fileName={editingItem?.name || ''}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input id="linkedin_url" {...register('linkedin_url')} placeholder="https://linkedin.com/in/..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="testimonial">Testimonial</Label>
            <Textarea id="testimonial" {...register('testimonial')} rows={3} placeholder="Share their experience..." />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
