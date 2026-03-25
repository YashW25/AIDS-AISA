import { useState, useEffect, useCallback } from 'react';
import { Palette, RefreshCw, Save, RotateCcw, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DEFAULT_THEME,
  ThemeConfig,
  GlobalColors,
  PageColors,
  applyGlobalTheme,
  loadThemeFromStorage,
  saveThemeToStorage,
} from '@/lib/themeUtils';

const PAGE_LABELS: Record<string, string> = {
  home: 'Home',
  about: 'About',
  events: 'Events',
  team: 'Team',
  gallery: 'Gallery',
  contact: 'Contact',
};

interface ColorPickerProps {
  label: string;
  description?: string;
  value: string;
  onChange: (v: string) => void;
  testId?: string;
}

function ColorPicker({ label, description, value, onChange, testId }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-10 rounded-lg border-2 border-white shadow-md cursor-pointer overflow-hidden"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            data-testid={testId}
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-foreground">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
        <div className="text-xs font-mono text-muted-foreground mt-1">{value.toUpperCase()}</div>
      </div>
    </div>
  );
}

function GradientPreview({ from, via, to }: { from: string; via: string; to: string }) {
  return (
    <div
      className="h-12 rounded-lg w-full border border-border"
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${via} 50%, ${to} 100%)` }}
    />
  );
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 h-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: color }} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function ThemeSettingsPage() {
  const queryClient = useQueryClient();

  const { data: dbData } = useQuery({
    queryKey: ['site-settings-theme'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('site_settings')
        .select('id, theme_config')
        .limit(1)
        .maybeSingle();
      if (error) { console.error(error); return null; }
      return data;
    },
  });

  const [localTheme, setLocalTheme] = useState<ThemeConfig>(loadThemeFromStorage);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [previewActive, setPreviewActive] = useState(true);

  useEffect(() => {
    if (dbData?.theme_config) {
      try {
        const parsed = JSON.parse(dbData.theme_config) as ThemeConfig;
        const merged: ThemeConfig = {
          global: { ...DEFAULT_THEME.global, ...parsed.global },
          pages: {
            home: { ...DEFAULT_THEME.pages.home, ...(parsed.pages?.home || {}) },
            about: { ...DEFAULT_THEME.pages.about, ...(parsed.pages?.about || {}) },
            events: { ...DEFAULT_THEME.pages.events, ...(parsed.pages?.events || {}) },
            team: { ...DEFAULT_THEME.pages.team, ...(parsed.pages?.team || {}) },
            gallery: { ...DEFAULT_THEME.pages.gallery, ...(parsed.pages?.gallery || {}) },
            contact: { ...DEFAULT_THEME.pages.contact, ...(parsed.pages?.contact || {}) },
          },
        };
        setLocalTheme(merged);
      } catch {}
    }
  }, [dbData]);

  const applyPreview = useCallback((theme: ThemeConfig) => {
    if (!previewActive) return;
    applyGlobalTheme(theme.global);
  }, [previewActive]);

  const updateGlobal = (key: keyof GlobalColors, value: string) => {
    setLocalTheme(prev => {
      const next = { ...prev, global: { ...prev.global, [key]: value } };
      applyPreview(next);
      setHasUnsaved(true);
      return next;
    });
  };

  const updatePage = (page: string, key: keyof PageColors, value: string) => {
    setLocalTheme(prev => {
      const next = {
        ...prev,
        pages: { ...prev.pages, [page]: { ...prev.pages[page], [key]: value } },
      };
      setHasUnsaved(true);
      return next;
    });
  };

  const clearPageOverride = (page: string, key: keyof PageColors) => {
    setLocalTheme(prev => {
      const pageData = { ...prev.pages[page] };
      delete pageData[key];
      const next = { ...prev, pages: { ...prev.pages, [page]: pageData } };
      setHasUnsaved(true);
      return next;
    });
  };

  const resetToDefaults = () => {
    setLocalTheme(DEFAULT_THEME);
    applyGlobalTheme(DEFAULT_THEME.global);
    setHasUnsaved(true);
  };

  const discardChanges = () => {
    const stored = loadThemeFromStorage();
    setLocalTheme(stored);
    applyGlobalTheme(stored.global);
    setHasUnsaved(false);
  };

  const saveMutation = useMutation({
    mutationFn: async (theme: ThemeConfig) => {
      const themeJson = JSON.stringify(theme);
      if (dbData?.id) {
        const { error } = await (supabase as any)
          .from('site_settings')
          .update({ theme_config: themeJson })
          .eq('id', dbData.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('site_settings')
          .insert({ theme_config: themeJson });
        if (error) throw error;
      }
      saveThemeToStorage(theme);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings-theme'] });
      toast.success('Color theme saved successfully!');
      setHasUnsaved(false);
      setShowConfirm(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save theme. Running fix SQL might be needed.');
      setShowConfirm(false);
    },
  });

  const handleSaveConfirm = () => {
    saveMutation.mutate(localTheme);
  };

  const g = localTheme.global;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
            <Palette className="h-7 w-7" style={{ color: g.primary }} />
            Color Schema
          </h1>
          <p className="text-muted-foreground">Customize colors for your entire website and individual pages</p>
        </div>
        {hasUnsaved && (
          <Badge variant="outline" className="self-start sm:self-auto border-orange-300 text-orange-600 bg-orange-50">
            Unsaved changes
          </Badge>
        )}
      </div>

      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Live Preview
          </span>
          <button
            onClick={() => setPreviewActive(p => !p)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${previewActive ? 'bg-green-50 border-green-300 text-green-700' : 'bg-muted border-border text-muted-foreground'}`}
            data-testid="toggle-preview"
          >
            {previewActive ? 'Active' : 'Paused'}
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <ColorSwatch color={g.primary} label="Primary" />
          <ColorSwatch color={g.secondary} label="Secondary" />
          <ColorSwatch color={g.accent} label="Accent" />
          <ColorSwatch color={g.gold} label="Gold" />
          <ColorSwatch color={g.background} label="BG" />
          <ColorSwatch color={g.card} label="Card" />
          <ColorSwatch color={g.textPrimary} label="Text" />
          <ColorSwatch color={g.muted} label="Muted" />
          <ColorSwatch color={g.border} label="Border" />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Global Gradient</p>
          <GradientPreview from={g.gradientFrom} via={g.gradientVia} to={g.gradientTo} />
        </div>
      </div>

      <Tabs defaultValue="global">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="global" data-testid="tab-global">Global Colors</TabsTrigger>
          {Object.keys(PAGE_LABELS).map(page => (
            <TabsTrigger key={page} value={page} data-testid={`tab-${page}`}>
              {PAGE_LABELS[page]}
              {Object.keys(localTheme.pages[page] || {}).length > 0 && (
                <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-orange-400 inline-block" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="global" className="mt-6 space-y-6">
          <div className="p-5 rounded-xl border border-border bg-card space-y-4">
            <h3 className="font-semibold text-foreground">Brand Colors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ColorPicker label="Primary Color" description="Main buttons, links, accents" value={g.primary} onChange={v => updateGlobal('primary', v)} testId="color-primary" />
              <ColorPicker label="Secondary Color" description="Dark panels, navy sections" value={g.secondary} onChange={v => updateGlobal('secondary', v)} testId="color-secondary" />
              <ColorPicker label="Accent Color" description="Highlights, selected states" value={g.accent} onChange={v => updateGlobal('accent', v)} testId="color-accent" />
              <ColorPicker label="Gold / Highlight" description="Special badges, awards" value={g.gold} onChange={v => updateGlobal('gold', v)} testId="color-gold" />
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card space-y-4">
            <h3 className="font-semibold text-foreground">Text Colors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ColorPicker label="Primary Text" description="Main body text and headings" value={g.textPrimary} onChange={v => updateGlobal('textPrimary', v)} testId="color-text-primary" />
              <ColorPicker label="Secondary Text" description="Subtitles, captions" value={g.textSecondary} onChange={v => updateGlobal('textSecondary', v)} testId="color-text-secondary" />
              <ColorPicker label="Link Color" description="Clickable links" value={g.linkColor} onChange={v => updateGlobal('linkColor', v)} testId="color-link" />
              <ColorPicker label="Muted Text" description="Placeholders, hints" value={g.mutedForeground} onChange={v => updateGlobal('mutedForeground', v)} testId="color-muted-foreground" />
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card space-y-4">
            <h3 className="font-semibold text-foreground">Background & Surface Colors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ColorPicker label="Page Background" description="Main page background" value={g.background} onChange={v => updateGlobal('background', v)} testId="color-background" />
              <ColorPicker label="Card Background" description="Cards, modals, dropdowns" value={g.card} onChange={v => updateGlobal('card', v)} testId="color-card" />
              <ColorPicker label="Muted Background" description="Input fields, subtle sections" value={g.muted} onChange={v => updateGlobal('muted', v)} testId="color-muted" />
              <ColorPicker label="Border Color" description="Dividers, input borders" value={g.border} onChange={v => updateGlobal('border', v)} testId="color-border" />
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card space-y-4">
            <h3 className="font-semibold text-foreground">Global Gradient</h3>
            <p className="text-sm text-muted-foreground">Used in hero sections and dark overlays across the site</p>
            <GradientPreview from={g.gradientFrom} via={g.gradientVia} to={g.gradientTo} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ColorPicker label="Gradient Start" description="Left / dark start" value={g.gradientFrom} onChange={v => updateGlobal('gradientFrom', v)} testId="color-gradient-from" />
              <ColorPicker label="Gradient Middle" description="Center transition" value={g.gradientVia} onChange={v => updateGlobal('gradientVia', v)} testId="color-gradient-via" />
              <ColorPicker label="Gradient End" description="Right / light end" value={g.gradientTo} onChange={v => updateGlobal('gradientTo', v)} testId="color-gradient-to" />
            </div>
          </div>
        </TabsContent>

        {Object.keys(PAGE_LABELS).map(page => {
          const pg = localTheme.pages[page] || {};
          const hasOverrides = Object.keys(pg).length > 0;
          return (
            <TabsContent key={page} value={page} className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{PAGE_LABELS[page]} Page Colors</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Override specific colors for the {PAGE_LABELS[page].toLowerCase()} page. Leave blank to use global settings.
                  </p>
                </div>
                {hasOverrides && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLocalTheme(prev => ({ ...prev, pages: { ...prev.pages, [page]: {} } }));
                      setHasUnsaved(true);
                    }}
                    data-testid={`reset-page-${page}`}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Reset to Global
                  </Button>
                )}
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                <h4 className="font-medium text-foreground">Hero Gradient</h4>
                <p className="text-xs text-muted-foreground">Controls the gradient behind the page hero / banner section</p>
                <GradientPreview
                  from={pg.gradientFrom ?? g.gradientFrom}
                  via={pg.gradientVia ?? g.gradientVia}
                  to={pg.gradientTo ?? g.gradientTo}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PageColorPicker
                    label="Gradient Start"
                    value={pg.gradientFrom}
                    globalValue={g.gradientFrom}
                    onChange={v => updatePage(page, 'gradientFrom', v)}
                    onClear={() => clearPageOverride(page, 'gradientFrom')}
                    testId={`${page}-gradient-from`}
                  />
                  <PageColorPicker
                    label="Gradient Middle"
                    value={pg.gradientVia}
                    globalValue={g.gradientVia}
                    onChange={v => updatePage(page, 'gradientVia', v)}
                    onClear={() => clearPageOverride(page, 'gradientVia')}
                    testId={`${page}-gradient-via`}
                  />
                  <PageColorPicker
                    label="Gradient End"
                    value={pg.gradientTo}
                    globalValue={g.gradientTo}
                    onChange={v => updatePage(page, 'gradientTo', v)}
                    onClear={() => clearPageOverride(page, 'gradientTo')}
                    testId={`${page}-gradient-to`}
                  />
                </div>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                <h4 className="font-medium text-foreground">Page Accent Color</h4>
                <p className="text-xs text-muted-foreground">Overrides the primary/accent color for this page only (buttons, highlights)</p>
                <PageColorPicker
                  label="Primary Accent"
                  value={pg.primary}
                  globalValue={g.primary}
                  onChange={v => updatePage(page, 'primary', v)}
                  onClear={() => clearPageOverride(page, 'primary')}
                  testId={`${page}-primary`}
                />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults} size="sm" data-testid="btn-reset-defaults">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Reset All to Defaults
          </Button>
          {hasUnsaved && (
            <Button variant="ghost" onClick={discardChanges} size="sm" data-testid="btn-discard">
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Discard Changes
            </Button>
          )}
        </div>
        <Button
          onClick={() => setShowConfirm(true)}
          disabled={!hasUnsaved || saveMutation.isPending}
          size="lg"
          data-testid="btn-save-theme"
          style={{ backgroundColor: g.primary }}
          className="text-white"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Color Changes
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" style={{ color: g.primary }} />
              Save Color Theme?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will update the color scheme across your entire website. All visitors will see the new colors immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-4">
            <p className="text-sm font-medium text-foreground">New color preview:</p>
            <div className="flex flex-wrap gap-2">
              <ColorSwatch color={g.primary} label="Primary" />
              <ColorSwatch color={g.secondary} label="Secondary" />
              <ColorSwatch color={g.accent} label="Accent" />
              <ColorSwatch color={g.gold} label="Gold" />
              <ColorSwatch color={g.background} label="BG" />
              <ColorSwatch color={g.card} label="Card" />
              <ColorSwatch color={g.textPrimary} label="Text" />
              <ColorSwatch color={g.border} label="Border" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Global gradient:</p>
              <GradientPreview from={g.gradientFrom} via={g.gradientVia} to={g.gradientTo} />
            </div>

            {Object.entries(localTheme.pages).some(([, v]) => Object.keys(v).length > 0) && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Per-page overrides: </span>
                {Object.entries(localTheme.pages)
                  .filter(([, v]) => Object.keys(v).length > 0)
                  .map(([k]) => PAGE_LABELS[k])
                  .join(', ')}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel data-testid="confirm-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveConfirm}
              disabled={saveMutation.isPending}
              data-testid="confirm-save"
              style={{ backgroundColor: g.primary }}
              className="text-white"
            >
              {saveMutation.isPending ? (
                'Saving...'
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Yes, Save Changes
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface PageColorPickerProps {
  label: string;
  value?: string;
  globalValue: string;
  onChange: (v: string) => void;
  onClear: () => void;
  testId?: string;
}

function PageColorPicker({ label, value, globalValue, onChange, onClear, testId }: PageColorPickerProps) {
  const isOverridden = !!value;
  const displayValue = value ?? globalValue;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {isOverridden ? (
          <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 bg-orange-50 py-0 h-4">Custom</Badge>
        ) : (
          <Badge variant="outline" className="text-xs py-0 h-4 text-muted-foreground">Global</Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-lg border-2 border-white shadow-md cursor-pointer overflow-hidden"
            style={{ backgroundColor: displayValue }}
          >
            <input
              type="color"
              value={displayValue}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              data-testid={testId}
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="text-xs font-mono text-muted-foreground">{displayValue.toUpperCase()}</div>
          {isOverridden && (
            <button onClick={onClear} className="text-xs text-muted-foreground hover:text-destructive mt-0.5 underline underline-offset-2">
              Use global
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
