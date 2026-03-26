-- AISA Certificate System - New Tables
-- Run this in Supabase SQL Editor

-- 1. Certificate Templates (image-based with field positions)
CREATE TABLE IF NOT EXISTS cert_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_url  TEXT NOT NULL,
  fields        JSONB NOT NULL DEFAULT '[]',
  issued_by     TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Certificate Issuances
CREATE TABLE IF NOT EXISTS cert_issuances (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id TEXT NOT NULL UNIQUE,
  template_id    UUID REFERENCES cert_templates(id) ON DELETE SET NULL,
  event_name     TEXT NOT NULL DEFAULT '',
  event_date     TEXT DEFAULT '',
  full_name      TEXT NOT NULL DEFAULT '',
  email          TEXT DEFAULT '',
  college        TEXT DEFAULT '',
  project_title  TEXT DEFAULT '',
  position       TEXT DEFAULT '',
  team_id        TEXT DEFAULT '',
  extra_fields   JSONB DEFAULT '{}',
  issued_at      TIMESTAMPTZ DEFAULT NOW(),
  is_active      BOOLEAN DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE cert_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cert_issuances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cert_templates
DROP POLICY IF EXISTS "Public can read cert_templates" ON cert_templates;
CREATE POLICY "Public can read cert_templates" ON cert_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can manage cert_templates" ON cert_templates;
CREATE POLICY "Authenticated can manage cert_templates" ON cert_templates FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for cert_issuances
DROP POLICY IF EXISTS "Public can read active cert_issuances" ON cert_issuances;
CREATE POLICY "Public can read active cert_issuances" ON cert_issuances FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated can manage cert_issuances" ON cert_issuances;
CREATE POLICY "Authenticated can manage cert_issuances" ON cert_issuances FOR ALL USING (auth.role() = 'authenticated');
