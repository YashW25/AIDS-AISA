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

  const getImgFormat = (dataUrl: string): string => {
    if (dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg')) return 'JPEG';
    if (dataUrl.includes('image/gif')) return 'GIF';
    return 'PNG';
  };

  const exportPDF = async () => {
    if (!form || !submissions.length) { toast.error('No responses to export'); return; }

    // ── Settings ──────────────────────────────────────────────────────────
    const orgName       = form.settings?.org_name       || '';
    const headerText    = form.settings?.header_text    || '';
    const affiliationText = form.settings?.subheader    || '';
    const logoUrl       = form.settings?.logo_url       || '';
    const logoUrlRight  = form.settings?.logo_url_right || '';
    const accentHex     = form.settings?.accent_color   || form.settings?.header_color || '#dc2626';
    const footerEmail   = form.settings?.footer_email   || '';
    const footerWebsite = form.settings?.footer_website || '';
    const footerPhone   = form.settings?.footer_phone   || '';
    const [r, g, b]     = hexToRgb(accentHex);

    // ── Load logos ────────────────────────────────────────────────────────
    let logoLeft:  string | null = null;
    let logoRight: string | null = null;
    if (logoUrl)      try { logoLeft  = await loadImageAsBase64(logoUrl);      } catch { /* skip */ }
    if (logoUrlRight) try { logoRight = await loadImageAsBase64(logoUrlRight); } catch { /* skip */ }

    // ── Doc setup ─────────────────────────────────────────────────────────
    const doc = new jsPDF('p', 'mm', 'a4');   // portrait A4
    const pw  = doc.internal.pageSize.width;   // 210 mm
    const ph  = doc.internal.pageSize.height;  // 297 mm
    const LM  = 15;   // left margin
    const RM  = pw - 15; // right margin (195)
    const CW  = RM - LM; // content width (180)
    const CX  = pw / 2;  // centre x (105)

    // ── Fixed Y positions ─────────────────────────────────────────────────
    const LOGO_Y     = 8;
    const LOGO_SIZE  = 22;
    const DIVIDER_Y  = 35;   // red accent line
    const TITLE_Y    = DIVIDER_Y + 9;
    const SUBTITLE_Y = DIVIDER_Y + 17;
    const STATS_Y    = DIVIDER_Y + 24;  // top of stats box
    const STATS_H    = 9;
    const TABLE_Y    = STATS_Y + STATS_H + 3;
    const MARGIN_TOP_P2 = DIVIDER_Y + 24; // page 2+ table start (no stats box)
    const FOOTER_LINE_Y = ph - 16;
    const FOOTER_TEXT_Y = ph - 10;

    // ── drawHeader: white letterhead top, red divider, title block ────────
    const drawHeader = () => {
      // White background for logo/text area
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pw, DIVIDER_Y, 'F');

      // Left logo
      if (logoLeft) {
        try { doc.addImage(logoLeft, getImgFormat(logoLeft), LM, LOGO_Y, LOGO_SIZE, LOGO_SIZE); } catch { /* skip */ }
      }
      // Right logo
      if (logoRight) {
        try { doc.addImage(logoRight, getImgFormat(logoRight), RM - LOGO_SIZE, LOGO_Y, LOGO_SIZE, LOGO_SIZE); } catch { /* skip */ }
      }

      // Centre institution text
      let ty = 12;
      if (orgName) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        doc.text(orgName.toUpperCase(), CX, ty, { align: 'center' });
        ty += 5.5;
      }
      if (headerText) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(15, 15, 15);
        doc.text(headerText.toUpperCase(), CX, ty, { align: 'center' });
        ty += 5;
      }
      if (affiliationText) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(90, 90, 90);
        const lines = doc.splitTextToSize(affiliationText, 130);
        doc.text(lines, CX, ty, { align: 'center' });
      }

      // Red accent divider line
      doc.setFillColor(r, g, b);
      doc.rect(0, DIVIDER_Y, pw, 1.5, 'F');

      // Form title (coloured, uppercase)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(r, g, b);
      doc.text(form.title.toUpperCase(), CX, TITLE_Y, { align: 'center' });

      // Report subtitle
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);
      doc.text('FORM RESPONSES REPORT', CX, SUBTITLE_Y, { align: 'center' });
    };

    // ── drawFooter ────────────────────────────────────────────────────────
    const drawFooter = (pageNum: number) => {
      // Accent colour footer line
      doc.setFillColor(r, g, b);
      doc.rect(0, FOOTER_LINE_Y, pw, 1, 'F');

      // Contact info centred
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      const parts: string[] = [];
      if (footerEmail)   parts.push(`Email: ${footerEmail}`);
      if (footerWebsite) parts.push(`Website: ${footerWebsite}`);
      if (footerPhone)   parts.push(`Phone: ${footerPhone}`);
      if (parts.length) {
        doc.text(parts.join('   |   '), CX, FOOTER_TEXT_Y, { align: 'center' });
      }
      // Page number right-aligned
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${pageNum}`, RM, FOOTER_TEXT_Y, { align: 'right' });
    };

    // ── Page 1 header + stats box ─────────────────────────────────────────
    drawHeader();

    // Stats box
    doc.setDrawColor(180, 180, 180);
    doc.setFillColor(248, 248, 248);
    doc.rect(LM, STATS_Y, CW, STATS_H, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    const exportDate = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    doc.text(
      `Total: ${submissions.length} ${submissions.length === 1 ? 'response' : 'responses'}   |   Exported: ${exportDate}`,
      LM + 4, STATS_Y + 6
    );

    // ── Table ─────────────────────────────────────────────────────────────
    const columns = ['#', 'Submitted', ...(form.fields || []).map((f: any) => f.label)];
    const rows = (submissions as any[]).map((s, i) => [
      i + 1,
      new Date(s.submitted_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      ...(form.fields || []).map((f: any) => {
        const v = getCellValue(s.responses, f.id);
        const str = String(v ?? '');
        return str.length > 60 ? str.slice(0, 58) + '…' : str;
      }),
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: TABLE_Y,
      margin: { top: MARGIN_TOP_P2, left: LM, right: LM, bottom: 22 },
      headStyles: {
        fillColor: [r, g, b],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        lineColor: [r, g, b],
        lineWidth: 0.3,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2.8,
        lineColor: [180, 180, 180],
        lineWidth: 0.3,
        textColor: [30, 30, 30],
      },
      tableLineColor: [180, 180, 180],
      tableLineWidth: 0.3,
      alternateRowStyles: { fillColor: [255, 255, 255] },
      columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 1: { cellWidth: 30 } },
      didDrawPage: (data: any) => {
        if (data.pageNumber > 1) drawHeader();
        drawFooter(data.pageNumber);
      },
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
