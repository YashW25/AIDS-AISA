import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Link2, Pencil, Trash2, BarChart2, Copy, Check, Globe, EyeOff, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FORM_TEMPLATES } from './formTemplates';
import { cn } from '@/lib/utils';

const FormsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: forms = [], isLoading } = useQuery({
    queryKey: ['admin-forms'],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      const { data, error } = await (supabase as any)
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        if (error.message?.includes('does not exist') || error.code === '42P01') return '__SETUP__';
        throw error;
      }
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('forms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forms'] });
      toast.success('Form deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/form/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Link copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (forms === '__SETUP__') {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-bold text-foreground">Forms</h1>
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-6">
          <p className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Database setup needed</p>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Run <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded font-mono">supabase/forms.sql</code> in your Supabase SQL Editor to enable this feature.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Forms</h1>
          <p className="text-sm text-muted-foreground">Create forms with unique links — collect responses and export to CSV or PDF</p>
        </div>
        <Button onClick={() => navigate('/admin/dashboard/forms/builder')} className="gap-2">
          <Plus className="h-4 w-4" />
          Create from Scratch
        </Button>
      </div>

      {/* Template Cards */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Start with a sample template
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {FORM_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => navigate(`/admin/dashboard/forms/builder?template=${tpl.id}`)}
              className={cn(
                "group flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all hover:scale-[1.03] hover:shadow-md",
                tpl.colorClass
              )}
              data-testid={`button-template-${tpl.id}`}
            >
              <span className="text-3xl">{tpl.icon}</span>
              <span className="text-xs font-semibold leading-snug">{tpl.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Forms List */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Your Forms
        </p>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : (forms as any[]).length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No forms yet. Pick a template or create from scratch above.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Form</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Share Link</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(forms as any[]).map((form) => (
                  <tr key={form.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{form.title}</p>
                      {form.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[240px]">{form.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
                        form.is_published
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {form.is_published
                          ? <><Globe className="h-3 w-3" /> Published</>
                          : <><EyeOff className="h-3 w-3" /> Draft</>}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {form.is_published ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-0.5 rounded truncate max-w-[200px]">
                            /form/{form.slug}
                          </code>
                          <button
                            onClick={() => copyLink(form.slug, form.id)}
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                          >
                            {copiedId === form.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">Publish to get a link</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 px-2 gap-1 text-xs"
                          onClick={() => navigate(`/admin/dashboard/forms/${form.id}/responses`)}
                          data-testid={`button-responses-${form.id}`}
                        >
                          <BarChart2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Responses</span>
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/admin/dashboard/forms/builder?id=${form.id}`)}
                          data-testid={`button-edit-form-${form.id}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => { if (confirm('Delete this form and all its responses?')) deleteMutation.mutate(form.id); }}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-form-${form.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsPage;
