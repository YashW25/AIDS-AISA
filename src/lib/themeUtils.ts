export interface PageColors {
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  primary?: string;
}

export interface GlobalColors {
  primary: string;
  secondary: string;
  accent: string;
  gold: string;
  textPrimary: string;
  textSecondary: string;
  linkColor: string;
  background: string;
  card: string;
  muted: string;
  mutedForeground: string;
  border: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
}

export interface ThemeConfig {
  global: GlobalColors;
  pages: {
    home: PageColors;
    about: PageColors;
    events: PageColors;
    team: PageColors;
    gallery: PageColors;
    contact: PageColors;
    [key: string]: PageColors;
  };
}

export const DEFAULT_THEME: ThemeConfig = {
  global: {
    primary:        '#dc2626',   // red-600
    secondary:      '#163562',   // dark navy (contrast panels)
    accent:         '#dc2626',   // matches primary
    gold:           '#f0c142',   // awards / badges
    textPrimary:    '#0e1929',
    textSecondary:  '#526176',
    linkColor:      '#dc2626',
    background:     '#fafafa',
    card:           '#ffffff',
    muted:          '#e8ecf0',
    mutedForeground:'#526176',
    border:         '#ced8e3',
    gradientFrom:   '#1a0000',   // near-black red
    gradientVia:    '#7f1d1d',   // dark red
    gradientTo:     '#dc2626',   // vivid red
  },
  pages: {
    home:    {},
    about:   {},
    events:  {},
    team:    {},
    gallery: {},
    contact: {},
  },
};

export const THEME_STORAGE_KEY = 'aisa_theme_config_v2'; // bumped version clears old orange cache

export function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 50%';
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applyGlobalTheme(global: GlobalColors) {
  const root = document.documentElement;
  root.style.setProperty('--primary', hexToHsl(global.primary));
  root.style.setProperty('--primary-foreground', '0 0% 100%');
  root.style.setProperty('--secondary', hexToHsl(global.secondary));
  root.style.setProperty('--secondary-foreground', '0 0% 100%');
  root.style.setProperty('--accent', hexToHsl(global.accent));
  root.style.setProperty('--accent-foreground', '0 0% 100%');
  root.style.setProperty('--background', hexToHsl(global.background));
  root.style.setProperty('--foreground', hexToHsl(global.textPrimary));
  root.style.setProperty('--card', hexToHsl(global.card));
  root.style.setProperty('--card-foreground', hexToHsl(global.textPrimary));
  root.style.setProperty('--muted', hexToHsl(global.muted));
  root.style.setProperty('--muted-foreground', hexToHsl(global.mutedForeground));
  root.style.setProperty('--border', hexToHsl(global.border));
  root.style.setProperty('--input', hexToHsl(global.border));
  root.style.setProperty('--ring', hexToHsl(global.primary));
  root.style.setProperty('--gold', hexToHsl(global.gold));
  root.style.setProperty('--orange', hexToHsl(global.primary));
  root.style.setProperty('--navy', hexToHsl(global.secondary));
  root.style.setProperty('--sidebar-primary', hexToHsl(global.primary));
  root.style.setProperty('--sidebar-ring', hexToHsl(global.primary));
  root.style.setProperty('--club-primary', global.primary);
  root.style.setProperty('--club-secondary', global.secondary);
  root.style.setProperty('--club-gradient-from', global.gradientFrom);
  root.style.setProperty('--club-gradient-via', global.gradientVia);
  root.style.setProperty('--club-gradient-to', global.gradientTo);
}

export function applyPageTheme(page: PageColors, global: GlobalColors) {
  const root = document.documentElement;
  root.style.setProperty('--club-gradient-from', page.gradientFrom ?? global.gradientFrom);
  root.style.setProperty('--club-gradient-via', page.gradientVia ?? global.gradientVia);
  root.style.setProperty('--club-gradient-to', page.gradientTo ?? global.gradientTo);
  if (page.primary) {
    root.style.setProperty('--primary', hexToHsl(page.primary));
    root.style.setProperty('--accent', hexToHsl(page.primary));
    root.style.setProperty('--club-primary', page.primary);
    root.style.setProperty('--ring', hexToHsl(page.primary));
  } else {
    root.style.setProperty('--primary', hexToHsl(global.primary));
    root.style.setProperty('--accent', hexToHsl(global.accent));
    root.style.setProperty('--club-primary', global.primary);
    root.style.setProperty('--ring', hexToHsl(global.primary));
  }
}

export function getPageKey(pathname: string): keyof ThemeConfig['pages'] | null {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/events') || pathname.startsWith('/event')) return 'events';
  if (pathname.startsWith('/team')) return 'team';
  if (pathname.startsWith('/gallery')) return 'gallery';
  if (pathname.startsWith('/contact')) return 'contact';
  return null;
}

export function loadThemeFromStorage(): ThemeConfig {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ThemeConfig;
      return {
        global: { ...DEFAULT_THEME.global, ...parsed.global },
        pages: {
          home:    { ...DEFAULT_THEME.pages.home,    ...(parsed.pages?.home    || {}) },
          about:   { ...DEFAULT_THEME.pages.about,   ...(parsed.pages?.about   || {}) },
          events:  { ...DEFAULT_THEME.pages.events,  ...(parsed.pages?.events  || {}) },
          team:    { ...DEFAULT_THEME.pages.team,    ...(parsed.pages?.team    || {}) },
          gallery: { ...DEFAULT_THEME.pages.gallery, ...(parsed.pages?.gallery || {}) },
          contact: { ...DEFAULT_THEME.pages.contact, ...(parsed.pages?.contact || {}) },
        },
      };
    }
  } catch {}
  return DEFAULT_THEME;
}

export function saveThemeToStorage(theme: ThemeConfig) {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
}
