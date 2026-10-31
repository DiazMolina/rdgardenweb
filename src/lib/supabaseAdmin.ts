import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Usamos el Service Role Key para tener permisos de administrador y saltarnos las políticas de seguridad (RLS)
// Esto SOLO debe usarse en entornos de servidor (como API Routes o Server Actions), NUNCA en el cliente.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
