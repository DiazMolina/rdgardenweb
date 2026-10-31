export class InputError extends Error {}
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function uuid(value: unknown): string {
  if (typeof value !== 'string' || !UUID.test(value)) throw new InputError('Identificador inválido');
  return value.toLowerCase();
}
export function text(value: unknown, max = 500, required = true): string {
  if (typeof value !== 'string') throw new InputError('Texto inválido');
  const result = value.trim();
  if ((required && !result) || result.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result)) throw new InputError('Texto inválido');
  return result;
}
export function integer(value: unknown, min = 0, max = 1000000): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) throw new InputError('Número inválido');
  return value;
}
export function isAdmin(user: { id: string; app_metadata?: Record<string, unknown> } | null, allowlist = ''): boolean {
  return !!user && (user.app_metadata?.role === 'admin' || allowlist.split(',').map(id => id.trim()).filter(Boolean).includes(user.id));
}
export function safeUrl(value: unknown, image = false): string {
  const input = text(value, 2048, false);
  if (!input) return input;
  if (!image && ((input.startsWith('/') && !input.startsWith('//') && !/[\\\r\n]/.test(input)) || /^#[\w-]+$/.test(input))) return input;
  let url: URL;
  try { url = new URL(input); } catch { throw new InputError('URL inválida'); }
  if (url.protocol !== 'https:' || url.username || url.password) throw new InputError('Solo se permiten URLs HTTPS');
  if (image && /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[|.*\.local$)/i.test(url.hostname)) throw new InputError('Host de imagen inválido');
  return url.href;
}
export function validateForm(form: FormData): void {
  if (!(form instanceof FormData) || Array.from(form.keys()).length > 80) throw new InputError('Formulario inválido');
  for (const [key, raw] of form) {
    if (typeof raw !== 'string') throw new InputError('No se admiten archivos en este formulario');
    const value = text(raw, /description|instructions|shipping_info|faq|section_|intro|details/.test(key) ? 20000 : 2048, false);
    if (/^(image_url|image_leaf|image_roots|image_extra)$/.test(key)) safeUrl(value, true);
    if (key === 'whatsapp_link' && value) {
      const url = new URL(safeUrl(value));
      if (!['wa.me', 'chat.whatsapp.com', 'api.whatsapp.com'].includes(url.hostname)) throw new InputError('Enlace WhatsApp inválido');
    }
    if (key === 'button_link') safeUrl(value);
    if (['price', 'stock', 'sort_order', 'packaging_fee_per_item'].includes(key)) {
      const number = Number(value);
      if (!value || !Number.isFinite(number) || number < 0 || number > 1000000 || (key !== 'price' && key !== 'packaging_fee_per_item' && !Number.isInteger(number))) throw new InputError('Importe o cantidad inválidos');
    }
  }
}
export const ORDER_STATUSES = ['Pendiente', 'Enviado', 'Entregado', 'Cancelado'] as const;
export type OrderLine = { id: string; quantity: number; selectedSize: string };
export function validateOrder(customer: unknown, input: unknown, requestId: unknown) {
  if (!customer || typeof customer !== 'object' || Array.isArray(customer)) throw new InputError('Cliente inválido');
  const source = customer as Record<string, unknown>;
  const email = text(source.customer_email, 254, false);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InputError('Correo inválido');
  const phone = text(source.customer_phone, 30);
  if (!/^\+?[\d\s()-]{6,30}$/.test(phone)) throw new InputError('Teléfono inválido');
  const payment = text(source.payment_method, 40);
  if (!['Yape', 'Plin', 'Transferencia Bancaria'].includes(payment)) throw new InputError('Método de pago inválido');
  if (!Array.isArray(input) || input.length < 1 || input.length > 50) throw new InputError('Carrito inválido');
  const keys = new Set<string>();
  const items: OrderLine[] = input.map(item => {
    if (!item || typeof item !== 'object') throw new InputError('Producto inválido');
    const id = uuid(item.id);
    const size = text(item.selectedSize ?? 'Standard', 100);
    const key = JSON.stringify([id, size]);
    if (keys.has(key)) throw new InputError('Producto duplicado');
    keys.add(key);
    return { id, quantity: integer(item.quantity, 1, 100), selectedSize: size };
  });
  return { requestId: uuid(requestId), payment, customer: {
    customer_name: text(source.customer_name, 160), customer_email: email, customer_phone: phone,
    customer_dni: text(source.customer_dni ?? '', 30, false), shipping_address: text(source.shipping_address, 1000),
  }, items };
}

export function catalogFilters(params: Record<string, string | string[] | undefined>) {
  const scalar = (key: string, fallback = '', max = 160) => typeof params[key] === 'string' ? params[key].slice(0, max) : fallback;
  const page = Number(scalar('page', '1', 12));
  const sort = scalar('sort', 'newest');
  const price = scalar('price', 'all');
  return {
    currentCategory: scalar('category', 'Todas') || 'Todas',
    currentPriceRange: ['all', '0-50', '50-150', '150-plus'].includes(price) ? price : 'all',
    currentSort: ['newest', 'price-asc', 'price-desc'].includes(sort) ? sort : 'newest',
    inStockOnly: scalar('inStock') === 'true',
    currentPage: Number.isFinite(page) ? Math.min(10000, Math.max(1, Math.floor(page))) : 1,
    search: scalar('q', '', 100), badge: scalar('badge'),
  };
}
