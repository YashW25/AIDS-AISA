import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminTable } from '@/components/admin/AdminTable';
import { FormModal } from '@/components/admin/FormModal';
import { useAdminFetch, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/useAdminData';

interface TeamCategory {
  id: string;
  name: string;
  label: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TeamCategoriesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamCategory | null>(null);

  const { data = [], isLoading } = useAdminFetch<TeamCategory>('team_categories', 'admin-team-categories');
  const createMutation = useAdminCreate<TeamCategory>('team_categories', 'admin-team-categories');
  const updateMutation = useAdminUpdate<TeamCategory>('team_categories', 'admin-team-categories');
  const deleteMutation = useAdminDelete('team_categories', 'admin-team-categories');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<TeamCategory>>();

  const openModal = (item?: TeamCategory) => {
    setEditingItem(item || null);
    if (item) {
      reset(item);
    } else {
      reset({ name: '', label: '', position: 0, is_active: true });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    reset({});
  };

  const onSubmit = async (formData: Partial<TeamCategory>) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ ...formData, id: editingItem.id });
    } else {
      await createMutation.mutateAsync(formData);
    }
    closeModal();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateMutation.mutateAsync({ id, is_active: isActive });
  };

  const columns = [
    { key: 'name', label: 'Slug' },
    { key: 'label', label: 'Display Name' },
    { key: 'position', label: 'Order' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Team Categories</h1>
        <p className="text-muted-foreground">Manage team member categories (e.g. Core, Technical, Media)</p>
      </div>

      <AdminTable
        title=""
        data={data}
        columns={columns}
        onAdd={() => openModal()}
        onEdit={openModal}
        onDelete={(id) => deleteMutation.mutate(id)}
        onToggleActive={handleToggleActive}
        isLoading={isLoading}
      />

      <FormModal
        title={editingItem ? 'Edit Category' : 'Add Category'}
        open={modalOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Slug (key) *</Label>
              <Input id="name" {...register('name', { required: 'Slug is required' })} placeholder="e.g. technical" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Display Name *</Label>
              <Input id="label" {...register('label', { required: 'Label is required' })} placeholder="e.g. Technical Team" />
              {errors.label && <p className="text-sm text-destructive">{errors.label.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position Order</Label>
            <Input id="position" type="number" {...register('position', { valueAsNumber: true })} />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default TeamCategoriesPage;
