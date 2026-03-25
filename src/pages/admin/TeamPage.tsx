import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminTable } from '@/components/admin/AdminTable';
import { FormModal } from '@/components/admin/FormModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useAdminFetch, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/useAdminData';
import { useTeamCategories } from '@/hooks/useTeamCategories';
import type { TeamMember } from '@/types/database';

const TeamPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data = [], isLoading } = useAdminFetch<TeamMember>('team_members', 'admin-team');
  const { data: categories = [] } = useTeamCategories();
  const createMutation = useAdminCreate<TeamMember>('team_members', 'admin-team');
  const updateMutation = useAdminUpdate<TeamMember>('team_members', 'admin-team');
  const deleteMutation = useAdminDelete('team_members', 'admin-team');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Partial<TeamMember> & { skills_text?: string }>();

  const openModal = (item?: TeamMember) => {
    setEditingItem(item || null);
    if (item) {
      reset({
        ...item,
        skills_text: item.skills?.join(', ') || '',
      });
    } else {
      reset({ name: '', role: '', category: 'core', position: 0, is_active: true, skills_text: '', image_url: '', linkedin_url: '', email: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    reset({});
  };

  const onSubmit = async (formData: Partial<TeamMember> & { skills_text?: string }) => {
    const { skills_text, ...rest } = formData;
    const payload = {
      ...rest,
      skills: skills_text ? skills_text.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    if (editingItem) {
      await updateMutation.mutateAsync({ ...payload, id: editingItem.id });
    } else {
      await createMutation.mutateAsync(payload);
    }
    closeModal();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateMutation.mutateAsync({ id, is_active: isActive });
  };

  const columns = [
    { key: 'image_url', label: 'Photo', render: (item: TeamMember) => (
      item.image_url ? (
        <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
          {item.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
      )
    )},
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'category', label: 'Category', render: (item: TeamMember) => {
      const cat = categories.find(c => c.name === item.category);
      return (
        <span className="capitalize px-2 py-1 rounded bg-primary/10 text-primary text-xs">{cat?.label || item.category}</span>
      );
    }},
    { key: 'position', label: 'Order' },
  ];

  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(data.map(m => m.role).filter(Boolean))];
    return roles.sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && item.is_active) ||
        (filterStatus === 'inactive' && !item.is_active);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [data, searchQuery, filterCategory, filterStatus]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Team Members</h1>
        <p className="text-muted-foreground">Manage team members</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-card border border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.name} value={cat.name}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AdminTable
        title=""
        data={filteredData}
        columns={columns}
        onAdd={() => openModal()}
        onEdit={openModal}
        onDelete={(id) => deleteMutation.mutate(id)}
        onToggleActive={handleToggleActive}
        isLoading={isLoading}
      />

      <FormModal
        title={editingItem ? 'Edit Team Member' : 'Add Team Member'}
        open={modalOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <ImageUpload
              value={watch('image_url') || ''}
              onChange={(url) => setValue('image_url', url)}
              folder="team"
              fileName={watch('name') || ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input id="role" {...register('role', { required: 'Role is required' })} placeholder="President" />
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} rows={2} placeholder="Brief bio or description" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select defaultValue={watch('category') || 'core'} onValueChange={(v) => setValue('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position Order</Label>
              <Input id="position" type="number" {...register('position', { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} placeholder="member@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input id="linkedin_url" {...register('linkedin_url')} placeholder="https://linkedin.com/in/username" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills_text">Skills (comma separated)</Label>
            <Input id="skills_text" {...register('skills_text')} placeholder="Leadership, Programming, Design" />
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

export default TeamPage;