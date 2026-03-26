import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Shield, ShieldCheck, UserPlus, Mail, User, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormModal } from '@/components/admin/FormModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Supabase Admin REST helpers ────────────────────────────────────────────
// Using fetch() directly so we never create a second GoTrueClient (which
// interferes with session management and causes auto-login/logout bugs).

function getAdminHeaders() {
  const key = (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (!key || !url) {
    throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY is not configured. Add it to your Replit Secrets.');
  }
  return {
    url,
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
  };
}

async function adminCreateUser(email: string, password: string, fullName: string) {
  const { url, headers } = getAdminHeaders();
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,        // confirmed immediately — no email sent
      user_metadata: { full_name: fullName },
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json.msg || json.message || json.error_description || JSON.stringify(json);
    throw new Error(msg);
  }
  return json as { id: string };
}

async function adminConfirmEmail(userId: string) {
  const { url, headers } = getAdminHeaders();
  const res = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ email_confirm: true }),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json.msg || json.message || json.error_description || JSON.stringify(json);
    throw new Error(msg);
  }
  return json;
}

// ─── Schema ─────────────────────────────────────────────────────────────────

const newAdminSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'teacher']),
});

// ─── Component ───────────────────────────────────────────────────────────────

const AdminUsersPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

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
      // Step 1 — Create auth user via Admin REST API (no second GoTrueClient)
      const user = await adminCreateUser(formData.email, formData.password, formData.full_name);
      const userId = user.id;
      if (!userId) throw new Error('User creation returned no ID.');

      // Step 2 — Force-confirm email via Admin REST API (belt-and-suspenders)
      await adminConfirmEmail(userId);

      // Step 3 — Assign role + create admin_profiles record via SECURITY DEFINER RPC
      const { error: rpcError } = await supabase.rpc('assign_admin_role' as any, {
        p_user_id: userId,
        p_role: formData.role,
        p_full_name: formData.full_name,
        p_email: formData.email,
        p_club_id: null,
      });

      if (rpcError) {
        const msg = rpcError.message?.toLowerCase() || '';
        if (msg.includes('function') || rpcError.code === '42883') {
          throw new Error('Run the SQL in supabase/assign_admin_role.sql first (Supabase → SQL Editor).');
        }
        throw new Error(`Role assignment failed: ${rpcError.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles-list'] });
      toast.success('Account created! They can log in immediately with the password you set.');
      closeModal();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Fix "email not confirmed" for accounts created before this fix
  const fixEmailMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminConfirmEmail(id);
    },
    onSuccess: () => toast.success('Email confirmed — they can now log in.'),
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
          <p className="text-muted-foreground text-sm">Accounts can log in immediately — no email confirmation needed</p>
        </div>
        <Button onClick={openModal} data-testid="button-add-admin" className="gap-2">
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
          <p className="text-xs text-muted-foreground/60 mt-2">
            Make sure you have run <code className="bg-muted px-1 rounded">supabase/assign_admin_role.sql</code> in Supabase SQL Editor.
          </p>
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
                      <Mail className="h-3.5 w-3.5 shrink-0" />
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
                        data-testid={`button-fix-login-${admin.id}`}
                      >
                        {fixEmailMutation.isPending
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <RefreshCw className="h-3 w-3" />}
                        Fix Login
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMutation.mutate(admin.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-admin-${admin.id}`}
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
            <Input
              id="full_name"
              {...register('full_name', { required: true })}
              placeholder="e.g. Prof. Rahul Sharma"
              data-testid="input-full-name"
            />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { required: true })}
              placeholder="user@example.com"
              data-testid="input-email"
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              {...register('password', { required: true })}
              placeholder="Min 8 characters"
              data-testid="input-password"
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            <p className="text-xs text-muted-foreground">
              No email sent. They log in immediately with this password.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select defaultValue="admin" onValueChange={(v) => setValue('role', v as any)}>
              <SelectTrigger data-testid="select-role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin — full access</SelectItem>
                <SelectItem value="teacher">Teacher — limited access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button
              type="submit"
              disabled={createAdminMutation.isPending}
              className="gap-2"
              data-testid="button-create-admin"
            >
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
