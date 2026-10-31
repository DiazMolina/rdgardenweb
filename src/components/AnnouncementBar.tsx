import { createClient } from '@/lib/supabaseServer';

export default async function AnnouncementBar() {
  const supabase = await createClient();

  const { data: setting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'announcement_bar')
    .single();

  const text = setting?.value || '🌍 ENVÍOS A TODO EL PAÍS • EMPAQUE TÉRMICO CERTIFICADO Y GARANTÍA DE LLEGADA VIVA 🌿';

  return (
    <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#064e3b] text-emerald-50 py-2.5 text-center text-xs font-semibold uppercase tracking-widest px-4 border-b border-emerald-500/20 shadow-xs">
      {text}
    </div>
  );
}
