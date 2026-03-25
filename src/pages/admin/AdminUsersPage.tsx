import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Shield, ShieldCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminTable } from '@/components/admin/AdminTable';
import { FormModal } from '@/components/admin/FormModal';
import { useAdmins } from '@/hooks/useAdminData';
import { useClub } from '@/contexts/ClubContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import type { ClubAdmin } from '@/types/database';
import { z } from 'zod';

const newAdminSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'teacher']),
});

const AdminUsersPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { clubId } = useClub();

  const { data = [], isLoading } = useAdmins();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<{
    email: string;
    password: string;
    full_name: string;
    role: 'admin' | 'teacher';
  }>();

  const createAdminMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; full_name: string; role: string }) => {
      // First create the user via the setup-admin edge function
      const response = await supabase.functions.invoke('setup-admin', {
        body: { 
          email: data.email, 
          password: data.password, 
          full_name: data.full_name, 
          role: data.role,
          club_id: clubId 
        },
      });
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin created successfully');
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('club_admins')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin removed from club');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openModal = () => {
    reset({ email: '', password: '', full_name: '', role: 'admin' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    reset({});
  };

  const onSubmit = async (formData: any) => {
    const validation = newAdminSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    createAdminMutation.mutate(formData);
  };

  const columns: { key: string; label: string; render?: (item: ClubAdmin) => React.ReactNode }[] = [
    { key: 'user_id', label: 'User ID' },
    { key: 'role', label: 'Role', render: (item: ClubAdmin) => (
      <div className="flex items-center gap-2">
        {item.role === 'admin' ? <ShieldCheck className="h-4 w-4 text-primary" /> : <Shield className="h-4 w-4 text-muted-foreground" />}
        <span className="capitalize">{item.role}</span>
      </div>
    )},
    { key: 'is_primary', label: 'Primary', render: (item: ClubAdmin) => (
      <span>{item.is_primary ? 'Yes' : 'No'}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Club Admins</h1>
        <p className="text-muted-foreground">Manage admin accounts for this club</p>
      </div>

      <AdminTable
        title=""
        data={data}
        columns={columns}
        onAdd={openModal}
        onEdit={() => toast.info('Edit not available for club admins')}
        onDelete={(id) => removeAdminMutation.mutate(id)}
        isLoading={isLoading}
      />

      <FormModal
        title="Add New Admin"
        open={modalOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register('email', { required: true })} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" {...register('password', { required: true })} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input id="full_name" {...register('full_name', { required: true })} />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select defaultValue="admin" onValueChange={(v) => setValue('role', v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={createAdminMutation.isPending}>
              {createAdminMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <UserPlus className="h-4 w-4 mr-2" />
              Create Admin
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default AdminUsersPage;
