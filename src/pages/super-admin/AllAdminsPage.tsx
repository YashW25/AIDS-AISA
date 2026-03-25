import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Shield, ShieldCheck, Loader2, UserPlus, Mail, Trash2, Edit2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormModal } from '@/components/admin/FormModal';
import { useAllClubs } from '@/hooks/useClubAdminData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';

const newAdminSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Name is required'),
  role: z.enum(['super_admin', 'admin']),
  club_id: z.string().optional(),
});

interface AdminData {
  id: string;
  user_id: string;
  club_id: string;
  role: string;
  is_primary: boolean;
  clubs?: { name: string; slug: string } | null;
  admin_profile?: { id: string; email: string; full_name: string | null } | null;
}

const AllAdminsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminData | null>(null);
  const queryClient = useQueryClient();

  const { data: clubs = [], isLoading: clubsLoading } = useAllClubs();
  
  const { data: allAdmins = [], isLoading: adminsLoading } = useQuery({
    queryKey: ['all-club-admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('club_admins')
        .select(`
          *,
          clubs (name, slug)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const userIds = data.map(a => a.user_id);
      const { data: profiles } = await supabase
        .from('admin_profiles')
        .select('id, email, full_name')
        .in('id', userIds);
      
      return data.map(admin => ({
        ...admin,
        admin_profile: profiles?.find(p => p.id === admin.user_id) || null
      })) as AdminData[];
    },
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<{
    email: string;
    password: string;
    full_name: string;
    role: 'super_admin' | 'admin';
    club_id?: string;
  }>();

  const selectedRole = watch('role');

  const createAdminMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; full_name: string; role: string; club_id?: string }) => {
      const response = await supabase.functions.invoke('setup-admin', {
        body: data,
      });
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-club-admins'] });
      toast.success('Admin created successfully');
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateAdminMutation = useMutation({
    mutationFn: async (data: { id: string; role: string; is_primary: boolean; club_id: string }) => {
      const { error } = await supabase
        .from('club_admins')
        .update({ role: data.role, is_primary: data.is_primary, club_id: data.club_id })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-club-admins'] });
      toast.success('Admin updated successfully');
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const { error } = await supabase
        .from('club_admins')
        .delete()
        .eq('id', adminId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-club-admins'] });
      toast.success('Admin removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await supabase.functions.invoke('setup-admin', {
        body: { action: 'reset_password', user_id: userId },
      });
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password reset to 12345678');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openModal = (admin?: AdminData) => {
    if (admin) {
      setEditingAdmin(admin);
      setValue('role', admin.role as 'admin');
      setValue('club_id', admin.club_id);
    } else {
      setEditingAdmin(null);
      reset({ email: '', password: '', full_name: '', role: 'admin', club_id: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAdmin(null);
    reset({});
  };

  const onSubmit = async (formData: any) => {
    if (editingAdmin) {
      updateAdminMutation.mutate({
        id: editingAdmin.id,
        role: formData.role,
        is_primary: editingAdmin.is_primary, // Keep existing is_primary value
        club_id: formData.club_id,
      });
    } else {
      const validation = newAdminSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }
      
      if (formData.role !== 'super_admin' && !formData.club_id) {
        toast.error('Please select a club for this admin');
        return;
      }
      
      createAdminMutation.mutate(formData);
    }
  };

  const isLoading = clubsLoading || adminsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const adminsByClub = allAdmins.reduce((acc, admin) => {
    const clubName = admin.clubs?.name || 'Unknown Club';
    if (!acc[clubName]) acc[clubName] = [];
    acc[clubName].push(admin);
    return acc;
  }, {} as Record<string, AdminData[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">All Administrators</h1>
          <p className="text-muted-foreground">Manage administrators across all clubs</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(adminsByClub).map(([clubName, admins]) => (
          <Card key={clubName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {clubName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <p className="font-medium">
                            {admin.admin_profile?.email || `User: ${admin.user_id.substring(0, 8)}...`}
                          </p>
                        </div>
                        {admin.admin_profile?.full_name && (
                          <p className="text-sm text-muted-foreground">{admin.admin_profile.full_name}</p>
                        )}
                        <p className="text-xs text-muted-foreground capitalize">Role: {admin.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                        admin.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                        admin.role === 'teacher' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {admin.role === 'super_admin' ? 'Super Admin' : admin.role || 'Admin'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          if (confirm('Reset password to 12345678?')) {
                            resetPasswordMutation.mutate(admin.user_id);
                          }
                        }}
                        disabled={resetPasswordMutation.isPending}
                        title="Reset Password"
                      >
                        <KeyRound className="h-4 w-4 text-orange-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openModal(admin)}
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteAdminMutation.mutate(admin.id)}
                        disabled={deleteAdminMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {Object.keys(adminsByClub).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No administrators found. Create your first admin to get started.
          </div>
        )}
      </div>

      <FormModal
        title={editingAdmin ? "Edit Administrator" : "Add New Administrator"}
        open={modalOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!editingAdmin && (
            <>
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
            </>
          )}

          {editingAdmin && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{editingAdmin.admin_profile?.email}</p>
              <p className="text-xs text-muted-foreground">{editingAdmin.admin_profile?.full_name}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Role *</Label>
            <Select defaultValue={editingAdmin?.role || "admin"} onValueChange={(v) => setValue('role', v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin (All Clubs)</SelectItem>
                <SelectItem value="admin">Club Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole !== 'super_admin' && (
            <div className="space-y-2">
              <Label>Club *</Label>
              <Select defaultValue={editingAdmin?.club_id} onValueChange={(v) => setValue('club_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select a club" /></SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={createAdminMutation.isPending || updateAdminMutation.isPending}>
              {(createAdminMutation.isPending || updateAdminMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingAdmin ? 'Update Admin' : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Admin
                </>
              )}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default AllAdminsPage;