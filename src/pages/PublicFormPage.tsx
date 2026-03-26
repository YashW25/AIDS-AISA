import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FormField } from './admin/formTemplates';
import { useSiteSettings } from '@/hooks/useSiteData';

const PublicFormPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: siteSettings } = useSiteSettings();
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [checkboxValues, setCheckboxValues] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: form, isLoading, error: formError } = useQuery({
    queryKey: ['public-form', slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('forms')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Check if this device already submitted a one-time form
  useEffect(() => {
    if (form && form.settings?.allow_multiple === false) {
      if (localStorage.getItem(`form-submitted-${form.id}`) === '1') {
        setAlreadySubmitted(true);
      }
    }
  }, [form]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const fields: FormField[] = form?.fields || [];
      const newErrors: Record<string, string> = {};

      // Validate
      fields.forEach(field => {
        if (!field.required) return;
        const val = field.type === 'checkbox' ? checkboxValues[field.id] : responses[field.id];
        if (field.type === 'checkbox') {
          if (!val || val.length === 0) newErrors[field.id] = 'This field is required';
        } else {
          if (!val || String(val).trim() === '') newErrors[field.id] = 'This field is required';
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error('Please fill in all required fields');
      }
      setErrors({});

      // Merge checkbox values into responses
      const finalResponses: Record<string, any> = { ...responses };
      Object.entries(checkboxValues).forEach(([id, vals]) => {
        finalResponses[id] = vals;
      });

      const { error } = await (supabase as any).from('form_submissions').insert({
        form_id: form.id,
        responses: finalResponses,
        submitted_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setSubmitted(true);
      if (!form?.settings?.allow_multiple) {
        localStorage.setItem(`form-submitted-${form.id}`, '1');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setValue = (fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) setErrors(prev => { const n = { ...prev }; delete n[fieldId]; return n; });
  };

  const toggleCheckbox = (fieldId: string, option: string) => {
    setCheckboxValues(prev => {
      const current = prev[fieldId] || [];
      const updated = current.includes(option)
        ? current.filter(v => v !== option)
        : [...current, option];
      return { ...prev, [fieldId]: updated };
    });
    if (errors[fieldId]) setErrors(prev => { const n = { ...prev }; delete n[fieldId]; return n; });
  };

  const renderField = (field: FormField) => {
    const err = errors[field.id];
    const wrapClass = "space-y-1.5";
    const labelEl = (
      <Label htmlFor={field.id} className="text-sm font-medium text-foreground">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
    );
    const errEl = err && <p className="text-xs text-red-500">{err}</p>;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div key={field.id} className={wrapClass}>
            {labelEl}
            <Input
              id={field.id}
              type={field.type === 'phone' ? 'tel' : field.type}
              placeholder={field.placeholder}
              value={responses[field.id] || ''}
              onChange={e => setValue(field.id, e.target.value)}
              className={err ? 'border-red-400' : ''}
              data-testid={`input-${field.id}`}
            />
            {errEl}
          </div>
        );
      case 'textarea':
        return (
          <div key={field.id} className={wrapClass}>
            {labelEl}
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={responses[field.id] || ''}
              onChange={e => setValue(field.id, e.target.value)}
              className={`resize-none min-h-[100px] ${err ? 'border-red-400' : ''}`}
              data-testid={`textarea-${field.id}`}
            />
            {errEl}
          </div>
        );
      case 'date':
        return (
          <div key={field.id} className={wrapClass}>
            {labelEl}
            <Input
              id={field.id}
              type="date"
              value={responses[field.id] || ''}
              onChange={e => setValue(field.id, e.target.value)}
              className={err ? 'border-red-400' : ''}
            />
            {errEl}
          </div>
        );
      case 'select':
        return (
          <div key={field.id} className={wrapClass}>
            {labelEl}
            <Select value={responses[field.id] || ''} onValueChange={v => setValue(field.id, v)}>
              <SelectTrigger className={err ? 'border-red-400' : ''} data-testid={`select-${field.id}`}>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errEl}
          </div>
        );
      case 'radio':
        return (
          <div key={field.id} className={wrapClass}>
            {labelEl}
            <div className="space-y-2 mt-1">
              {(field.options || []).map(opt => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name={field.id}
                    value={opt}
                    checked={responses[field.id] === opt}
                    onChange={() => setValue(field.id, opt)}
                    className="w-4 h-4 text-primary accent-primary"
                  />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">{opt}</span>
                </label>
              ))}
            </div>
            {errEl}
          </div>
        );
      case 'checkbox':
        return (
          <div key={field.id} className={wrapClass}>
            {labelEl}
            <div className="space-y-2 mt-1">
              {(field.options || []).map(opt => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={(checkboxValues[field.id] || []).includes(opt)}
                    onChange={() => toggleCheckbox(field.id, opt)}
                    className="w-4 h-4 rounded text-primary accent-primary"
                  />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">{opt}</span>
                </label>
              ))}
            </div>
            {errEl}
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="w-full max-w-xl space-y-4">
          <Skeleton className="h-8 w-3/4 rounded-xl" />
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (formError || !form) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Form Not Found</h1>
          <p className="text-muted-foreground">This form doesn't exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Already Submitted</h1>
          <p className="text-muted-foreground">You've already filled this form on this device. This form only allows one response per device.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    const isOneTime = form?.settings?.allow_multiple === false;
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Response Submitted!</h1>
          <p className="text-muted-foreground mb-6">Thank you for filling out the form. Your response has been recorded.</p>
          {!isOneTime && (
            <Button variant="outline" onClick={() => { setSubmitted(false); setResponses({}); setCheckboxValues({}); }}>
              Submit Another Response
            </Button>
          )}
        </div>
      </div>
    );
  }

  const headerText = form.settings?.header_text || siteSettings?.club_name || 'AISA Club';
  const subheader = form.settings?.subheader || '';
  const headerColor = form.settings?.header_color || '#1e40af';
  const logoUrl = form.settings?.logo_url || '';

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Letterhead header */}
        <div
          className="rounded-t-2xl text-white py-5 px-6 mb-0 flex items-center gap-4"
          style={{ backgroundColor: headerColor }}
        >
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-12 w-12 object-contain rounded shrink-0"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className={logoUrl ? 'text-left' : 'text-center flex-1'}>
            <p className="font-bold text-lg">{headerText}</p>
            {subheader && <p className="text-sm text-white/80 mt-0.5">{subheader}</p>}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-card rounded-b-2xl shadow-lg border border-border border-t-0 p-6 md:p-8 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{form.title}</h1>
            {form.description && (
              <p className="text-muted-foreground text-sm mt-1">{form.description}</p>
            )}
          </div>

          <div className="space-y-5">
            {(form.fields || []).map(renderField)}
          </div>

          <Button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            className="w-full gap-2 h-11"
            data-testid="button-submit-form"
          >
            {submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Response
          </Button>

          {form.settings?.footer_text && (
            <p className="text-xs text-muted-foreground text-center border-t border-border pt-4">
              {form.settings.footer_text}
            </p>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-4">
          Powered by {siteSettings?.club_name || 'AISA Club'}
        </p>
      </div>
    </div>
  );
};

export default PublicFormPage;
