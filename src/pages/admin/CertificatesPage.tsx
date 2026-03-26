import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Loader2, Plus, Award, Search, Upload, FileImage, Download,
  Trash2, ChevronRight, ChevronLeft, FileSpreadsheet, User,
  Check, X, Eye, AlertCircle, Settings2, GripVertical,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useToast } from '@/hooks/use-toast';
import {
  FieldDef, DEFAULT_FIELD, STANDARD_FIELDS, FONT_FAMILIES,
  parseCSV, guessFieldMapping, generateCertId,
  renderCertificate, downloadBlob,
} from '@/lib/certificateUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CertTemplate {
  id: string;
  template_name: string;
  template_url: string;
  fields: FieldDef[];
  issued_by: string;
  created_at: string;
}

interface CertIssuance {
  id: string;
  certificate_id: string;
  template_id: string | null;
  event_name: string;
  event_date: string;
  full_name: string;
  email: string;
  college: string;
  project_title: string;
  position: string;
  team_id: string;
  extra_fields: Record<string, string>;
  issued_at: string;
  is_active: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const defaultFields: FieldDef[] = [
  { key: 'full_name', label: 'Recipient Name', x: 50, y: 42, fontSize: 48, fontColor: '#1a1a1a', fontWeight: 'bold', fontStyle: 'normal', align: 'center', fontFamily: 'Arial' },
  { key: 'event_name', label: 'Event Name', x: 50, y: 55, fontSize: 26, fontColor: '#444444', fontWeight: 'normal', fontStyle: 'italic', align: 'center', fontFamily: 'Arial' },
  { key: 'event_date', label: 'Event Date', x: 50, y: 63, fontSize: 20, fontColor: '#666666', fontWeight: 'normal', fontStyle: 'normal', align: 'center', fontFamily: 'Arial' },
  { key: 'certificate_id', label: 'Certificate ID', x: 82, y: 87, fontSize: 16, fontColor: '#888888', fontWeight: 'normal', fontStyle: 'normal', align: 'center', fontFamily: 'Arial' },
];

// ─── Field Editor Row ─────────────────────────────────────────────────────────

function FieldRow({
  field, index, onChange, onRemove,
}: {
  field: FieldDef;
  index: number;
  onChange: (i: number, f: FieldDef) => void;
  onRemove: (i: number) => void;
}) {
  const set = (patch: Partial<FieldDef>) => onChange(index, { ...field, ...patch });
  return (
    <div className="grid grid-cols-12 gap-2 items-end py-3 border-b last:border-b-0">
      <div className="col-span-3">
        <Label className="text-xs">Field</Label>
        <Select value={field.key} onValueChange={v => set({ key: v, label: STANDARD_FIELDS.find(f => f.key === v)?.label || field.label })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STANDARD_FIELDS.map(f => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2 grid grid-cols-2 gap-1">
        <div>
          <Label className="text-xs">X %</Label>
          <Input type="number" min={0} max={100} className="h-8 text-xs" value={field.x} onChange={e => set({ x: Number(e.target.value) })} />
        </div>
        <div>
          <Label className="text-xs">Y %</Label>
          <Input type="number" min={0} max={100} className="h-8 text-xs" value={field.y} onChange={e => set({ y: Number(e.target.value) })} />
        </div>
      </div>
      <div className="col-span-1">
        <Label className="text-xs">Size</Label>
        <Input type="number" min={8} max={200} className="h-8 text-xs" value={field.fontSize} onChange={e => set({ fontSize: Number(e.target.value) })} />
      </div>
      <div className="col-span-1">
        <Label className="text-xs">Color</Label>
        <input type="color" className="h-8 w-full rounded border" value={field.fontColor} onChange={e => set({ fontColor: e.target.value })} />
      </div>
      <div className="col-span-2">
        <Label className="text-xs">Font</Label>
        <Select value={field.fontFamily} onValueChange={v => set({ fontFamily: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{FONT_FAMILIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="col-span-2 flex gap-1">
        <div>
          <Label className="text-xs">Style</Label>
          <div className="flex gap-1">
            <Button size="sm" type="button" variant={field.fontWeight === 'bold' ? 'default' : 'outline'} className="h-8 px-2 text-xs font-bold" onClick={() => set({ fontWeight: field.fontWeight === 'bold' ? 'normal' : 'bold' })}>B</Button>
            <Button size="sm" type="button" variant={field.fontStyle === 'italic' ? 'default' : 'outline'} className="h-8 px-2 text-xs italic" onClick={() => set({ fontStyle: field.fontStyle === 'italic' ? 'normal' : 'italic' })}>I</Button>
            <Select value={field.align} onValueChange={v => set({ align: v as FieldDef['align'] })}>
              <SelectTrigger className="h-8 text-xs w-14"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">L</SelectItem>
                <SelectItem value="center">C</SelectItem>
                <SelectItem value="right">R</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="col-span-1 flex justify-end">
        <Button size="sm" type="button" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => onRemove(index)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Template Preview Overlay ─────────────────────────────────────────────────

function TemplatePreview({ templateUrl, fields, sampleData }: {
  templateUrl: string;
  fields: FieldDef[];
  sampleData: Record<string, string>;
}) {
  return (
    <div className="relative inline-block w-full border rounded overflow-hidden bg-muted">
      <img src={templateUrl} alt="Template" className="w-full h-auto block" />
      {fields.map((field, i) => {
        const value = sampleData[field.key] || `[${field.label}]`;
        return (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${field.x}%`,
              top: `${field.y}%`,
              transform: `translate(-50%, -50%)`,
              fontSize: `${Math.max(8, field.fontSize * 0.4)}px`,
              color: field.fontColor,
              fontWeight: field.fontWeight,
              fontStyle: field.fontStyle,
              fontFamily: field.fontFamily,
              textAlign: field.align,
              whiteSpace: 'nowrap',
              textShadow: '0 0 3px rgba(255,255,255,0.8)',
            }}
          >
            {value}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const CertificatesPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ── Template modal state ──
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CertTemplate | null>(null);
  const [tplName, setTplName] = useState('');
  const [tplUrl, setTplUrl] = useState('');
  const [tplIssuedBy, setTplIssuedBy] = useState('AISA Club, ISBM COE');
  const [tplFields, setTplFields] = useState<FieldDef[]>(defaultFields);

  // ── Issue/Import wizard state ──
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueStep, setIssueStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [certPrefix, setCertPrefix] = useState('AISA-2025');
  const [importMode, setImportMode] = useState<'csv' | 'manual'>('csv');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({});
  const [manualRows, setManualRows] = useState([{ full_name: '', email: '', college: '', project_title: '', position: '', team_id: '', certificate_id: '' }]);
  const [issuing, setIssuing] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // ── Download state ──
  const [downloading, setDownloading] = useState<string | null>(null);

  // ── Search ──
  const [search, setSearch] = useState('');

  // ─── Queries ───────────────────────────────────────────────────────────────

  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ['cert-templates'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('cert_templates').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((t: any) => ({ ...t, fields: Array.isArray(t.fields) ? t.fields : JSON.parse(t.fields || '[]') })) as CertTemplate[];
    },
  });

  const { data: issuances = [], isLoading: loadingIssuances } = useQuery({
    queryKey: ['cert-issuances'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('cert_issuances').select('*').order('issued_at', { ascending: false });
      if (error) throw error;
      return (data || []) as CertIssuance[];
    },
  });

  // ─── Template Mutations ────────────────────────────────────────────────────

  const saveTemplate = useMutation({
    mutationFn: async () => {
      if (!tplName.trim() || !tplUrl) throw new Error('Template name and image are required');
      const payload = { template_name: tplName.trim(), template_url: tplUrl, fields: tplFields, issued_by: tplIssuedBy };
      if (editingTemplate) {
        const { error } = await (supabase as any).from('cert_templates').update(payload).eq('id', editingTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('cert_templates').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cert-templates'] });
      toast({ title: editingTemplate ? 'Template updated' : 'Template saved' });
      closeTemplateModal();
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('cert_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cert-templates'] });
      toast({ title: 'Template deleted' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteIssuance = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('cert_issuances').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cert-issuances'] });
      toast({ title: 'Certificate deleted' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  // ─── Template Modal Helpers ────────────────────────────────────────────────

  const openNewTemplate = () => {
    setEditingTemplate(null);
    setTplName('');
    setTplUrl('');
    setTplIssuedBy('AISA Club, ISBM COE');
    setTplFields(defaultFields);
    setTemplateModalOpen(true);
  };

  const openEditTemplate = (t: CertTemplate) => {
    setEditingTemplate(t);
    setTplName(t.template_name);
    setTplUrl(t.template_url);
    setTplIssuedBy(t.issued_by || 'AISA Club, ISBM COE');
    setTplFields(t.fields.length ? t.fields : defaultFields);
    setTemplateModalOpen(true);
  };

  const closeTemplateModal = () => {
    setTemplateModalOpen(false);
    setEditingTemplate(null);
  };

  const updateField = (i: number, f: FieldDef) => setTplFields(prev => prev.map((x, idx) => idx === i ? f : x));
  const removeField = (i: number) => setTplFields(prev => prev.filter((_, idx) => idx !== i));
  const addField = () => setTplFields(prev => [...prev, { ...DEFAULT_FIELD, key: 'college' }]);

  // ─── Issue Wizard Helpers ──────────────────────────────────────────────────

  const openIssueModal = () => {
    setIssueStep(1);
    setSelectedTemplateId(templates[0]?.id || '');
    setEventName('');
    setEventDate('');
    setCertPrefix('AISA-2025');
    setImportMode('csv');
    setCsvHeaders([]);
    setCsvRows([]);
    setCsvMapping({});
    setManualRows([{ full_name: '', email: '', college: '', project_title: '', position: '', team_id: '', certificate_id: '' }]);
    setIssueModalOpen(true);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { headers, rows } = parseCSV(text);
      setCsvHeaders(headers);
      setCsvRows(rows);
      setCsvMapping(guessFieldMapping(headers));
    };
    reader.readAsText(file);
  };

  const issueAll = async () => {
    if (!eventName.trim()) {
      toast({ title: 'Event name is required', variant: 'destructive' });
      return;
    }
    const template = templates.find(t => t.id === selectedTemplateId);
    setIssuing(true);

    try {
      let records: Omit<CertIssuance, 'id' | 'is_active' | 'issued_at'>[] = [];

      if (importMode === 'csv') {
        records = csvRows.map((row, i) => {
          // Get mapped values
          const get = (key: string) => {
            const csvCol = Object.entries(csvMapping).find(([, v]) => v === key)?.[0];
            return csvCol ? row[csvCol] : '';
          };
          const certId = get('certificate_id') || generateCertId(certPrefix, i + 1);
          const extra: Record<string, string> = {};
          csvHeaders.forEach(h => {
            if (!Object.keys(csvMapping).includes(h)) extra[h] = row[h] || '';
          });
          return {
            certificate_id: certId,
            template_id: selectedTemplateId || null,
            event_name: eventName.trim(),
            event_date: eventDate,
            full_name: get('full_name') || row[csvHeaders[0]] || '',
            email: get('email'),
            college: get('college'),
            project_title: get('project_title'),
            position: get('position'),
            team_id: get('team_id'),
            extra_fields: extra,
          };
        });
      } else {
        records = manualRows
          .filter(r => r.full_name.trim())
          .map((r, i) => ({
            certificate_id: r.certificate_id || generateCertId(certPrefix, i + 1),
            template_id: selectedTemplateId || null,
            event_name: eventName.trim(),
            event_date: eventDate,
            full_name: r.full_name,
            email: r.email,
            college: r.college,
            project_title: r.project_title,
            position: r.position,
            team_id: r.team_id,
            extra_fields: {},
          }));
      }

      if (records.length === 0) {
        toast({ title: 'No records to issue', variant: 'destructive' });
        return;
      }

      const { error } = await (supabase as any).from('cert_issuances').insert(records);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['cert-issuances'] });
      toast({ title: `${records.length} certificate(s) issued successfully` });
      setIssueModalOpen(false);
    } catch (e: any) {
      toast({ title: 'Error issuing certificates', description: e.message, variant: 'destructive' });
    } finally {
      setIssuing(false);
    }
  };

  // ─── Download Certificate ──────────────────────────────────────────────────

  const handleDownload = async (issuance: CertIssuance) => {
    const template = templates.find(t => t.id === issuance.template_id);
    if (!template) {
      toast({ title: 'Template not found', variant: 'destructive' });
      return;
    }
    setDownloading(issuance.id);
    try {
      const data: Record<string, string> = {
        full_name: issuance.full_name,
        event_name: issuance.event_name,
        event_date: issuance.event_date,
        certificate_id: issuance.certificate_id,
        college: issuance.college,
        project_title: issuance.project_title,
        position: issuance.position,
        team_id: issuance.team_id,
        email: issuance.email,
        issued_by: template.issued_by || 'AISA Club',
        ...issuance.extra_fields,
      };
      const blob = await renderCertificate(template.template_url, template.fields, data);
      downloadBlob(blob, `certificate-${issuance.certificate_id}.png`);
    } catch (e: any) {
      toast({ title: 'Download failed', description: e.message, variant: 'destructive' });
    } finally {
      setDownloading(null);
    }
  };

  // ─── Filtered Issuances ────────────────────────────────────────────────────

  const filtered = issuances.filter(c =>
    !search || [c.full_name, c.certificate_id, c.event_name, c.college, c.email]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Certificates</h1>
          <p className="text-muted-foreground">Upload templates, import participants, issue certificates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openNewTemplate}>
            <FileImage className="h-4 w-4 mr-2" /> New Template
          </Button>
          <Button onClick={openIssueModal}>
            <Plus className="h-4 w-4 mr-2" /> Issue Certificates
          </Button>
        </div>
      </div>

      <Tabs defaultValue="issued">
        <TabsList>
          <TabsTrigger value="issued">Issued ({issuances.length})</TabsTrigger>
          <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
        </TabsList>

        {/* ── Issued Certificates Tab ── */}
        <TabsContent value="issued" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-testid="input-search-issued"
              placeholder="Search by name, certificate ID, event, college..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Card>
            <CardContent className="p-0">
              {loadingIssuances ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No certificates issued yet</p>
                  <Button className="mt-4" onClick={openIssueModal}><Plus className="h-4 w-4 mr-2" />Issue First Certificate</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Certificate ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>College</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(c => (
                        <TableRow key={c.id} data-testid={`row-cert-${c.id}`}>
                          <TableCell className="font-mono text-xs font-medium">{c.certificate_id}</TableCell>
                          <TableCell className="font-medium">{c.full_name}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{c.event_name}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{c.college || '—'}</TableCell>
                          <TableCell>{c.position ? <Badge variant="outline">{c.position}</Badge> : '—'}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{c.event_date || format(new Date(c.issued_at), 'PP')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm" variant="outline"
                                disabled={downloading === c.id || !c.template_id}
                                onClick={() => handleDownload(c)}
                                title={!c.template_id ? 'No template linked' : 'Download'}
                              >
                                {downloading === c.id
                                  ? <Loader2 className="h-3 w-3 animate-spin" />
                                  : <Download className="h-3 w-3" />}
                              </Button>
                              <Button
                                size="sm" variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => { if (confirm('Delete this certificate?')) deleteIssuance.mutate(c.id); }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Templates Tab ── */}
        <TabsContent value="templates" className="space-y-4">
          {loadingTemplates ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileImage className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">No templates yet. Upload a certificate background image.</p>
                <Button onClick={openNewTemplate}><Upload className="h-4 w-4 mr-2" />Upload Template</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(t => (
                <div key={t.id} className="border rounded-xl overflow-hidden bg-card" data-testid={`card-template-${t.id}`}>
                  <div className="aspect-[16/9] bg-muted overflow-hidden">
                    <img src={t.template_url} alt={t.template_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold">{t.template_name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t.fields.length} field(s) · {t.issued_by}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditTemplate(t)}>
                        <Settings2 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm('Delete template?')) deleteTemplate.mutate(t.id); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ═══ Template Modal ═══ */}
      <Dialog open={templateModalOpen} onOpenChange={v => !v && closeTemplateModal()}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'New Certificate Template'}</DialogTitle>
          </DialogHeader>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name *</Label>
                <Input data-testid="input-template-name" placeholder="e.g., Participation Certificate 2025" value={tplName} onChange={e => setTplName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Issued By</Label>
                <Input placeholder="e.g., AISA Club, ISBM COE" value={tplIssuedBy} onChange={e => setTplIssuedBy(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Certificate Background Image *</Label>
                <ImageUpload value={tplUrl} onChange={setTplUrl} folder="certificate-templates" />
                <p className="text-xs text-muted-foreground">Upload PNG or JPG. Text fields will be overlaid at the positions you define.</p>
              </div>

              {tplUrl && (
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Text Fields</Label>
                    <Button size="sm" type="button" variant="outline" onClick={addField}>
                      <Plus className="h-3 w-3 mr-1" /> Add Field
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">X/Y are percentages from the top-left corner of the image. Use the preview to fine-tune positions.</p>
                  <div className="space-y-1">
                    {tplFields.map((field, i) => (
                      <FieldRow key={i} field={field} index={i} onChange={updateField} onRemove={removeField} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: preview */}
            {tplUrl && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Live Preview</Label>
                <p className="text-xs text-muted-foreground">Sample text shown at field positions</p>
                <TemplatePreview
                  templateUrl={tplUrl}
                  fields={tplFields}
                  sampleData={{
                    full_name: 'John Doe',
                    event_name: 'Technovation 2025',
                    event_date: '26 March 2025',
                    certificate_id: 'AISA-2025-0001',
                    college: 'ISBM COE',
                    project_title: 'AI Model',
                    position: '1st Place',
                    issued_by: tplIssuedBy,
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={closeTemplateModal}>Cancel</Button>
            <Button onClick={() => saveTemplate.mutate()} disabled={saveTemplate.isPending || !tplName || !tplUrl}>
              {saveTemplate.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingTemplate ? 'Update Template' : 'Save Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ Issue / Import Wizard ═══ */}
      <Dialog open={issueModalOpen} onOpenChange={v => !v && setIssueModalOpen(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Certificates</DialogTitle>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-2 text-sm mb-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${issueStep >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {issueStep > s ? <Check className="h-4 w-4" /> : s}
                </div>
                <span className={issueStep === s ? 'font-medium' : 'text-muted-foreground'}>
                  {s === 1 ? 'Template & Event' : s === 2 ? 'Add Participants' : 'Review & Issue'}
                </span>
                {s < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>

          {/* ── Step 1: Template & Event ── */}
          {issueStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Certificate Template *</Label>
                {templates.length === 0 ? (
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 flex gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    No templates yet. Close this dialog and upload a template first.
                  </div>
                ) : (
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger data-testid="select-template"><SelectValue placeholder="Choose template" /></SelectTrigger>
                    <SelectContent>
                      {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.template_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Event Name *</Label>
                <Input data-testid="input-event-name" placeholder="e.g., Technovation 2025" value={eventName} onChange={e => setEventName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Event Date</Label>
                <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Certificate ID Prefix</Label>
                <Input placeholder="e.g., AISA-2025" value={certPrefix} onChange={e => setCertPrefix(e.target.value)} />
                <p className="text-xs text-muted-foreground">IDs will be generated as {certPrefix}-0001, {certPrefix}-0002, etc. If your CSV already has Certificate IDs, those will be used instead.</p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setIssueStep(2)} disabled={!eventName.trim() || templates.length === 0}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Add Participants ── */}
          {issueStep === 2 && (
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                <Button size="sm" variant={importMode === 'csv' ? 'default' : 'ghost'} onClick={() => setImportMode('csv')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" /> Upload CSV
                </Button>
                <Button size="sm" variant={importMode === 'manual' ? 'default' : 'ghost'} onClick={() => setImportMode('manual')}>
                  <User className="h-4 w-4 mr-2" /> Manual Entry
                </Button>
              </div>

              {importMode === 'csv' ? (
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => csvInputRef.current?.click()}
                  >
                    <FileSpreadsheet className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="font-medium">Click to upload CSV file</p>
                    <p className="text-sm text-muted-foreground mt-1">Supported columns: Team ID, Full Name, Certificate ID, Email ID, College, Project Title, Position</p>
                    <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                  </div>

                  {csvRows.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{csvRows.length} rows loaded from CSV</span>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Column Mapping</Label>
                        <p className="text-xs text-muted-foreground">Map your CSV columns to certificate fields. Auto-detected where possible.</p>
                        <div className="grid grid-cols-2 gap-2">
                          {csvHeaders.map(h => (
                            <div key={h} className="flex items-center gap-2">
                              <span className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1 truncate">{h}</span>
                              <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <Select
                                value={csvMapping[h] || '__ignore__'}
                                onValueChange={v => setCsvMapping(prev => ({ ...prev, [h]: v === '__ignore__' ? '' : v }))}
                              >
                                <SelectTrigger className="h-7 text-xs w-36"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__ignore__">— ignore —</SelectItem>
                                  {STANDARD_FIELDS.map(f => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="overflow-x-auto max-h-48 border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {csvHeaders.slice(0, 5).map(h => <TableHead key={h} className="text-xs">{h}</TableHead>)}
                              {csvHeaders.length > 5 && <TableHead className="text-xs">+{csvHeaders.length - 5} more</TableHead>}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {csvRows.slice(0, 5).map((row, i) => (
                              <TableRow key={i}>
                                {csvHeaders.slice(0, 5).map(h => <TableCell key={h} className="text-xs">{row[h]}</TableCell>)}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Full Name *</TableHead>
                          <TableHead className="text-xs">Email</TableHead>
                          <TableHead className="text-xs">College</TableHead>
                          <TableHead className="text-xs">Project Title</TableHead>
                          <TableHead className="text-xs">Position</TableHead>
                          <TableHead className="text-xs">Cert ID (auto if blank)</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {manualRows.map((row, i) => (
                          <TableRow key={i}>
                            {(['full_name', 'email', 'college', 'project_title', 'position', 'certificate_id'] as const).map(field => (
                              <TableCell key={field} className="p-1">
                                <Input
                                  className="h-7 text-xs"
                                  placeholder={field === 'certificate_id' ? 'auto' : ''}
                                  value={row[field]}
                                  onChange={e => setManualRows(prev => prev.map((r, ri) => ri === i ? { ...r, [field]: e.target.value } : r))}
                                />
                              </TableCell>
                            ))}
                            <TableCell className="p-1">
                              {manualRows.length > 1 && (
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setManualRows(prev => prev.filter((_, ri) => ri !== i))}>
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setManualRows(prev => [...prev, { full_name: '', email: '', college: '', project_title: '', position: '', team_id: '', certificate_id: '' }])}>
                    <Plus className="h-3 w-3 mr-1" /> Add Row
                  </Button>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setIssueStep(1)}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
                <Button
                  onClick={() => setIssueStep(3)}
                  disabled={(importMode === 'csv' && csvRows.length === 0) || (importMode === 'manual' && !manualRows.some(r => r.full_name.trim()))}
                >
                  Review <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review & Issue ── */}
          {issueStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Template</span>
                  <span className="font-medium">{selectedTemplate?.template_name || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Event</span>
                  <span className="font-medium">{eventName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{eventDate || 'Not specified'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Participants</span>
                  <span className="font-medium">
                    {importMode === 'csv' ? csvRows.length : manualRows.filter(r => r.full_name.trim()).length} to be issued
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto max-h-48 border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">College</TableHead>
                      <TableHead className="text-xs">Position</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(importMode === 'csv' ? csvRows.slice(0, 10) : manualRows.filter(r => r.full_name.trim()).slice(0, 10)).map((row, i) => {
                      const getName = (r: Record<string, string>) => {
                        if (importMode === 'csv') {
                          const col = Object.entries(csvMapping).find(([, v]) => v === 'full_name')?.[0];
                          return col ? r[col] : r[csvHeaders[0]];
                        }
                        return (r as any).full_name;
                      };
                      return (
                        <TableRow key={i}>
                          <TableCell className="text-xs">{getName(row)}</TableCell>
                          <TableCell className="text-xs">{importMode === 'csv' ? (row[Object.entries(csvMapping).find(([, v]) => v === 'college')?.[0] || ''] || '—') : (row as any).college || '—'}</TableCell>
                          <TableCell className="text-xs">{importMode === 'csv' ? (row[Object.entries(csvMapping).find(([, v]) => v === 'position')?.[0] || ''] || '—') : (row as any).position || '—'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setIssueStep(2)}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
                <Button onClick={issueAll} disabled={issuing}>
                  {issuing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  <Award className="h-4 w-4 mr-2" />
                  Issue All Certificates
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CertificatesPage;
