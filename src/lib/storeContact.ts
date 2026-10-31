/**
 * Utilidades para normalización y formateo del número de teléfono y enlaces de WhatsApp
 * Centralizado para que cualquier cambio desde el panel administrativo rija en toda la web.
 */

export const DEFAULT_STORE_PHONE = '+51 997 966 231';

/**
 * Extrae solo los dígitos y asegura el código de país de Perú (51)
 * Ejemplos:
 * "997966231" -> "51997966231"
 * "+51 997 966 231" -> "51997966231"
 * "51997966231" -> "51997966231"
 */
export function cleanPhoneDigits(phone?: string | null): string {
  if (!phone) return '51997966231';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '51997966231';
  
  if (digits.length === 9 && digits.startsWith('9')) {
    return `51${digits}`;
  }
  
  return digits;
}

/**
 * Formatea un número para presentación visual limpia en pantalla
 * Ejemplo: "51997966231" -> "+51 997 966 231"
 */
export function formatDisplayPhone(phone?: string | null): string {
  if (!phone) return DEFAULT_STORE_PHONE;
  const clean = cleanPhoneDigits(phone);
  
  if (clean.length === 11 && clean.startsWith('51')) {
    const local = clean.slice(2);
    return `+51 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  
  if (clean.length === 9) {
    return `+51 ${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  }
  
  return phone;
}

/**
 * Genera el enlace oficial a WhatsApp (https://wa.me/...)
 */
export function buildWhatsAppLink(phone?: string | null, message?: string): string {
  const clean = cleanPhoneDigits(phone);
  return `https://wa.me/${clean}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
