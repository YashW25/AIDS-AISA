-- Fix: Add theme_config column to site_settings table
-- Run this in Supabase SQL Editor if color saving fails

-- Step 1: Add column if missing
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS theme_config TEXT;

-- Step 2: Set default red theme for any rows that don't have one yet
UPDATE public.site_settings
SET theme_config = '{
  "global": {
    "primary":        "#dc2626",
    "secondary":      "#163562",
    "accent":         "#dc2626",
    "gold":           "#f0c142",
    "textPrimary":    "#0e1929",
    "textSecondary":  "#526176",
    "linkColor":      "#dc2626",
    "background":     "#fafafa",
    "card":           "#ffffff",
    "muted":          "#e8ecf0",
    "mutedForeground":"#526176",
    "border":         "#ced8e3",
    "gradientFrom":   "#1a0000",
    "gradientVia":    "#7f1d1d",
    "gradientTo":     "#dc2626"
  },
  "pages": {
    "home": {}, "about": {}, "events": {},
    "team": {}, "gallery": {}, "contact": {}
  }
}'
WHERE theme_config IS NULL OR theme_config = '';
