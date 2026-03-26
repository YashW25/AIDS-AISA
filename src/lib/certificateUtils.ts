export interface FieldDef {
  key: string;
  label: string;
  x: number;
  y: number;
  fontSize: number;
  fontColor: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  align: 'left' | 'center' | 'right';
  fontFamily: string;
}

export const DEFAULT_FIELD: FieldDef = {
  key: 'full_name',
  label: 'Recipient Name',
  x: 50,
  y: 50,
  fontSize: 36,
  fontColor: '#1a1a1a',
  fontWeight: 'bold',
  fontStyle: 'normal',
  align: 'center',
  fontFamily: 'Arial',
};

export const STANDARD_FIELDS = [
  { key: 'full_name', label: 'Recipient Name' },
  { key: 'event_name', label: 'Event Name' },
  { key: 'event_date', label: 'Event Date' },
  { key: 'certificate_id', label: 'Certificate ID' },
  { key: 'college', label: 'College' },
  { key: 'project_title', label: 'Project Title' },
  { key: 'position', label: 'Position / Rank' },
  { key: 'team_id', label: 'Team ID' },
  { key: 'issued_by', label: 'Issued By' },
  { key: 'email', label: 'Email' },
];

export const FONT_FAMILIES = [
  'Arial',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Palatino',
  'Garamond',
  'Courier New',
];

// ─── CSV Parsing ──────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += line[i];
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

export function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1)
    .map(line => {
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ''; });
      return row;
    })
    .filter(row => Object.values(row).some(v => v.trim()));
  return { headers, rows };
}

// Map CSV column headers to our standard field keys (fuzzy match)
export function guessFieldMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const norm = (s: string) => s.toLowerCase().replace(/[\s_\-]/g, '');
  const matchers: [string, string[]][] = [
    ['full_name',     ['fullname', 'name', 'participantname', 'studentname', 'membername']],
    ['certificate_id',['certificateid', 'certid', 'certno', 'certificateno', 'id']],
    ['email',         ['email', 'emailid', 'emailaddress', 'mail']],
    ['college',       ['college', 'institution', 'university', 'school', 'collegename']],
    ['project_title', ['projecttitle', 'project', 'projectname', 'title']],
    ['position',      ['position', 'rank', 'achievement', 'award']],
    ['team_id',       ['teamid', 'team', 'teamno', 'teamnumber']],
  ];
  for (const h of headers) {
    const n = norm(h);
    for (const [key, aliases] of matchers) {
      if (aliases.includes(n) && !mapping[key]) {
        mapping[h] = key;
        break;
      }
    }
  }
  return mapping;
}

// ─── Certificate ID Generation ────────────────────────────────────────────────

export function generateCertId(prefix: string, index: number): string {
  const padded = String(index).padStart(4, '0');
  return `${prefix.trim()}-${padded}`;
}

// ─── Canvas-based Certificate Rendering ──────────────────────────────────────

export async function renderCertificate(
  templateUrl: string,
  fields: FieldDef[],
  data: Record<string, string>,
): Promise<Blob> {
  // Fetch image as blob to avoid CORS taint
  const response = await fetch(templateUrl);
  if (!response.ok) throw new Error('Failed to fetch template image');
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        for (const field of fields) {
          const value = data[field.key];
          if (!value) continue;
          const weight = field.fontWeight === 'bold' ? 'bold' : 'normal';
          const style = field.fontStyle === 'italic' ? 'italic' : 'normal';
          ctx.font = `${style} ${weight} ${field.fontSize}px "${field.fontFamily || 'Arial'}"`;
          ctx.fillStyle = field.fontColor || '#000000';
          ctx.textAlign = (field.align || 'center') as CanvasTextAlign;
          ctx.textBaseline = 'middle';
          const x = (field.x / 100) * canvas.width;
          const y = (field.y / 100) * canvas.height;
          ctx.fillText(value, x, y);
        }

        URL.revokeObjectURL(objectUrl);
        canvas.toBlob(b => {
          if (b) resolve(b);
          else reject(new Error('Canvas toBlob returned null'));
        }, 'image/png');
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load template image'));
    };
    img.src = objectUrl;
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
