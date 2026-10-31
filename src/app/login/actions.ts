'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';
import { isAdmin, text } from '@/lib/security/validation';
import { rateLimit } from '@/lib/security/rateLimit';

export async function login(form: FormData) {
  let allowed = false;
  try {
    await rateLimit('login', 5, 15 * 60000);
    const email = text(form.get('email'), 254);
    const password = form.get('password');
    if (typeof password !== 'string' || !password.length || password.length > 1024) throw new Error('Credenciales inválidas');
    const client = await createClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    allowed = !error && isAdmin(data.user, process.env.ADMIN_USER_IDS);
    if (!allowed) await client.auth.signOut();
  } catch { /* Generic message prevents account enumeration. */ }
  redirect(allowed ? '/admin' : '/login?error=1');
}
export async function logout() {
  const client = await createClient();
  await client.auth.signOut();
  redirect('/login');
}
