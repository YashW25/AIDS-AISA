import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Save, Globe, EyeOff,
  GripVertical, Pencil, X, Check, Eye, Link2, Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormModal } from '@/components/admin/FormModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FORM_TEMPLATES, FormField, FieldType } from './formTemplates';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text / Paragraph' },
  { value: 'email', label: 'Email Address' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown (Select One)' },
  { value: 'radio', label: 'Radio (Choose One)' },
  { value: 'checkbox', label: 'Checkboxes (Choose Many)' },
];

const generateId = () => Math.random().toString(36).slice(2, 10);
const generateSlug = (title: string) => {
  const base = title.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').slice(0, 30);
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
};

const emptyField = (): FormField => ({
  id: generateId(), type: 'text', label: '', placeholder: '', required: false, options: [],
});

const FormBuilderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const formId = searchParams.get('id');
  const templateId = searchParams.get('template');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [headerText, setHeaderText] = useState('AISA Club');
  const [subheader, setSubheader] = useState('');
  const [footerText, setFooterText] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [headerColor, setHeaderColor] = useState('#1e40af');
  const [fields, setFields] = useState<FormField[]>([]);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [fieldOptions, setFieldOptions] = useState('');

  // Fetch existing form if editing
  const { data: existingForm, isLoading } = useQuery({
    queryKey: ['form-builder', formId],
    enabled: !!formId,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('forms').select('*').eq('id', formId).single();
      if (error) throw error;
      return data as any;
    },
  });

  useEffect(() => {
    if (existingForm) {
      setTitle(existingForm.title);
      setDescription(existingForm.description || '');
      setSlug(existingForm.slug);
      setIsPublished(existingForm.is_published);
      setAllowMultiple(existingForm.settings?.allow_multiple !== false);
      setHeaderText(existingForm.settings?.header_text || 'AISA Club');
      setSubheader(existingForm.settings?.subheader || '');
      setFooterText(existingForm.settings?.footer_text || '');
      setLogoUrl(existingForm.settings?.logo_url || '');
      setHeaderColor(existingForm.settings?.header_color || '#1e40af');
      setFields(existingForm.fields || []);
    }
  }, [existingForm]);

  // Load template if creating from template
  useEffect(() => {
    if (templateId && !formId) {
      const tpl = FORM_TEMPLATES.find(t => t.id === templateId);
      if (tpl) {
        setTitle(tpl.name);
        setDescription(tpl.description);
        setSlug(generateSlug(tpl.name));
        setHeaderText(tpl.settings.header_text);
        setSubheader(tpl.settings.subheader);
        setFooterText(tpl.settings.footer_text);
        setFields(tpl.fields.map(f => ({ ...f, id: generateId() })));
      }
    } else if (!formId) {
      setSlug(generateSlug('my-form'));
    }
  }, [templateId, formId]);

  // Auto-update slug when title changes (only for new forms)
  useEffect(() => {
    if (!formId && title) {
      setSlug(generateSlug(title));
    }
  }, [title, formId]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!title.trim()) throw new Error('Form title is required');
      if (fields.length === 0) throw new Error('Add at least one field');

      const payload = {
        title: title.trim(),
        description: description.trim(),
        slug: slug.trim(),
        is_published: isPublished,
        fields,
        settings: {
          allow_multiple: allowMultiple,
          header_text: headerText,
          subheader,
          footer_text: footerText,
          logo_url: logoUrl.trim(),
          header_color: headerColor,
        },
        updated_at: new Date().toISOString(),
      };

      if (formId) {
        const { error } = await (supabase as any).from('forms').update(payload).eq('id', formId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('forms').insert({ ...payload, created_by: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forms'] });
      toast.success(formId ? 'Form updated!' : 'Form created!');
      navigate('/admin/dashboard/forms');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openAddField = () => {
    setEditingField(emptyField());
    setFieldOptions('');
    setFieldModalOpen(true);
  };

  const openEditField = (field: FormField) => {
    setEditingField({ ...field });
    setFieldOptions((field.options || []).join('\n'));
    setFieldModalOpen(true);
  };

  const saveField = () => {
    if (!editingField || !editingField.label.trim()) {
      toast.error('Field label is required');
      return;
    }
    const needsOptions = ['select', 'radio', 'checkbox'].includes(editingField.type);
    const options = needsOptions
      ? fieldOptions.split('\n').map(o => o.trim()).filter(Boolean)
      : [];
    if (needsOptions && options.length < 2) {
      toast.error('Add at least 2 options');
      return;
    }
    const updated = { ...editingField, options };

    const existing = fields.find(f => f.id === updated.id);
    if (existing) {
      setFields(fields.map(f => f.id === updated.id ? updated : f));
    } else {
      setFields([...fields, updated]);
    }
    setFieldModalOpen(false);
    setEditingField(null);
  };

  const deleteField = (id: string) => setFields(fields.filter(f => f.id !== id));
  const moveUp = (i: number) => {
    if (i === 0) return;
    const arr = [...fields]; [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; setFields(arr);
  };
  const moveDown = (i: number) => {
    if (i === fields.length - 1) return;
    const arr = [...fields]; [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; setFields(arr);
  };

  const needsOptions = editingField && ['select', 'radio', 'checkbox'].includes(editingField.type);
  const shareUrl = `${window.location.origin}/form/${slug}`;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back + Save header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button variant="ghost" onClick={() => navigate('/admin/dashboard/forms')} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Forms
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
              id="published-toggle"
            />
            <Label htmlFor="published-toggle" className="cursor-pointer text-sm">
              {isPublished ? <span className="text-green-600 flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Published</span>
                : <span className="text-muted-foreground flex items-center gap-1"><EyeOff className="h-3.5 w-3.5" /> Draft</span>}
            </Label>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : (formId ? 'Save Changes' : 'Create Form')}
          </Button>
        </div>
      </div>

      {/* Form Settings */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Form Details</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Form Title *</Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Student Feedback Form 2024" data-testid="input-form-title" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Description (optional)</Label>
          <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description shown to respondents..." className="resize-none h-16" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Form URL Slug *</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">/form/</span>
            <Input id="slug" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="unique-form-slug" className="flex-1" />
          </div>
          {slug && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Link2 className="h-3 w-3" />
              Share link: <span className="font-mono text-primary">{shareUrl}</span>
            </p>
          )}
        </div>
      </div>

      {/* Submission Settings */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Response Settings</h2>
        <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/40 border border-border">
          <div>
            <p className="font-medium text-sm text-foreground">
              {allowMultiple ? 'Multiple submissions allowed' : 'One response per device'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {allowMultiple
                ? 'Anyone can fill this form multiple times from the same device.'
                : 'Each device can only submit this form once (tracked via browser).'}
            </p>
          </div>
          <Switch
            checked={!allowMultiple}
            onCheckedChange={v => setAllowMultiple(!v)}
            id="one-time-toggle"
          />
        </div>
      </div>

      {/* PDF Letterhead Settings */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">PDF Export Design</h2>
        <p className="text-xs text-muted-foreground">Customise the header and footer shown on exported PDF responses.</p>

        {/* Logo + Color row */}
        <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
          <div className="space-y-2">
            <Label>Logo URL (optional)</Label>
            <Input
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-muted-foreground">Paste a public image URL — the logo appears on the left of the PDF header.</p>
          </div>
          <div className="space-y-2">
            <Label>Header Colour</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={headerColor}
                onChange={e => setHeaderColor(e.target.value)}
                className="h-9 w-12 rounded border border-border cursor-pointer p-0.5"
              />
              <Input
                value={headerColor}
                onChange={e => setHeaderColor(e.target.value)}
                className="w-28 font-mono text-sm"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        {/* Logo preview */}
        {logoUrl && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
            <img
              src={logoUrl}
              alt="Logo preview"
              className="h-10 w-10 object-contain rounded"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <p className="text-xs text-muted-foreground">Logo preview — make sure it's publicly accessible</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Header Text (Institution Name)</Label>
            <Input value={headerText} onChange={e => setHeaderText(e.target.value)} placeholder="e.g. ISBM College of Engineering" />
          </div>
          <div className="space-y-2">
            <Label>Subheader</Label>
            <Input value={subheader} onChange={e => setSubheader(e.target.value)} placeholder="e.g. Academic Year 2024-25" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Footer Text</Label>
          <Input value={footerText} onChange={e => setFooterText(e.target.value)} placeholder="e.g. Confidential — For internal use only" />
        </div>

        {/* PDF preview bar */}
        <div className="rounded-lg overflow-hidden border border-border">
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ backgroundColor: headerColor }}
          >
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-8 w-8 object-contain rounded shrink-0"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{headerText || 'Header Text'}</p>
              {subheader && <p className="text-white/80 text-xs truncate">{subheader}</p>}
            </div>
          </div>
          <div className="bg-muted/20 px-4 py-2 flex justify-between items-center border-t border-border">
            <p className="text-xs text-muted-foreground truncate">{footerText || 'Footer text...'}</p>
            <p className="text-xs text-muted-foreground">Page 1</p>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Form Fields ({fields.length})
          </h2>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-3">No fields yet. Add your first field below.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
                <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground truncate">{field.label}</span>
                    {field.required && <span className="shrink-0 text-red-500 text-xs">*required</span>}
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {FIELD_TYPES.find(t => t.value === field.type)?.label}
                    {field.options?.length ? ` · ${field.options.length} options` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1 rounded hover:bg-muted disabled:opacity-30">
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => moveDown(i)} disabled={i === fields.length - 1} className="p-1 rounded hover:bg-muted disabled:opacity-30">
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => openEditField(field)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => deleteField(field.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" onClick={openAddField} className="w-full gap-2" data-testid="button-add-field">
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      {/* Field Edit Modal */}
      <FormModal
        title={editingField && fields.find(f => f.id === editingField.id) ? 'Edit Field' : 'Add Field'}
        open={fieldModalOpen}
        onClose={() => { setFieldModalOpen(false); setEditingField(null); }}
      >
        {editingField && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Field Type</Label>
              <Select
                value={editingField.type}
                onValueChange={(v) => setEditingField({ ...editingField, type: v as FieldType, options: [] })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Label / Question *</Label>
              <Input
                value={editingField.label}
                onChange={e => setEditingField({ ...editingField, label: e.target.value })}
                placeholder="e.g. What is your full name?"
                data-testid="input-field-label"
              />
            </div>
            {!needsOptions && editingField.type !== 'date' && editingField.type !== 'checkbox' && (
              <div className="space-y-2">
                <Label>Placeholder text (optional)</Label>
                <Input
                  value={editingField.placeholder || ''}
                  onChange={e => setEditingField({ ...editingField, placeholder: e.target.value })}
                  placeholder="Hint shown inside the field..."
                />
              </div>
            )}
            {needsOptions && (
              <div className="space-y-2">
                <Label>Options (one per line) *</Label>
                <Textarea
                  value={fieldOptions}
                  onChange={e => setFieldOptions(e.target.value)}
                  placeholder={"Option 1\nOption 2\nOption 3"}
                  className="resize-none h-28 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Enter each option on a new line. Minimum 2 options.</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Switch
                checked={editingField.required}
                onCheckedChange={v => setEditingField({ ...editingField, required: v })}
                id="req-toggle"
              />
              <Label htmlFor="req-toggle">Required field</Label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setFieldModalOpen(false); setEditingField(null); }}>Cancel</Button>
              <Button onClick={saveField} data-testid="button-save-field">
                <Check className="h-4 w-4 mr-2" />
                {fields.find(f => f.id === editingField.id) ? 'Save Changes' : 'Add Field'}
              </Button>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
};

export default FormBuilderPage;
