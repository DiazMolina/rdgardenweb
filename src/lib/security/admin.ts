import 'server-only';
import { createClient } from '@/lib/supabaseServer';
import { isAdmin } from './validation';

export class AuthorizationError extends Error {
  constructor() { super('Acceso no autorizado'); }
}
export async function requireAdmin() {
  const supabase = await createClient();
  // getUser verifies the token with Supabase; client-controlled metadata is never trusted.
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !isAdmin(user, process.env.ADMIN_USER_IDS)) throw new AuthorizationError();
  return user!;
}
