import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createClient } from '@supabase/supabase-js';
import { Loader2, Shield, ShieldCheck, UserPlus, Info, Copy, CheckCheck } from 'lucide-react';
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

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/^["']|["']$/g, '').trim();
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').replace(/^["']|["']$/g, '').trim();

// Separate client so signUp() never disrupts the admin's own session
const anonClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const newAdminSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'teacher']),
});

const SQL_SETUP = `-- Run this ONCE in the Supabase SQL Editor
CREATE OR REPLACE FUNCTION public.assign_admin_role(
  p_user_id   uuid, p_role text, p_full_name text,
  p_email text, p_club_id uuid DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_db_role text; v_profile_role text; BEGIN
  v_db_role      := CASE p_role WHEN 'teacher' THEN 'teacher' ELSE 'admin' END;
  v_profile_role := CASE p_role WHEN 'teacher' THEN 'editor'  ELSE 'admin' END;
  INSERT INTO public.user_roles (user_id, role) VALUES (p_user_id, v_db_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  INSERT INTO public.admin_profiles (id, email, full_name, role, is_active)
    VALUES (p_user_id, p_email, p_full_name, v_profile_role, true)
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, is_active = true;
  IF p_club_id IS NOT NULL THEN
    INSERT INTO public.club_admins (club_id, user_id, role, is_primary)
      VALUES (p_club_id, p_user_id, v_db_role, false) ON CONFLICT (club_id, user_id) DO NOTHING;
  END IF;
  RETURN jsonb_build_object('success', true, 'user_id', p_user_id);
END; $$;
GRANT EXECUTE ON FUNCTION public.assign_admin_role TO authenticated;`;

const AdminUsersPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const queryClient = useQueryClient();
  const { clubId } = useClub();

  const { data = [], isLoading } = useAdmins();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<{
    email: string; password: string; full_name: string; role: 'admin' | 'teacher';
  }>({ defaultValues: { role: 'admin' } });

  const createAdminMutation = useMutation({
    mutationFn: async (formData: { email: string; password: string; full_name: string; role: string }) => {
      // Step 1 — create the Supabase Auth user (won't affect admin's session)
      const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.full_name } },
      });

      if (signUpError) throw new Error(`Account creation failed: ${signUpError.message}`);

      const userId = signUpData.user?.id;
      if (!userId) throw new Error('No user ID returned — the account may already exist.');

      // Step 2 — assign role via SECURITY DEFINER function (bypasses RLS safely)
      const { data: rpcData, error: rpcError } = await supabase.rpc('assign_admin_role' as any, {
        p_user_id: userId,
        p_role: formData.role,
        p_full_name: formData.full_name,
        p_email: formData.email,
        p_club_id: clubId || null,
      });

      if (rpcError) {
        // RPC not yet created — guide the user
        if (rpcError.message?.includes('function') || rpcError.code === '42883') {
          throw new Error('SQL_SETUP_NEEDED');
        }
        throw new Error(`Role assignment failed: ${rpcError.message}`);
      }

      return rpcData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin/Teacher created! They will receive a confirmation email to activate their account.');
      closeModal();
    },
    onError: (error: Error) => {
      if (error.message === 'SQL_SETUP_NEEDED') {
        toast.error('One-time SQL setup required — see the instructions below.');
      } else {
        toast.error(error.message);
      }
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('club_admins').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin removed from club');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const openModal = () => {
    reset({ email: '', password: '', full_name: '', role: 'admin' });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); reset({}); };

  const onSubmit = async (formData: any) => {
    const validation = newAdminSchema.safeParse(formData);
    if (!validation.success) { toast.error(validation.error.errors[0].message); return; }
    createAdminMutation.mutate(formData);
  };

  const copySql = async () => {
    await navigator.clipboard.writeText(SQL_SETUP);
    setSqlCopied(true);
    toast.success('SQL copied!');
    setTimeout(() => setSqlCopied(false), 3000);
  };

  const columns: { key: string; label: string; render?: (item: ClubAdmin) => React.ReactNode }[] = [
    { key: 'user_id', label: 'User ID' },
    {
      key: 'role', label: 'Role', render: (item: ClubAdmin) => (
        <div className="flex items-center gap-2">
          {item.role === 'admin'
            ? <ShieldCheck className="h-4 w-4 text-primary" />
            : <Shield className="h-4 w-4 text-muted-foreground" />}
          <span className="capitalize">{item.role}</span>
        </div>
      )
    },
    { key: 'is_primary', label: 'Primary', render: (item: ClubAdmin) => <span>{item.is_primary ? 'Yes' : 'No'}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Club Admins & Teachers</h1>
        <p className="text-muted-foreground">Add and manage admin/teacher accounts for this club</p>
      </div>

      {/* One-time SQL setup notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              One-time setup required (if you haven't done it yet)
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Copy the SQL below and run it once in your{' '}
              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_URL.split('//')[1]?.split('.')[0]}/sql`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                Supabase SQL Editor
              </a>
              . After that, admin creation will work every time.
            </p>
          </div>
        </div>
        <div className="relative">
          <pre className="text-xs bg-white dark:bg-black/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 overflow-x-auto max-h-36 text-amber-900 dark:text-amber-200 whitespace-pre-wrap">
            {SQL_SETUP}
          </pre>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="absolute top-2 right-2 gap-1.5 text-xs border-amber-300 bg-white dark:bg-black/40 hover:bg-amber-50"
            onClick={copySql}
          >
            {sqlCopied ? <><CheckCheck className="w-3.5 h-3.5 text-green-600" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy SQL</>}
          </Button>
        </div>
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
            <Label htmlFor="password">Temporary Password *</Label>
            <Input id="password" type="password" {...register('password', { required: true })} placeholder="Min 8 characters" />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            <p className="text-xs text-muted-foreground">
              The user will receive a confirmation email and should change their password after first login.
            </p>
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
