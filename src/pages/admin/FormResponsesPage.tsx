import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Search, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const FormResponsesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: form, isLoading: formLoading } = useQuery({
    queryKey: ['form-detail', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('forms').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: submissions = [], isLoading: subsLoading } = useQuery({
    queryKey: ['form-submissions', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('form_submissions')
        .select('*')
        .eq('form_id', id)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const isLoading = formLoading || subsLoading;

  const getCellValue = (responses: any, fieldId: string) => {
    const val = responses?.[fieldId];
    if (Array.isArray(val)) return val.join(', ');
    return val ?? '';
  };

  const filterSubmissions = (subs: any[]) => {
    if (!search) return subs;
    const q = search.toLowerCase();
    return subs.filter(s =>
      Object.values(s.responses || {}).some((v: any) =>
        String(Array.isArray(v) ? v.join(' ') : v).toLowerCase().includes(q)
      )
    );
  };

  const exportCSV = () => {
    if (!form || !submissions.length) { toast.error('No responses to export'); return; }
    const headers = ['Submitted At', ...(form.fields || []).map((f: any) => f.label)];
    const rows = (submissions as any[]).map(s => [
      new Date(s.submitted_at).toLocaleString('en-IN'),
      ...(form.fields || []).map((f: any) => getCellValue(s.responses, f.id)),
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title.toLowerCase().replace(/\s+/g, '-')}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [30, 64, 175];
  };

  const loadImageAsBase64 = (url: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject('No context'); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = url;
    });

  const exportPDF = async () => {
    if (!form || !submissions.length) { toast.error('No responses to export'); return; }

    const doc = new jsPDF('l', 'mm', 'a4');
    const pw = doc.internal.pageSize.width;
    const ph = doc.internal.pageSize.height;
    const headerText = form.settings?.header_text || 'AISA Club';
    const subheader = form.settings?.subheader || '';
    const footerText = form.settings?.footer_text || '';
    const logoUrl = form.settings?.logo_url || '';
    const headerHex = form.settings?.header_color || '#1e40af';
    const [r, g, b] = hexToRgb(headerHex);

    // Try loading logo
    let logoBase64: string | null = null;
    if (logoUrl) {
      try { logoBase64 = await loadImageAsBase64(logoUrl); } catch { /* skip */ }
    }

    const HEADER_H = subheader ? 24 : 20;

    const drawHeader = () => {
      // Coloured header band
      doc.setFillColor(r, g, b);
      doc.rect(0, 0, pw, HEADER_H, 'F');

      // Logo on the left
      if (logoBase64) {
        try { doc.addImage(logoBase64, 'PNG', 5, 2, HEADER_H - 4, HEADER_H - 4); }
        catch { /* skip if format unsupported */ }
      }

      const textX = logoBase64 ? pw / 2 + (HEADER_H / 2) : pw / 2;

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(headerText, textX, subheader ? 10 : 13, { align: 'center' });
      if (subheader) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(subheader, textX, 18, { align: 'center' });
      }

      // Form title below header
      doc.setTextColor(20, 20, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(form.title, pw / 2, HEADER_H + 9, { align: 'center' });

      if (form.description) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(form.description, pw / 2, HEADER_H + 15, { align: 'center' });
      }

      doc.setFontSize(7.5);
      doc.setTextColor(110, 110, 110);
      const statsY = HEADER_H + (form.description ? 21 : 15);
      doc.text(
        `Responses: ${submissions.length}  ·  Exported: ${new Date().toLocaleString('en-IN')}`,
        pw / 2, statsY, { align: 'center' }
      );
    };

    const drawFooter = (pageNum: number) => {
      const y = ph - 8;
      doc.setFontSize(7);
      doc.setTextColor(130, 130, 130);
      doc.setDrawColor(210, 210, 210);
      doc.line(10, y - 3, pw - 10, y - 3);

      // Footer left: logo (tiny) + text
      let footerX = 12;
      if (logoBase64) {
        try { doc.addImage(logoBase64, 'PNG', footerX, y - 5, 5, 5); footerX = 19; }
        catch { /* skip */ }
      }
      if (footerText) doc.text(footerText, footerX, y);
      doc.text(`Page ${pageNum}`, pw - 12, y, { align: 'right' });
    };

    drawHeader();

    const startY = HEADER_H + (form.description ? 26 : 20);
    const columns = ['#', 'Submitted', ...(form.fields || []).map((f: any) => f.label)];
    const rows = (submissions as any[]).map((s, i) => [
      i + 1,
      new Date(s.submitted_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      ...(form.fields || []).map((f: any) => {
        const v = getCellValue(s.responses, f.id);
        return String(v).length > 40 ? String(v).slice(0, 38) + '…' : String(v);
      }),
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY,
      margin: { left: 10, right: 10 },
      headStyles: { fillColor: [r, g, b], textColor: 255, fontSize: 7, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, cellPadding: 2 },
      alternateRowStyles: { fillColor: [248, 249, 255] },
      columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 28 } },
      didDrawPage: (data: any) => drawFooter(data.pageNumber),
    });

    doc.save(`${form.title.toLowerCase().replace(/\s+/g, '-')}-responses.pdf`);
    toast.success('PDF downloaded');
  };

  const filtered = filterSubmissions(submissions as any[]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Button variant="ghost" onClick={() => navigate('/admin/dashboard/forms')} className="gap-2 -ml-2 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Forms
          </Button>
          <h1 className="font-display text-2xl font-bold text-foreground">{form?.title}</h1>
          <p className="text-sm text-muted-foreground">
            {(submissions as any[]).length} response{(submissions as any[]).length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} className="gap-2" data-testid="button-export-csv">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={exportPDF} className="gap-2" data-testid="button-export-pdf">
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search responses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Inbox className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {search ? 'No responses match your search.' : 'No responses yet. Share the form link to start collecting.'}
          </p>
          {!search && form?.slug && (
            <p className="text-sm text-primary mt-2 font-mono">{window.location.origin}/form/{form.slug}</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">#</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">Submitted</th>
                {(form?.fields || []).map((field: any) => (
                  <th key={field.id} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap max-w-[180px]">
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((sub: any, i) => (
                <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                    {new Date(sub.submitted_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  {(form?.fields || []).map((field: any) => (
                    <td key={field.id} className="px-4 py-3 max-w-[180px]">
                      <span className="block truncate text-foreground">{getCellValue(sub.responses, field.id)}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FormResponsesPage;
