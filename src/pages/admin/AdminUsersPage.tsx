import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createClient } from '@supabase/supabase-js';
import { Loader2, Shield, ShieldCheck, UserPlus, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormModal } from '@/components/admin/FormModal';
import { useClub } from '@/contexts/ClubContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2 } from 'lucide-react';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/^["']|["']$/g, '').trim();
const SERVICE_ROLE_KEY = (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '').replace(/^["']|["']$/g, '').trim();

// Admin client — uses service role key so it can create users without email
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<{
    email: string; password: string; full_name: string; role: 'admin' | 'teacher';
  }>({ defaultValues: { role: 'admin' } });

  // Read from admin_profiles — always populated regardless of club_id
  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admin-profiles-list'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('admin_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) { console.error(error); return []; }
      return data || [];
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (formData: { email: string; password: string; full_name: string; role: string }) => {
      if (!SERVICE_ROLE_KEY) {
        throw new Error('Service role key not configured. Add VITE_SUPABASE_SERVICE_ROLE_KEY to your secrets.');
      }

      // Step 1 — create the auth user via Admin API (no email sent)
      const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: { full_name: formData.full_name },
      });

      if (createError) {
        if (createError.message?.toLowerCase().includes('already registered')) {
          throw new Error('A user with this email already exists.');
        }
        throw new Error(`Failed to create account: ${createError.message}`);
      }

      const userId = userData.user?.id;
      if (!userId) throw new Error('User creation returned no ID.');

      // Step 2 — force-confirm the email via updateUserById (belt-and-suspenders)
      await adminClient.auth.admin.updateUserById(userId, { email_confirm: true });

      // Step 3 — assign role via SECURITY DEFINER RPC (bypasses RLS)
      const { error: rpcError } = await supabase.rpc('assign_admin_role' as any, {
        p_user_id: userId,
        p_role: formData.role,
        p_full_name: formData.full_name,
        p_email: formData.email,
        p_club_id: clubId || null,
      });

      if (rpcError) {
        if (rpcError.code === '42883' || rpcError.message?.toLowerCase().includes('function')) {
          throw new Error('Run the assign_admin_role SQL function first (see supabase/assign_admin_role.sql).');
        }
        throw new Error(`Role assignment failed: ${rpcError.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles-list'] });
      toast.success('Account created! They can log in immediately.');
      closeModal();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from('admin_profiles').delete().eq('id', id);
      await supabase.from('user_roles' as any).delete().eq('user_id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles-list'] });
      toast.success('Admin removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Fix "email not confirmed" for existing accounts
  const fixEmailMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await adminClient.auth.admin.updateUserById(id, { email_confirm: true });
      if (error) throw new Error(`Could not confirm email: ${error.message}`);
    },
    onSuccess: () => toast.success('Email confirmed — they can now log in.'),
    onError: (error: Error) => toast.error(error.message),
  });

  const openModal = () => { reset({ email: '', password: '', full_name: '', role: 'admin' }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); reset({}); };

  const onSubmit = async (formData: any) => {
    const validation = newAdminSchema.safeParse(formData);
    if (!validation.success) { toast.error(validation.error.errors[0].message); return; }
    createAdminMutation.mutate(formData);
  };

  const roleColor = (role: string) => {
    if (role === 'admin' || role === 'super_admin') return 'bg-primary/10 text-primary';
    if (role === 'editor' || role === 'teacher') return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Club Admins &amp; Teachers</h1>
          <p className="text-muted-foreground text-sm">Create accounts that can log in to the admin panel immediately — no email confirmation needed</p>
        </div>
        <Button onClick={openModal} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Admin / Teacher
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <ShieldCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No admins yet. Add your first admin above.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {admins.map((admin: any) => (
                <tr key={admin.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{admin.full_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {admin.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${roleColor(admin.role)}`}>
                      {admin.role === 'admin' || admin.role === 'super_admin'
                        ? <ShieldCheck className="h-3 w-3" />
                        : <Shield className="h-3 w-3" />}
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${admin.is_active ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                      title="Fix 'email not confirmed' login error"
                      onClick={() => fixEmailMutation.mutate(admin.id)}
                      disabled={fixEmailMutation.isPending}
                    >
                      {fixEmailMutation.isPending
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <ShieldCheck className="h-3 w-3" />}
                      Fix Login
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteMutation.mutate(admin.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormModal title="Add New Admin / Teacher" open={modalOpen} onClose={closeModal}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input id="full_name" {...register('full_name', { required: true })} placeholder="e.g. Prof. Rahul Sharma" />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register('email', { required: true })} placeholder="user@example.com" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" {...register('password', { required: true })} placeholder="Min 8 characters" />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            <p className="text-xs text-muted-foreground">They can log in immediately — no email confirmation step.</p>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select defaultValue="admin" onValueChange={(v) => setValue('role', v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin — full access</SelectItem>
                <SelectItem value="teacher">Teacher — limited access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={createAdminMutation.isPending} className="gap-2">
              {createAdminMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <UserPlus className="h-4 w-4" />
              Create Account
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default AdminUsersPage;
