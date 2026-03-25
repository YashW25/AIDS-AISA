import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminFetch, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/useAdminData';
import { FormModal } from '@/components/admin/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Plus,
  Upload,
  Download,
  Pencil,
  Trash2,
  GraduationCap,
  Users,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';

type Student = {
  id: string;
  full_name: string;
  enrollment_number: string | null;
  email: string | null;
  phone: string | null;
  branch: string | null;
  batch_year: string;
  graduation_year: string;
  image_url: string | null;
  linkedin_url: string | null;
  notes: string | null;
  is_active: boolean | null;
  transferred_to_alumni: boolean | null;
  position: number | null;
  created_at: string | null;
};

type StudentForm = Omit<Student, 'id' | 'created_at'>;

const CURRENT_YEAR = new Date().getFullYear();
const CSV_HEADERS = ['full_name', 'enrollment_number', 'email', 'phone', 'branch', 'batch_year', 'graduation_year', 'linkedin_url', 'notes'];

function isGraduated(student: Student) {
  return parseInt(student.graduation_year) <= CURRENT_YEAR && !student.transferred_to_alumni;
}

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [transferId, setTransferId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Student | null>(null);
  const [csvRows, setCsvRows] = useState<Partial<StudentForm>[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: students = [], isLoading } = useAdminFetch<Student>('students', 'students', 'created_at', false);
  const createMutation = useAdminCreate<Student>('students', 'students');
  const updateMutation = useAdminUpdate<Student>('students', 'students');
  const deleteMutation = useAdminDelete('students', 'students');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StudentForm>();

  const openModal = (item?: Student) => {
    if (item) {
      setEditingItem(item);
      reset({
        full_name: item.full_name,
        enrollment_number: item.enrollment_number || '',
        email: item.email || '',
        phone: item.phone || '',
        branch: item.branch || 'AI & DS',
        batch_year: item.batch_year,
        graduation_year: item.graduation_year,
        image_url: item.image_url || '',
        linkedin_url: item.linkedin_url || '',
        notes: item.notes || '',
        is_active: item.is_active ?? true,
        transferred_to_alumni: item.transferred_to_alumni ?? false,
        position: item.position ?? 0,
      });
    } else {
      setEditingItem(null);
      reset({
        full_name: '',
        enrollment_number: '',
        email: '',
        phone: '',
        branch: 'AI & DS',
        batch_year: String(CURRENT_YEAR),
        graduation_year: String(CURRENT_YEAR + 4),
        image_url: '',
        linkedin_url: '',
        notes: '',
        is_active: true,
        transferred_to_alumni: false,
        position: 0,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    reset();
  };

  const onSubmit = (data: StudentForm) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...data }, { onSuccess: closeModal });
    } else {
      createMutation.mutate(data, { onSuccess: closeModal });
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateMutation.mutate({ id, is_active: isActive });
  };

  const handleTransferToAlumni = async (student: Student) => {
    setTransferring(true);
    try {
      const { error: alumniError } = await (supabase as any).from('alumni').insert({
        name: student.full_name,
        graduation_year: student.graduation_year,
        branch: student.branch || 'AI & DS',
        image_url: student.image_url,
        linkedin_url: student.linkedin_url,
        company: null,
        job_title: null,
        testimonial: null,
        is_active: true,
        position: student.position ?? 0,
      });
      if (alumniError) throw alumniError;
      const { error: updateError } = await (supabase as any)
        .from('students')
        .update({ transferred_to_alumni: true, is_active: false })
        .eq('id', student.id);
      if (updateError) throw updateError;
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['alumni'] });
      toast.success(`${student.full_name} transferred to alumni successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to transfer student to alumni');
    } finally {
      setTransferring(false);
      setTransferId(null);
    }
  };

  const handleBulkTransfer = async () => {
    const toTransfer = activeStudents.filter(isGraduated);
    if (!toTransfer.length) return;
    setTransferring(true);
    try {
      const alumniRows = toTransfer.map(s => ({
        name: s.full_name,
        graduation_year: s.graduation_year,
        branch: s.branch || 'AI & DS',
        image_url: s.image_url,
        linkedin_url: s.linkedin_url,
        company: null,
        job_title: null,
        testimonial: null,
        is_active: true,
        position: s.position ?? 0,
      }));
      const { error: alumniError } = await (supabase as any).from('alumni').insert(alumniRows);
      if (alumniError) throw alumniError;
      const ids = toTransfer.map(s => s.id);
      const { error: updateError } = await (supabase as any)
        .from('students')
        .update({ transferred_to_alumni: true, is_active: false })
        .in('id', ids);
      if (updateError) throw updateError;
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['alumni'] });
      toast.success(`${toTransfer.length} student(s) transferred to alumni`);
    } catch (err: any) {
      toast.error(err.message || 'Bulk transfer failed');
    } finally {
      setTransferring(false);
    }
  };

  // CSV download template
  const downloadTemplate = () => {
    const sampleRows = [
      ['Rohit Sharma', 'ISBM2021001', 'rohit@example.com', '9876543210', 'AI & DS', '2021', '2025', 'https://linkedin.com/in/rohit', 'Class rep'],
      ['Priya Patel', 'ISBM2022002', 'priya@example.com', '9876543211', 'AI & DS', '2022', '2026', '', ''],
    ];
    const csv = [CSV_HEADERS.join(','), ...sampleRows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Parse CSV file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
        const nameIdx = headers.indexOf('full_name');
        const batchIdx = headers.indexOf('batch_year');
        const gradIdx = headers.indexOf('graduation_year');
        if (nameIdx === -1 || batchIdx === -1 || gradIdx === -1) {
          throw new Error('CSV must contain columns: full_name, batch_year, graduation_year (and others are optional)');
        }
        const rows: Partial<StudentForm>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          const get = (col: string) => {
            const idx = headers.indexOf(col);
            return idx !== -1 ? vals[idx] || null : null;
          };
          const full_name = get('full_name');
          const batch_year = get('batch_year');
          const graduation_year = get('graduation_year');
          if (!full_name || !batch_year || !graduation_year) continue;
          rows.push({
            full_name,
            enrollment_number: get('enrollment_number'),
            email: get('email'),
            phone: get('phone'),
            branch: get('branch') || 'AI & DS',
            batch_year,
            graduation_year,
            linkedin_url: get('linkedin_url'),
            notes: get('notes'),
            is_active: true,
            transferred_to_alumni: false,
            position: 0,
          });
        }
        if (!rows.length) throw new Error('No valid rows found in CSV');
        setCsvRows(rows);
      } catch (err: any) {
        setCsvError(err.message);
        setCsvRows([]);
      }
    };
    reader.readAsText(file);
  };

  const handleCsvImport = async () => {
    if (!csvRows.length) return;
    setCsvImporting(true);
    try {
      const { error } = await (supabase as any).from('students').insert(csvRows);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`${csvRows.length} student(s) imported successfully`);
      setCsvRows([]);
      setCsvModalOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setCsvImporting(false);
    }
  };

  const filteredStudents = students.filter(s =>
    !searchQuery ||
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.enrollment_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeStudents = filteredStudents.filter(s => !s.transferred_to_alumni);
  const transferredStudents = filteredStudents.filter(s => s.transferred_to_alumni);
  const readyForTransfer = activeStudents.filter(isGraduated);

  const studentToTransfer = transferId ? students.find(s => s.id === transferId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Student Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage club members. Students are automatically flagged for alumni transfer after graduation.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setCsvModalOpen(true)} data-testid="button-import-csv">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => openModal()} data-testid="button-add-student">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{students.filter(s => !s.transferred_to_alumni).length}</p>
              <p className="text-xs text-muted-foreground">Active Students</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{readyForTransfer.length}</p>
              <p className="text-xs text-muted-foreground">Ready for Transfer</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{students.filter(s => s.transferred_to_alumni).length}</p>
              <p className="text-xs text-muted-foreground">Transferred Alumni</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{students.length}</p>
              <p className="text-xs text-muted-foreground">Total Registered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Transfer Alert */}
      {readyForTransfer.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />
            <div>
              <p className="font-semibold text-orange-800 dark:text-orange-300">
                {readyForTransfer.length} student{readyForTransfer.length > 1 ? 's' : ''} ready for alumni transfer
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Their graduation year ({readyForTransfer[0]?.graduation_year}) has passed. Transfer them to the alumni section.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
            onClick={handleBulkTransfer}
            disabled={transferring}
            data-testid="button-bulk-transfer"
          >
            {transferring ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <GraduationCap className="h-4 w-4 mr-2" />}
            Transfer All ({readyForTransfer.length})
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by name, enrollment number, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
          data-testid="input-search-students"
        />
        {searchQuery && (
          <Button variant="ghost" size="icon" onClick={() => setSearchQuery('')}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active" data-testid="tab-active-students">
            Active Students
            {activeStudents.length > 0 && (
              <Badge variant="secondary" className="ml-2">{activeStudents.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="transferred" data-testid="tab-transferred">
            Transferred Alumni
            {transferredStudents.length > 0 && (
              <Badge variant="secondary" className="ml-2">{transferredStudents.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Enrollment No.</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Grad. Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading students...</TableCell>
                  </TableRow>
                ) : activeStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No active students found. Add students manually or import via CSV.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeStudents.map((student) => (
                    <TableRow key={student.id} data-testid={`row-student-${student.id}`}
                      className={isGraduated(student) ? 'bg-orange-50 dark:bg-orange-950/10' : ''}>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{student.enrollment_number || '—'}</TableCell>
                      <TableCell>{student.branch || '—'}</TableCell>
                      <TableCell>{student.batch_year}</TableCell>
                      <TableCell>{student.graduation_year}</TableCell>
                      <TableCell>
                        {isGraduated(student) ? (
                          <Badge variant="outline" className="border-orange-400 text-orange-600 bg-orange-50 dark:bg-orange-950/20">
                            Graduated
                          </Badge>
                        ) : parseInt(student.graduation_year) > CURRENT_YEAR ? (
                          <Badge variant="outline" className="border-green-400 text-green-600 bg-green-50 dark:bg-green-950/20">
                            Current
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Unknown</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={student.is_active ?? true}
                          onCheckedChange={(v) => handleToggleActive(student.id, v)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {isGraduated(student) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-600 border-orange-300 hover:bg-orange-50 text-xs"
                              onClick={() => setTransferId(student.id)}
                              data-testid={`button-transfer-${student.id}`}
                            >
                              <GraduationCap className="h-3.5 w-3.5 mr-1" />
                              Transfer
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => openModal(student)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(student.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="transferred" className="mt-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Enrollment No.</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Grad. Year</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transferredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No transferred alumni yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  transferredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{student.enrollment_number || '—'}</TableCell>
                      <TableCell>{student.branch || '—'}</TableCell>
                      <TableCell>{student.batch_year}</TableCell>
                      <TableCell>{student.graduation_year}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openModal(student)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(student.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Student Modal */}
      <FormModal
        title={editingItem ? 'Edit Student' : 'Add Student'}
        open={modalOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" {...register('full_name', { required: true })} placeholder="e.g. Rohit Sharma" data-testid="input-full-name" />
              {errors.full_name && <span className="text-sm text-destructive">Full name is required</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollment_number">Enrollment Number</Label>
              <Input id="enrollment_number" {...register('enrollment_number')} placeholder="e.g. ISBM2021001" data-testid="input-enrollment-number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" {...register('branch')} placeholder="AI & DS" data-testid="input-branch" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} placeholder="student@example.com" data-testid="input-email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} placeholder="9876543210" data-testid="input-phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch_year">Batch Year (Joining Year) *</Label>
              <Input id="batch_year" {...register('batch_year', { required: true })} placeholder="e.g. 2021" data-testid="input-batch-year" />
              {errors.batch_year && <span className="text-sm text-destructive">Required</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduation_year">
                Graduation Year *
                <span className="text-xs text-muted-foreground ml-2">(auto-transfer trigger)</span>
              </Label>
              <Input id="graduation_year" {...register('graduation_year', { required: true })} placeholder="e.g. 2025" data-testid="input-graduation-year" />
              {errors.graduation_year && <span className="text-sm text-destructive">Required</span>}
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input id="linkedin_url" {...register('linkedin_url')} placeholder="https://linkedin.com/in/..." data-testid="input-linkedin" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} placeholder="Any additional information..." rows={2} data-testid="input-notes" />
            </div>
          </div>

          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            💡 When the <strong>Graduation Year</strong> is reached, this student will be flagged automatically for alumni transfer. You can then transfer them to the Alumni section with one click.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-student">
              {editingItem ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </FormModal>

      {/* CSV Import Modal */}
      <FormModal
        title="Import Students via CSV"
        open={csvModalOpen}
        onClose={() => { setCsvModalOpen(false); setCsvRows([]); setCsvError(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
      >
        <div className="space-y-5">
          {/* Instructions */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <FileText className="h-4 w-4 text-primary" />
              CSV File Instructions
            </div>
            <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>Download the CSV template below to get the correct column format.</li>
              <li>Open it in Excel, Google Sheets, or any spreadsheet app.</li>
              <li>Fill in student data — <strong>full_name</strong>, <strong>batch_year</strong>, and <strong>graduation_year</strong> are required.</li>
              <li>Save as <strong>CSV (Comma delimited)</strong> — not .xlsx or .ods.</li>
              <li>Upload the saved file using the button below.</li>
              <li>Review the preview, then click <strong>Import</strong>.</li>
            </ol>
            <div className="rounded-md bg-muted p-3 font-mono text-xs overflow-x-auto whitespace-nowrap border">
              <span className="text-primary font-bold">Required:</span> full_name, batch_year, graduation_year<br />
              <span className="text-muted-foreground">Optional:</span> enrollment_number, email, phone, branch, linkedin_url, notes
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate} data-testid="button-download-template">
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Select CSV File</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="cursor-pointer"
              data-testid="input-csv-file"
            />
            {csvError && (
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {csvError}
              </p>
            )}
          </div>

          {/* Preview */}
          {csvRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {csvRows.length} student{csvRows.length > 1 ? 's' : ''} ready to import
                </p>
                <Button variant="ghost" size="sm" onClick={() => { setCsvRows([]); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                  Clear
                </Button>
              </div>
              <div className="rounded-lg border overflow-hidden max-h-48 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Enrollment</TableHead>
                      <TableHead className="text-xs">Branch</TableHead>
                      <TableHead className="text-xs">Batch</TableHead>
                      <TableHead className="text-xs">Grad. Year</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvRows.map((row, i) => (
                      <TableRow key={i} className="text-xs">
                        <TableCell>{row.full_name || '—'}</TableCell>
                        <TableCell>{row.enrollment_number || '—'}</TableCell>
                        <TableCell>{row.branch || '—'}</TableCell>
                        <TableCell>{row.batch_year || '—'}</TableCell>
                        <TableCell>{row.graduation_year || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => { setCsvModalOpen(false); setCsvRows([]); setCsvError(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCsvImport}
              disabled={!csvRows.length || csvImporting}
              data-testid="button-confirm-import"
            >
              {csvImporting ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Importing...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" /> Import {csvRows.length > 0 ? `(${csvRows.length})` : ''}</>
              )}
            </Button>
          </div>
        </div>
      </FormModal>

      {/* Transfer to Alumni Confirm Dialog */}
      <AlertDialog open={!!transferId} onOpenChange={() => setTransferId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer to Alumni</AlertDialogTitle>
            <AlertDialogDescription>
              This will move <strong>{studentToTransfer?.full_name}</strong> to the Alumni section.
              A new alumni profile will be created with their details. You can then update their company and job title from the Alumni page.
              This action marks them as transferred (cannot be undone automatically).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => studentToTransfer && handleTransferToAlumni(studentToTransfer)}
              disabled={transferring}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {transferring ? 'Transferring...' : 'Transfer to Alumni'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This permanently removes the student record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
