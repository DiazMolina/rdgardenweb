import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node --env-file=.env.local scripts/register-admin.mjs <email> <password>');
  process.exit(1);
}

async function run() {
  console.log(`Checking if user ${email} already exists...`);
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    process.exit(1);
  }

  const existing = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    console.log(`User already exists with ID: ${existing.id}. Updating password and app_metadata...`);
    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      app_metadata: { ...existing.app_metadata, role: 'admin' }
    });

    if (updateError) {
      console.error('Error updating user:', updateError);
      process.exit(1);
    }
    console.log(`Successfully updated admin user: ${updated.user.email} (ID: ${updated.user.id})`);
    console.log(`USER_ID:${updated.user.id}`);
  } else {
    console.log(`Creating new user ${email}...`);
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: 'admin' }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      process.exit(1);
    }
    console.log(`Successfully created admin user: ${created.user.email} (ID: ${created.user.id})`);
    console.log(`USER_ID:${created.user.id}`);
  }
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

