import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  ThemeConfig,
  applyGlobalTheme,
  applyPageTheme,
  getPageKey,
  loadThemeFromStorage,
  saveThemeToStorage,
} from '@/lib/themeUtils';

// Apply the right per-page gradient/accent on top of the global theme
function applyCurrentPageTheme(theme: ThemeConfig, pathname: string) {
  const pageKey = getPageKey(pathname);
  if (pageKey && theme.pages[pageKey] && Object.keys(theme.pages[pageKey]).length > 0) {
    applyPageTheme(theme.pages[pageKey], theme.global);
  } else {
    // Reset to global gradient when no page override
    applyGlobalTheme(theme.global);
  }
}

// ─── ThemeProvider ────────────────────────────────────────────────────────────
// Lives OUTSIDE BrowserRouter — loads theme from DB/localStorage on mount.
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { data: dbTheme } = useQuery({
    queryKey: ['site-settings-theme'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('site_settings')
        .select('theme_config')
        .limit(1)
        .maybeSingle();
      if (error || !data?.theme_config) return null;
      try {
        return JSON.parse(data.theme_config) as ThemeConfig;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  // On initial mount apply whatever is in localStorage immediately
  useEffect(() => {
    const theme = loadThemeFromStorage();
    applyGlobalTheme(theme.global);
    applyCurrentPageTheme(theme, window.location.pathname);
  }, []);

  // When DB data arrives, merge it with defaults, persist to localStorage, apply
  useEffect(() => {
    if (!dbTheme) return;
    const merged: ThemeConfig = {
      global: { ...DEFAULT_THEME.global, ...dbTheme.global },
      pages: {
        home:    { ...DEFAULT_THEME.pages.home,    ...(dbTheme.pages?.home    || {}) },
        about:   { ...DEFAULT_THEME.pages.about,   ...(dbTheme.pages?.about   || {}) },
        events:  { ...DEFAULT_THEME.pages.events,  ...(dbTheme.pages?.events  || {}) },
        team:    { ...DEFAULT_THEME.pages.team,    ...(dbTheme.pages?.team    || {}) },
        gallery: { ...DEFAULT_THEME.pages.gallery, ...(dbTheme.pages?.gallery || {}) },
        contact: { ...DEFAULT_THEME.pages.contact, ...(dbTheme.pages?.contact || {}) },
      },
    };
    saveThemeToStorage(merged);
    window.dispatchEvent(new CustomEvent('aisa-theme-change', { detail: merged }));
  }, [dbTheme]);

  // Cross-tab sync (storage event only fires in OTHER tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as ThemeConfig;
          applyGlobalTheme(parsed.global);
          applyCurrentPageTheme(parsed, window.location.pathname);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return <>{children}</>;
};

// ─── ThemeRouteSync ───────────────────────────────────────────────────────────
// Must be placed INSIDE <BrowserRouter> in App.tsx.
// Uses useLocation() — the only reliable way to react to React Router navigation.
// Re-applies the correct theme colors whenever the route changes.
export const ThemeRouteSync = () => {
  const location = useLocation();

  useEffect(() => {
    // Always read fresh from localStorage so saved themes apply immediately
    const theme = loadThemeFromStorage();
    applyGlobalTheme(theme.global);
    applyCurrentPageTheme(theme, location.pathname);
  }, [location.pathname]);

  // Same-tab sync: fires when ThemeSettingsPage saves a new theme
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const parsed = (e as CustomEvent<ThemeConfig>).detail;
      if (parsed) {
        applyGlobalTheme(parsed.global);
        applyCurrentPageTheme(parsed, location.pathname);
      }
    };
    window.addEventListener('aisa-theme-change', handleThemeChange);
    return () => window.removeEventListener('aisa-theme-change', handleThemeChange);
  }, [location.pathname]);

  return null;
};
