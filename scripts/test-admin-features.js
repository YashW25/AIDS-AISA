import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env physically
const envPath = path.resolve(process.cwd(), '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
const lines = envFile.split(/\r?\n/);
for (const line of lines) {
  if (!line.trim() || line.startsWith('#')) continue;
  const eqIdx = line.indexOf('=');
  if (eqIdx !== -1) {
    const k = line.slice(0, eqIdx).trim();
    const v = line.slice(eqIdx + 1).replace(/^['"]|['"]$/g, '').trim();
    env[k] = v;
  }
}

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_PUBLISHABLE_KEY'] || env['VITE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE URL or PUBLISHABLE KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_TABLES = [
  { table: 'announcements', data: { content: 'test-announcement-123', club_id: null } },
  { table: 'events', data: { title: 'Test Event 123', event_date: new Date().toISOString() } },
  { table: 'team_members', data: { name: 'Test User', role: 'Tester' } },
  { table: 'gallery', data: { title: 'Test Image', image_url: 'http://test.com/img.png' } },
  { table: 'quick_links', data: { title: 'Test Link', url: 'http://test.com' } },
  { table: 'hero_slides', data: { title: 'Test Slide', image_url: 'http://test.com' } },
  { table: 'news', data: { title: 'Test News', content: 'News content.' } },
  { table: 'alumni', data: { name: 'Test Alumni', graduation_year: '2020' } },
  { table: 'partners', data: { name: 'Test Partner', logo_url: 'http://test.com' } },
  { table: 'site_settings', data: { key: 'test_key', value: 'test_val' } },
  { table: 'nav_items', data: { label: 'Test Nav', href: '/test' } },
  { table: 'custom_pages', data: { title: 'Test Page', slug: 'test-page' } }
];

async function main() {
  console.log("Authenticating as admin@aisa.club...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@aisa.club',
    password: 'AdminPassword123!' // try both passwords referenced in previous SQL
  });
  
  if (authError) {
      console.log("Trying alternative password 12345678...");
      const { data: authDataAlt, error: authErrorAlt } = await supabase.auth.signInWithPassword({
        email: 'admin@aisa.club',
        password: '12345678'
      });
      if (authErrorAlt) {
        console.error("Login entirely failed. The user has not run the SQL to create the admin user yet:", authErrorAlt.message);
        return;
      }
      console.log("Logged in gracefully with 12345678.");
  } else {
      console.log("Logged in gracefully with AdminPassword123!");
  }

  const token = (await supabase.auth.getSession()).data.session?.access_token;
  if (!token) {
    console.error("No active session token acquired.");
    return;
  }
  
  console.log("Testing insert access to Admin Panel schema entities...\n");
  
  const results = { success: [], missing_table: [], rls_error: [], unknown_error: [] };

  for (const test of TEST_TABLES) {
    console.log(`Testing table [${test.table}]...`);
    const { data, error } = await supabase.from(test.table).insert([test.data]).select();
    
    if (error) {
      if (error.code === '42P01') {
        process.stdout.write(`❌ Table '${test.table}' does NOT exist.\n`);
        results.missing_table.push(test.table);
      } else if (error.code === '42501') {
        process.stdout.write(`❌ RLS Policy blocking INSERT on '${test.table}'.\n`);
        results.rls_error.push(test.table);
      } else {
        process.stdout.write(`❌ Unknown error on '${test.table}': ${error.message}\n`);
        results.unknown_error.push({table: test.table, error: error.message});
      }
    } else {
      process.stdout.write(`✅ Successfully inserted heavily into '${test.table}'. Cleaning up...\n`);
      results.success.push(test.table);
      // Clean up the test row safely
      if (data && data.length > 0 && data[0].id) {
         await supabase.from(test.table).delete().eq('id', data[0].id);
      }
    }
  }
  
  console.log("\n--- TEST SUMMARY ---");
  console.log("✅ Success (Fully Functional):", results.success.length > 0 ? results.success.join(', ') : 'None');
  console.log("🚨 Missing Tables:", results.missing_table.length > 0 ? results.missing_table.join(', ') : 'None');
  console.log("🔒 RLS / Permissions Blocks:", results.rls_error.length > 0 ? results.rls_error.join(', ') : 'None');
  console.log("🛠️ Other Errors:", results.unknown_error);
}

main().catch(console.error);
