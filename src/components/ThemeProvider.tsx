import { useEffect, useRef, type ReactNode } from 'react';
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

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const themeRef = useRef<ThemeConfig>(loadThemeFromStorage());

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
        const parsed = JSON.parse(data.theme_config) as ThemeConfig;
        return parsed;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (dbTheme) {
      const merged: ThemeConfig = {
        global: { ...DEFAULT_THEME.global, ...dbTheme.global },
        pages: {
          home: { ...DEFAULT_THEME.pages.home, ...(dbTheme.pages?.home || {}) },
          about: { ...DEFAULT_THEME.pages.about, ...(dbTheme.pages?.about || {}) },
          events: { ...DEFAULT_THEME.pages.events, ...(dbTheme.pages?.events || {}) },
          team: { ...DEFAULT_THEME.pages.team, ...(dbTheme.pages?.team || {}) },
          gallery: { ...DEFAULT_THEME.pages.gallery, ...(dbTheme.pages?.gallery || {}) },
          contact: { ...DEFAULT_THEME.pages.contact, ...(dbTheme.pages?.contact || {}) },
        },
      };
      themeRef.current = merged;
      saveThemeToStorage(merged);
      applyGlobalTheme(merged.global);
      applyCurrentPageTheme(merged);
    }
  }, [dbTheme]);

  useEffect(() => {
    const theme = themeRef.current;
    applyGlobalTheme(theme.global);
    applyCurrentPageTheme(theme);

    // Always read fresh from localStorage on route change so saved themes apply instantly
    const handleRouteChange = () => {
      const t = loadThemeFromStorage();
      themeRef.current = t;
      applyGlobalTheme(t.global);
      applyCurrentPageTheme(t);
    };

    window.addEventListener('popstate', handleRouteChange);

    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      originalPushState(...args);
      setTimeout(handleRouteChange, 0);
    };
    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      originalReplaceState(...args);
      setTimeout(handleRouteChange, 0);
    };

    // Cross-tab sync via storage event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as ThemeConfig;
          themeRef.current = parsed;
          applyGlobalTheme(parsed.global);
          applyCurrentPageTheme(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Same-tab sync: ThemeSettingsPage dispatches this event after saving
    const handleThemeChange = (e: Event) => {
      const parsed = (e as CustomEvent<ThemeConfig>).detail;
      if (parsed) {
        themeRef.current = parsed;
        applyGlobalTheme(parsed.global);
        applyCurrentPageTheme(parsed);
      }
    };
    window.addEventListener('aisa-theme-change', handleThemeChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('aisa-theme-change', handleThemeChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return <>{children}</>;
};

function applyCurrentPageTheme(theme: ThemeConfig) {
  const pageKey = getPageKey(window.location.pathname);
  if (pageKey && theme.pages[pageKey]) {
    applyPageTheme(theme.pages[pageKey], theme.global);
  }
}
