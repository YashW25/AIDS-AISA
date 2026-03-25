import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env physically since we aren't loading vite/dotenv dependencies in pure node context
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
const serviceRoleKey = env['VITE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE URL or SERVICE ROLE KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log("Starting Auth and Role cleanup...");
  const adminEmail = 'admin@aisa.club';
  const adminPassword = '12345678';

  // 1. DDL: Ensure RLS is enabled on user_roles (we do this manually or via MCP, but since user asked to clean broken users, we just do data here)
  
  // 2. Fetch all users to find manually inserted/broken ones
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error("Error fetching users:", usersError);
    return;
  }

  // Find admin user if exists
  const existingAdmin = usersData.users.find(u => u.email === adminEmail);
  
  if (existingAdmin) {
    console.log("Admin user already exists. We will delete it to ensure a clean state without broken identities.");
    await supabase.auth.admin.deleteUser(existingAdmin.id);
    console.log("Deleted old admin user.");
  }

  // Delete ANY user that has no identities (this usually happens with manual raw SQL inserts into auth.users)
  for (const u of usersData.users) {
      if (!u.identities || u.identities.length === 0) {
          console.log(`Deleting broken manual user ID: ${u.id} (${u.email}) due to missing identities.`);
          await supabase.auth.admin.deleteUser(u.id);
      }
  }

  // 3. Recreate the admin user via the formal API
  console.log(`Recreating admin user: ${adminEmail}`);
  const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  if (createError) {
    console.error("Error creating super admin:", createError);
    return;
  }

  const newAdminId = newUserData.user.id;
  console.log("Successfully created user under ID: ", newAdminId);

  // 4. Assign role in public.user_roles
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({ user_id: newAdminId, role: 'admin' }, { onConflict: 'user_id,role' });

  if (roleError) {
    console.error("Error assigning admin role:", roleError);
    return;
  }
  
  console.log("SUCCESS: Assigned 'admin' role correctly to new user.");
  console.log(`Admin Login -> Email: ${adminEmail} | Password: ${adminPassword}`);
}

main().catch(console.error);
