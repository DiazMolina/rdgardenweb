import { createClient } from '@supabase/supabase-js';

// NOTA: Estas variables deben ir en un archivo .env.local en la raíz del proyecto
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'tu-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);