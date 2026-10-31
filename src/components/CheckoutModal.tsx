'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  Loader2, 
  PackageCheck, 
  IdCard, 
  MessageCircle, 
  MapPin, 
  QrCode, 
  Building2, 
  Send,
  ExternalLink
} from 'lucide-react';
import { useDialog } from './useDialog';
import { useCart } from '@/app/context/CartContext';
import { submitOrder, getPackagingSettings, getPaymentSettings } from '@/app/checkout/actions';

const DEPARTAMENTOS_PERU = [
  'Lima Metropolitana',
  'Lima Provincias',
  'Callao',
  'Arequipa',
  'Cusco',
  'La Libertad',
  'Lambayeque',
  'Piura',
  'Junín',
  'Áncash',
  'Ica',
  'San Martín',
  'Cajamarca',
  'Loreto',
  'Huánuco',
  'Ayacucho',
  'Ucayali',
  'Puno',
  'Tacna',
  'Moquegua',
  'Amazonas',
  'Apurímac',
  'Huancavelica',
  'Madre de Dios',
  'Pasco',
  'Tumbes'
];

type PaymentMethodType = 'Yape' | 'Plin' | 'Transferencia Bancaria';

export default function CheckoutModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { items, cartTotal, cartCount, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dni: '',
    department: 'Lima Metropolitana',
    province: 'Lima',
    district: '',
    address: '',
    reference: '',
    paymentMethod: 'Yape' as PaymentMethodType,
  });

  const requestId = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{ id: string; waUrl: string; totalAmount: number } | null>(null);

  // Configuración de Embalaje Térmico
  const [packagingConfig, setPackagingConfig] = useState({ enabled: false, feePerItem: 3.00 });

  // Configuración dinámica de Métodos de Pago administrados desde /admin/settings
  const [paymentConfig, setPaymentConfig] = useState({
    storePhone: {
      raw: '+51 997 966 231',
      clean: '51997966231',
      formatted: '+51 997 966 231',
    },
    yape: {
      enabled: true,
      number: '997 966 231',
      name: 'RD Garden',
    },
    plin: {
      enabled: true,
      number: '997 966 231',
      banks: 'Interbank / Scotiabank / BBVA',
    },
    transfer: {
      enabled: true,
      title: 'BCP / BBVA / Interbank',
      details: 'Transferencia Directa o CCI (Cuentas en Soles)',
    },
  });

  useEffect(() => {
    if (isOpen) {
      getPackagingSettings().then((config) => {
        setPackagingConfig(config);
      });

      getPaymentSettings().then((pConfig) => {
        setPaymentConfig(pConfig);

        setFormData((prev) => {
          const isCurrentActive =
            (prev.paymentMethod === 'Yape' && pConfig.yape.enabled) ||
            (prev.paymentMethod === 'Plin' && pConfig.plin.enabled) ||
            (prev.paymentMethod === 'Transferencia Bancaria' && pConfig.transfer.enabled);

          if (!isCurrentActive) {
            if (pConfig.yape.enabled) return { ...prev, paymentMethod: 'Yape' };
            if (pConfig.plin.enabled) return { ...prev, paymentMethod: 'Plin' };
            if (pConfig.transfer.enabled) return { ...prev, paymentMethod: 'Transferencia Bancaria' };
          }
          return prev;
        });
      });
    }
  }, [isOpen]);

  const dialogRef = useDialog(isOpen, onClose);

  if (!isOpen) return null;

  // Cálculo del costo de embalaje según número de plantas
  const packagingFee = packagingConfig.enabled ? (cartCount * packagingConfig.feePerItem) : 0;
  const finalTotal = cartTotal + packagingFee;

  // Construcción del mensaje oficial para WhatsApp
  const buildWhatsAppMessage = (orderId: string, fullAddress: string, confirmed: { items: Array<{ name: string; selectedSize: string; quantity: number; price: number }>; subtotal: number; packagingFee: number; totalAmount: number }) => {
    const itemsListText = confirmed.items
      .map((item, idx) => `  ${idx + 1}. *${item.name}* (${item.selectedSize || 'Maceta'}) x${item.quantity} = S/ ${(item.quantity * item.price).toFixed(2)}`)
      .join('\n');

    const packagingLine = confirmed.packagingFee > 0
      ? `• *Acondicionamiento Térmico:* S/ ${confirmed.packagingFee.toFixed(2)}\n`
      : '';

    let paymentMethodDetails = '';
    if (formData.paymentMethod === 'Yape') {
      paymentMethodDetails = ` (Número: ${paymentConfig.yape.number} - ${paymentConfig.yape.name})`;
    } else if (formData.paymentMethod === 'Plin') {
      paymentMethodDetails = ` (Número: ${paymentConfig.plin.number} - ${paymentConfig.plin.banks})`;
    } else if (formData.paymentMethod === 'Transferencia Bancaria') {
      paymentMethodDetails = ` (${paymentConfig.transfer.title}: ${paymentConfig.transfer.details})`;
    }

    return `🌿 *¡NUEVO PEDIDO DE PLANTAS - RD GARDEN!* 🌿
📋 *Orden N°:* #${orderId.slice(0, 8)}

👤 *DATOS DEL CLIENTE:*
• *Nombre Completo:* ${formData.name}
• *DNI / Doc:* ${formData.dni}
• *Teléfono:* ${formData.phone}
• *Email:* ${formData.email}

📍 *DESTINO DE ENVÍO EN PERÚ:*
• *Departamento:* ${formData.department}
• *Provincia:* ${formData.province}
• *Distrito:* ${formData.district}
• *Dirección:* ${formData.address}
${formData.reference ? `• *Referencia:* ${formData.reference}\n` : ''}
🪴 *EJEMPLARES BOTÁNICOS SOLICITADOS:*
${itemsListText}

💰 *RESUMEN DE PAGO:*
• *Subtotal Plantas:* S/ ${confirmed.subtotal.toFixed(2)}
${packagingLine}• *MONTO TOTAL A PAGAR:* *S/ ${confirmed.totalAmount.toFixed(2)}*
• *Método de Pago Elegido:* ${formData.paymentMethod}${paymentMethodDetails}

📸 *Adjunto mi constancia / voucher de pago por aquí para validar mi pedido y programar el empaque térmico. ¡Muchas gracias!* 🌿📦`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.district.trim()) {
      alert('Por favor, ingresa el distrito de entrega.');
      return;
    }

    if (loading) return;
    setLoading(true);
    requestId.current ||= crypto.randomUUID();

    // Dirección completa formateada con Departamento, Provincia y Distrito de Perú
    const fullShippingAddress = `${formData.address.trim()}, ${formData.district.trim()}, ${formData.province.trim()}, ${formData.department}${formData.reference.trim() ? ` (Ref: ${formData.reference.trim()})` : ''}`;

    const res = await submitOrder({
      customer_name: formData.name.trim(),
      customer_email: formData.email.trim(),
      customer_phone: formData.phone.trim(),
      customer_dni: formData.dni.trim(),
      shipping_address: fullShippingAddress,
      payment_method: formData.paymentMethod,
    }, items, requestId.current);

    setLoading(false);

    if (res.success && res.orderId && res.items && res.totalAmount !== undefined && res.subtotal !== undefined && res.packagingFee !== undefined) {
      const message = buildWhatsAppMessage(res.orderId, fullShippingAddress, { items: res.items, totalAmount: res.totalAmount, subtotal: res.subtotal, packagingFee: res.packagingFee });
      const waUrl = `https://wa.me/${paymentConfig.storePhone.clean}?text=${encodeURIComponent(message)}`;

      setCompletedOrder({ id: res.orderId, waUrl, totalAmount: res.totalAmount });
      requestId.current = null;
      
      // Limpiar el carrito de compras
      clearCart();

      // Abrir WhatsApp automáticamente en una nueva pestaña
      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      alert(res.error || 'Hubo un inconveniente al procesar tu pedido. Por favor intenta nuevamente.');
      // Keep the idempotency key on an uncertain network outcome.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={completedOrder ? "Pedido registrado" : "Finalizar compra"} tabIndex={-1} className="relative bg-surface rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto border border-gray-100">

        {/* Botón Cerrar */}
        <button
          onClick={onClose} aria-label="Cerrar checkout"
          className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-ink transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {completedOrder ? (
          /* PANTALLA DE ÉXITO Y REDIRECCIÓN A WHATSAPP */
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-accent rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={36} />
            </div>
            
            <h2 className="text-3xl font-serif font-bold text-gray-900">¡Pedido Registrado con Éxito!</h2>
            
            <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
              Hemos registrado tu orden <strong className="text-emerald-900">#{completedOrder.id.slice(0, 8)}</strong> en nuestro sistema y descontado los ejemplares del invernadero.
            </p>

            <div className="bg-canvas p-5 rounded-2xl border border-line max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Orden:</span>
                <span className="font-mono font-bold text-gray-900">#{completedOrder.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Método de Pago:</span>
                <span className="font-bold text-gray-900">{formData.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Total a Transferir:</span>
                <span className="font-black text-accent text-sm">S/ {completedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 pt-1 border-t border-gray-200">
                <span>Destino:</span>
                <span className="font-medium text-gray-800 text-right truncate max-w-[220px]">
                  {formData.district}, {formData.province}, {formData.department}
                </span>
              </div>
            </div>

            {/* Aviso para adjuntar voucher */}
            <div className="bg-tint border border-emerald-200 p-4 rounded-2xl max-w-md mx-auto text-xs text-ink font-medium space-y-1">
              <p className="font-bold flex items-center justify-center gap-1.5 text-emerald-900">
                <MessageCircle size={15} /> Envía tu Constancia de Pago
              </p>
              <p className="text-accent/90">
                Se ha generado el mensaje oficial en WhatsApp ({paymentConfig.storePhone.formatted}). Por favor adjunta la foto o captura de tu voucher en el chat para que nuestro equipo valide y selle el empaque térmico de tu planta.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
              <a
                href={completedOrder.waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider rounded-full transition shadow-lg flex items-center justify-center gap-2"
              >
                <MessageCircle size={17} /> Abrir WhatsApp y Enviar Voucher <ExternalLink size={14} />
              </a>

              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/';
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-full transition"
              >
                Volver a la Tienda
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO DE CHECKOUT Y COORDINACIÓN DE PAGO PERÚ */
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <ShieldCheck className="text-accent" size={26} />
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900">Finalizar Compra y Reserva</h2>
                <p className="text-xs text-gray-500">Coordinación directa por WhatsApp con pago seguro por Yape, Plin o Transferencia</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* NOTA DE ENVÍO PERÚ */}
              <div className="bg-blue-50/80 border border-blue-200/80 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-blue-950 font-medium">
                <Truck size={18} className="text-blue-700 shrink-0" />
                <span><strong>Envíos a Todo el Perú:</strong> El costo de flete o agencia (Olva, Shalom o Motorizado) se coordina y cancela al recibir o según la tarifa de tu ciudad.</span>
              </div>

              {/* Resumen de Total & Embalaje */}
              <div className="bg-canvas p-4 rounded-2xl border border-line space-y-2 text-xs">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotal Ejemplares ({cartCount} {cartCount === 1 ? 'planta' : 'plantas'}):</span>
                  <span className="font-bold text-gray-900">S/ {cartTotal.toFixed(2)}</span>
                </div>

                {packagingConfig.enabled && (
                  <div className="flex justify-between items-center text-amber-900 pt-2 border-t border-amber-200/50">
                    <span className="flex items-center gap-1 font-semibold">
                      <PackageCheck size={14} className="text-amber-700" /> Embalaje Térmico con Gel ({cartCount} x S/ {packagingConfig.feePerItem.toFixed(2)}):
                    </span>
                    <span className="font-bold">S/ {packagingFee.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Final a Pagar:</span>
                  <span className="text-2xl text-accent font-black">S/ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* 1. DATOS PERSONALES DEL CLIENTE */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <IdCard size={15} className="text-accent" /> 1. Datos del Comprador
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkout-name" className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Nombre Completo *</label>
                    <input
                      id="checkout-name" name="name" autoComplete="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej. Valeria Mendoza"
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 bg-surface"
                    />
                  </div>

                  <div>
                    <label htmlFor="checkout-dni" className="block text-[10px] font-bold uppercase text-gray-600 mb-1">
                      DNI / Documento de Identidad *
                    </label>
                    <input
                      id="checkout-dni" name="dni"
                      type="text"
                      required
                      maxLength={12}
                      value={formData.dni}
                      onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                      placeholder="Ej. 74819203"
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 font-mono bg-surface"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkout-phone" className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Teléfono / WhatsApp *</label>
                    <input
                      id="checkout-phone" name="phone" autoComplete="tel"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+51 997 966 231"
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 bg-surface"
                    />
                  </div>

                  <div>
                    <label htmlFor="checkout-email" className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Correo Electrónico (Opcional)</label>
                    <input
                      id="checkout-email" name="email" autoComplete="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="valeria@ejemplo.com"
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 bg-surface"
                    />
                  </div>
                </div>
              </div>

              {/* 2. DIRECCIÓN DE DESTINO EN PERÚ */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <MapPin size={15} className="text-accent" /> 2. Ubicación de Entrega en Perú
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="checkout-department" className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Departamento *</label>
                    <select
                      id="checkout-department" name="department" autoComplete="address-level1"
                      value={formData.department}
                      onChange={(e) => {
                        const dep = e.target.value;
                        setFormData({ 
                          ...formData, 
                          department: dep,
                          province: dep.includes('Lima') ? 'Lima' : dep
                        });
                      }}
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-600 bg-surface cursor-pointer"
                    >
                      {DEPARTAMENTOS_PERU.map((dep) => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="checkout-province" className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Provincia *</label>
                    <input
                      id="checkout-province" name="province" autoComplete="address-level2"
                      type="text"
                      required
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      placeholder="Ej. Lima, Arequipa, Trujillo"
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 bg-surface"
                    />
                  </div>

                  <div>
                    <label htmlFor="checkout-district" className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Distrito *</label>
                    <input
                      id="checkout-district" name="district"
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="Ej. Miraflores, Yanahuara"
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 bg-surface"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label htmlFor="checkout-address" className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Dirección Exacta (Calle, Jr, Av, N°) *</label>
                    <input
                      id="checkout-address" name="address" autoComplete="street-address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Av. José Larco 812, Dpto 502"
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 bg-surface"
                    />
                  </div>

                  <div>
                    <label htmlFor="checkout-reference" className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Referencia</label>
                    <input
                      id="checkout-reference" name="reference"
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      placeholder="Frente al parque"
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 bg-surface"
                    />
                  </div>
                </div>
              </div>

              {/* 3. MÉTODO DE PAGO PERÚ (YAPE, PLIN, TRANSFERENCIA) */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <QrCode size={15} className="text-accent" /> 3. Selecciona tu Método de Pago
                </h4>

                {(() => {
                  const activeCount = [
                    paymentConfig.yape.enabled,
                    paymentConfig.plin.enabled,
                    paymentConfig.transfer.enabled,
                  ].filter(Boolean).length;

                  if (activeCount === 0) {
                    return (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium">
                        Coordinaremos el método de pago directamente por WhatsApp ({paymentConfig.storePhone.formatted}) una vez recibido tu pedido.
                      </div>
                    );
                  }

                  return (
                    <div className={`grid grid-cols-1 ${activeCount === 2 ? 'sm:grid-cols-2' : activeCount >= 3 ? 'sm:grid-cols-3' : ''} gap-3`}>
                      
                      {/* YAPE */}
                      {paymentConfig.yape.enabled && (
                        <label
                          onClick={() => setFormData({ ...formData, paymentMethod: 'Yape' })}
                          className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                            formData.paymentMethod === 'Yape'
                              ? 'border-purple-600 bg-purple-50/60 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-surface'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-sm text-[#742284]">YAPE</span>
                            <span className="w-4 h-4 rounded-full border border-purple-500 flex items-center justify-center">
                              {formData.paymentMethod === 'Yape' && <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 font-medium leading-tight">
                            Número: <strong>{paymentConfig.yape.number}</strong>
                          </p>
                          <span className="text-[10px] text-purple-700 font-semibold mt-1">
                            A nombre de {paymentConfig.yape.name}
                          </span>
                        </label>
                      )}

                      {/* PLIN */}
                      {paymentConfig.plin.enabled && (
                        <label
                          onClick={() => setFormData({ ...formData, paymentMethod: 'Plin' })}
                          className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                            formData.paymentMethod === 'Plin'
                              ? 'border-cyan-600 bg-cyan-50/60 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-surface'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-sm text-[#00A4D3]">PLIN</span>
                            <span className="w-4 h-4 rounded-full border border-cyan-500 flex items-center justify-center">
                              {formData.paymentMethod === 'Plin' && <span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span>}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 font-medium leading-tight">
                            Número: <strong>{paymentConfig.plin.number}</strong>
                          </p>
                          <span className="text-[10px] text-cyan-700 font-semibold mt-1">
                            {paymentConfig.plin.banks}
                          </span>
                        </label>
                      )}

                      {/* TRANSFERENCIA BANCARIA */}
                      {paymentConfig.transfer.enabled && (
                        <label
                          onClick={() => setFormData({ ...formData, paymentMethod: 'Transferencia Bancaria' })}
                          className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                            formData.paymentMethod === 'Transferencia Bancaria'
                              ? 'border-emerald-700 bg-tint/60 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-surface'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-xs text-ink flex items-center gap-1">
                              <Building2 size={14} className="text-accent" /> {paymentConfig.transfer.title}
                            </span>
                            <span className="w-4 h-4 rounded-full border border-emerald-600 flex items-center justify-center">
                              {formData.paymentMethod === 'Transferencia Bancaria' && <span className="w-2.5 h-2.5 rounded-full bg-emerald-800"></span>}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 font-medium leading-tight">
                            {paymentConfig.transfer.details}
                          </p>
                          <span className="text-[10px] text-accent font-semibold mt-1">Cuentas en Soles (S/)</span>
                        </label>
                      )}

                    </div>
                  );
                })()}

                <div className="bg-canvas p-3 rounded-xl border border-line text-[11px] text-gray-600 flex items-center gap-2">
                  <MessageCircle size={15} className="text-accent shrink-0" />
                  <span>Al presionar el botón inferior se enviará tu pedido con la lista completa a nuestro WhatsApp ({paymentConfig.storePhone.formatted}) para que adjuntes tu voucher de pago.</span>
                </div>
              </div>

              {/* BOTÓN CONFIRMAR Y ENVIAR A WHATSAPP */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-700/20 flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Registrando Pedido...
                  </>
                ) : (
                  <>
                    <MessageCircle size={18} /> Pagar Total por WhatsApp: S/ {finalTotal.toFixed(2)}
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
