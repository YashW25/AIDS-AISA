-- Fix: Add theme_config column and FORCE update to red theme
-- Run this in Supabase SQL Editor to apply the red color theme permanently.
-- This will overwrite any previously saved theme in the database.

-- Step 1: Add column if it doesn't exist yet
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS theme_config TEXT;

-- Step 2: Force update ALL rows to the red theme
-- (No WHERE clause — overwrites any old theme that may be stored)
UPDATE public.site_settings
SET theme_config = '{
  "global": {
    "primary":         "#dc2626",
    "secondary":       "#163562",
    "accent":          "#dc2626",
    "gold":            "#f0c142",
    "textPrimary":     "#0e1929",
    "textSecondary":   "#526176",
    "linkColor":       "#dc2626",
    "background":      "#fafafa",
    "card":            "#ffffff",
    "muted":           "#e8ecf0",
    "mutedForeground": "#526176",
    "border":          "#ced8e3",
    "gradientFrom":    "#1a0000",
    "gradientVia":     "#7f1d1d",
    "gradientTo":      "#dc2626"
  },
  "pages": {
    "home": {}, "about": {}, "events": {},
    "team": {}, "gallery": {}, "contact": {}
  }
}';

-- Step 3: If the table was empty, insert a new row
INSERT INTO public.site_settings (theme_config)
SELECT '{
  "global": {
    "primary":         "#dc2626",
    "secondary":       "#163562",
    "accent":          "#dc2626",
    "gold":            "#f0c142",
    "textPrimary":     "#0e1929",
    "textSecondary":   "#526176",
    "linkColor":       "#dc2626",
    "background":      "#fafafa",
    "card":            "#ffffff",
    "muted":           "#e8ecf0",
    "mutedForeground": "#526176",
    "border":          "#ced8e3",
    "gradientFrom":    "#1a0000",
    "gradientVia":     "#7f1d1d",
    "gradientTo":      "#dc2626"
  },
  "pages": {
    "home": {}, "about": {}, "events": {},
    "team": {}, "gallery": {}, "contact": {}
  }
}'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);
