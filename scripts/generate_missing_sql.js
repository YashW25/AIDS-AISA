import fs from 'fs';
import path from 'path';

const root = path.join('y:', 'AIDS AISA', 'AIDS AISA');
const inPath = path.join(root, 'supabase', 'setup_remaining_tables.sql');
const outPath = path.join(root, 'supabase', '00000000000001_missing_admin_tables.sql');

const sql = fs.readFileSync(inPath, 'utf8');

// The tables that ALREADY existed in the user's DB via complete_setup.sql
const existingTables = [
  'clubs', 'club_admins', 'user_roles', 'user_profiles', 'announcements', 
  'events', 'team_members', 'gallery', 'quick_links', 'contact_submissions', 
  'event_registrations', 'payments'
];

let safeSql = '-- Safe Idempotent SQL Setup for Missing Admin Tables --\n\n';

// Make all table creations idempotent
let processed = sql.replace(/CREATE TABLE public\.([a-z_]+)/g, (match, tableName) => {
  return `CREATE TABLE IF NOT EXISTS public.${tableName}`;
});

// Drop lines that try to recreate existing tables explicitly? No, IF NOT EXISTS handles it.
// The issue is CREATE POLICY which throws an error if it exists.
// We wrap all policy creations in a safe DO block function or just regex replace them.
processed = processed.replace(/CREATE POLICY "([^"]+)" ON public\.([a-z_]+) FOR ([A-Z]+) (USING|WITH CHECK) \(([^;]+)\);/g, (match, name, table, action, verb, logic) => {
  return `
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policename = '${name}' AND tablename = '${table}'
    ) THEN
        CREATE POLICY "${name}" ON public.${table} FOR ${action} ${verb} (${logic});
    END IF;
END
$$;`;
});

// For update policies with both USING and WITH CHECK
processed = processed.replace(/CREATE POLICY "([^"]+)" ON public\.([a-z_]+) FOR ALL USING \((.*?)\) WITH CHECK \((.*?)\);/g, (match, name, table, using, check) => {
  return `
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policename = '${name}' AND tablename = '${table}'
    ) THEN
        CREATE POLICY "${name}" ON public.${table} FOR ALL USING (${using}) WITH CHECK (${check});
    END IF;
END
$$;`;
});

// Same for ADD COLUMN
processed = processed.replace(/ALTER TABLE public\.([a-z_]+) ADD COLUMN ([^;]+);/g, (match, table, colDef) => {
  return `ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS ${colDef};`;
});

// Drop triggers before recreation
processed = processed.replace(/CREATE TRIGGER (\w+) (BEFORE|AFTER) (INSERT|UPDATE|DELETE) ON public\.([a-z_]+) FOR EACH ROW EXECUTE FUNCTION ([\w_\(\)]+);/ig, (match, trName, timing, evt, tbl, func) => {
  return `DROP TRIGGER IF EXISTS ${trName} ON public.${tbl};\nCREATE TRIGGER ${trName} ${timing} ${evt} ON public.${tbl} FOR EACH ROW EXECUTE FUNCTION ${func};`;
});

// Handle 'OR UPDATE' for insert triggers if any exist
processed = processed.replace(/CREATE TRIGGER (\w+) (BEFORE|AFTER) (INSERT OR UPDATE|UPDATE OR INSERT) ON public\.([a-z_]+) FOR EACH ROW EXECUTE FUNCTION ([\w_\(\)]+);/ig, (match, trName, timing, evt, tbl, func) => {
  return `DROP TRIGGER IF EXISTS ${trName} ON public.${tbl};\nCREATE TRIGGER ${trName} ${timing} ${evt} ON public.${tbl} FOR EACH ROW EXECUTE FUNCTION ${func};`;
});

// Write it out
fs.writeFileSync(outPath, safeSql + processed);
console.log('Successfully generated ' + outPath);
