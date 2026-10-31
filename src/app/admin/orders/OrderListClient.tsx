'use client';

import React, { useState } from 'react';
import { updateOrderStatus, updateOrderCourier } from './actions';
import { downloadOrdersExcel } from '@/lib/exportExcel';
import { 
  ShoppingBag, 
  Truck, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  FileSpreadsheet, 
  CheckCircle2, 
  IdCard, 
  MessageCircle, 
  Save, 
  Calendar, 
  RotateCcw,
  Check
} from 'lucide-react';

const COURIER_OPTIONS = [
  'Olva Courier',
  'Shalom Empresarial',
  'Motorizado Express (Lima)',
  'Recojo en Invernadero',
  'Marvisur',
  'Otro Courier'
];

export default function OrderListClient({ orders: initialOrders }: { orders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState<'Todos' | 'Pendiente' | 'Enviado' | 'Entregado' | 'Cancelado'>('Todos');
  
  // Filtros de rango de fechas
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Estado local para los campos de courier y guía por cada orden
  const [shippingData, setShippingData] = useState<Record<string, { courier: string; tracking: string; saving: boolean; saved: boolean }>>(() => {
    const initialMap: Record<string, { courier: string; tracking: string; saving: boolean; saved: boolean }> = {};
    initialOrders.forEach(o => {
      initialMap[o.id] = {
        courier: o.courier || 'Olva Courier',
        tracking: o.tracking_number || '',
        saving: false,
        saved: false
      };
    });
    return initialMap;
  });

  // Presets rápidos de fecha
  const setTodayFilter = () => {
    const today = new Date().toISOString().slice(0, 10);
    setStartDate(today);
    setEndDate(today);
  };

  const setLast7DaysFilter = () => {
    const now = new Date();
    const past7 = new Date();
    past7.setDate(now.getDate() - 7);
    setStartDate(past7.toISOString().slice(0, 10));
    setEndDate(now.toISOString().slice(0, 10));
  };

  const setThisMonthFilter = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const today = now.toISOString().slice(0, 10);
    setStartDate(firstDay);
    setEndDate(today);
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  // Filtrado compuesto (Pestaña de Estado + Rango de Fechas)
  const filteredOrders = orders.filter((order) => {
    // Filtro por Estado
    const matchesStatus = activeTab === 'Todos' || order.status === activeTab;

    // Filtro por Fechas
    let matchesDate = true;
    if (startDate || endDate) {
      const orderDate = new Date(order.created_at);
      if (startDate) {
        const start = new Date(`${startDate}T00:00:00`);
        if (orderDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(`${endDate}T23:59:59`);
        if (orderDate > end) matchesDate = false;
      }
    }

    return matchesStatus && matchesDate;
  });

  // Métricas generales (calculadas sobre el conjunto filtrado o total)
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const pendingOrders = filteredOrders.filter(o => o.status === 'Pendiente').length;
  const shippedOrders = filteredOrders.filter(o => o.status === 'Enviado').length;

  // Manejo de guardado de Courier y Guía
  const handleSaveShipping = async (orderId: string) => {
    const current = shippingData[orderId];
    if (!current) return;

    setShippingData(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], saving: true, saved: false }
    }));

    try {
      await updateOrderCourier(orderId, current.courier, current.tracking);
      
      // Actualizar estado local de la orden
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, courier: current.courier, tracking_number: current.tracking } : o));

      setShippingData(prev => ({
        ...prev,
        [orderId]: { ...prev[orderId], saving: false, saved: true }
      }));

      setTimeout(() => {
        setShippingData(prev => ({
          ...prev,
          [orderId]: { ...prev[orderId], saved: false }
        }));
      }, 2500);
    } catch (err) {
      console.error('Error guardando envío:', err);
      alert('Hubo un error al guardar los datos de envío.');
      setShippingData(prev => ({
        ...prev,
        [orderId]: { ...prev[orderId], saving: false }
      }));
    }
  };

  // Generador de enlace de WhatsApp con el mensaje de confirmación y guía
  const generateWhatsAppTrackingLink = (order: any) => {
    const rawPhone = order.customer_phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('51') 
      ? cleanPhone 
      : cleanPhone.length === 9 
        ? `51${cleanPhone}` 
        : cleanPhone;

    const shippingInfo = shippingData[order.id] || { courier: order.courier || 'Olva Courier', tracking: order.tracking_number || 'Por coordinar' };
    const courierName = shippingInfo.courier || 'Agencia de Envíos';
    const trackingCode = shippingInfo.tracking.trim() || 'En proceso de emisión';

    const message = `🌿 *¡Hola ${order.customer_name}!* Te saludamos del equipo de *RD Garden*.

Tu pedido *#${order.id.slice(0, 8)}* ya ha sido preparado e ingresado a despacho 📦🌱

🚚 *Agencia de Envío:* ${courierName}
🔖 *Código de Guía / Rastreo:* ${trackingCode}
📍 *Destino:* ${order.shipping_address}

Puedes realizar el seguimiento de tu paquete directamente en la agencia. Recuerda desempacar tus plantas con cuidado al recibirlas y seguir su ficha de aclimatación. 

¡Cualquier duda o recomendación, estamos 100% atentos por este canal de WhatsApp! 🌿✨`;

    return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
  };

  // Etiqueta del rango de fechas para el Excel
  const dateRangeLabel = startDate && endDate 
    ? `${startDate} al ${endDate}`
    : startDate 
      ? `Desde ${startDate}` 
      : endDate 
        ? `Hasta ${endDate}` 
        : undefined;

  return (
    <div className="space-y-8">

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Órdenes Filtradas</span>
            <span className="text-xl font-black text-gray-900">{filteredOrders.length}</span>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pendientes</span>
            <span className="text-xl font-black text-amber-600 font-mono">{pendingOrders}</span>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Truck size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">En Despacho / Camino</span>
            <span className="text-xl font-black text-blue-600 font-mono">{shippedOrders}</span>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-3 bg-tint text-accent rounded-xl">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Ingresos Período</span>
            <span className="text-xl font-black text-accent">S/ {totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* FILTROS POR RANGO DE FECHAS (CONTABILIDAD & FINANZAS) */}
      <div className="bg-surface p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-accent" />
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Filtro por Rango de Fechas (Contabilidad / Logística)</span>
          </div>

          {/* Presets Rápidos */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={setTodayFilter}
              className="text-[11px] font-bold px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              Hoy
            </button>
            <button
              onClick={setLast7DaysFilter}
              className="text-[11px] font-bold px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              Últimos 7 días
            </button>
            <button
              onClick={setThisMonthFilter}
              className="text-[11px] font-bold px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              Este Mes
            </button>
            {(startDate || endDate) && (
              <button
                onClick={clearDateFilter}
                className="text-[11px] font-bold px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition flex items-center gap-1"
                title="Limpiar fechas"
              >
                <RotateCcw size={12} /> Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha Inicio (Desde)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-200 bg-surface outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha Fin (Hasta)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-200 bg-surface outline-none focus:border-emerald-600"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <span className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 w-full">
              {startDate || endDate ? (
                <>Mostrando pedidos de <strong>{dateRangeLabel}</strong> ({filteredOrders.length} encontrados)</>
              ) : (
                <>Mostrando historial completo ({orders.length} pedidos registrados)</>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* BARRA DE BOTONES DE FILTRO DE ESTADO Y EXPORTACIÓN EXCEL */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-2xl border border-gray-100 shadow-sm">

        {/* Pestañas de Filtro */}
        <div className="flex flex-wrap items-center gap-2">
          {(['Todos', 'Pendiente', 'Enviado', 'Entregado', 'Cancelado'] as const).map((tab) => {
            const count = tab === 'Todos' ? orders.length : orders.filter(o => o.status === tab).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#0F281E] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-emerald-800 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Botón Exportar a Excel */}
        <button
          onClick={() => downloadOrdersExcel(filteredOrders, dateRangeLabel)}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition shadow-md shrink-0 cursor-pointer"
        >
          <FileSpreadsheet size={16} /> Exportar Reporte a Excel (.xls)
        </button>
      </div>

      {/* LISTADO DE PEDIDOS FILTRADOS */}
      <div className="space-y-6">
        {filteredOrders.map((order) => {
          const currentShipping = shippingData[order.id] || {
            courier: order.courier || 'Olva Courier',
            tracking: order.tracking_number || '',
            saving: false,
            saved: false
          };

          return (
            <div key={order.id} className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Cabecera del Pedido */}
              <div className="p-6 bg-gray-50/80 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-gray-500">ORDEN #{order.id.slice(0, 8)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === 'Pendiente' ? 'bg-amber-100 text-amber-800' :
                      order.status === 'Enviado' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Entregado' ? 'bg-emerald-100 text-accent' : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Fecha: {new Date(order.created_at).toLocaleString('es-ES')}
                  </p>
                </div>

                {/* Formulario Cambiar Estado */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-bold uppercase">Estado:</span>
                  <select
                    defaultValue={order.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      await updateOrderStatus(order.id, newStatus);
                      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                    }}
                    className="text-xs font-bold p-2 rounded-xl border border-gray-200 bg-surface outline-none cursor-pointer"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Contenido del Pedido */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Datos del Cliente & Destino */}
                <div className="space-y-2 text-xs text-gray-600 lg:border-r border-gray-100 lg:pr-6">
                  <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider mb-2">Cliente & Destino</h4>
                  <p className="flex items-center gap-2 font-semibold text-gray-800">
                    <User size={14} className="text-accent" /> {order.customer_name}
                  </p>
                  {order.customer_dni && (
                    <p className="flex items-center gap-2 font-mono text-emerald-900 font-bold">
                      <IdCard size={14} className="text-gray-500" /> DNI: {order.customer_dni}
                    </p>
                  )}
                  {order.customer_email && (
                    <p className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" /> {order.customer_email}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" /> {order.customer_phone || 'Sin teléfono'}
                  </p>
                  <p className="flex items-start gap-2 pt-2 border-t border-gray-100 font-medium">
                    <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" /> {order.shipping_address}
                  </p>
                </div>

                {/* Items Comprados */}
                <div className="space-y-3 lg:border-r border-gray-100 lg:pr-6">
                  <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider">Productos Solicitados</h4>
                  <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-gray-800">{item.product_name}</span>
                          <span className="text-gray-400 ml-2">({item.selected_size})</span>
                          <span className="text-gray-500 block">Cantidad: {item.quantity} x S/ {Number(item.price).toFixed(2)}</span>
                        </div>
                        <span className="font-bold text-gray-900">S/ {(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm font-bold text-gray-900">
                    <span>Monto Total:</span>
                    <span className="text-xl text-accent">S/ {Number(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                {/* GESTIÓN DE GUÍA DE ENVÍO & NOTIFICACIÓN WHATSAPP */}
                <div className="space-y-3 bg-canvas p-4 rounded-xl border border-line">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-ink uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <Truck size={14} className="text-accent" /> Despacho & Guía
                    </h4>
                    {order.status === 'Enviado' && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Despachado
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Agencia de Envío / Courier
                      </label>
                      <select
                        value={currentShipping.courier}
                        onChange={(e) => {
                          const val = e.target.value;
                          setShippingData(prev => ({
                            ...prev,
                            [order.id]: { ...currentShipping, courier: val }
                          }));
                        }}
                        className="w-full text-xs font-bold p-2 rounded-lg border border-gray-200 bg-surface outline-none cursor-pointer"
                      >
                        {COURIER_OPTIONS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Código de Rastreo / Número de Guía
                      </label>
                      <input
                        type="text"
                        value={currentShipping.tracking}
                        onChange={(e) => {
                          const val = e.target.value;
                          setShippingData(prev => ({
                            ...prev,
                            [order.id]: { ...currentShipping, tracking: val }
                          }));
                        }}
                        placeholder="Ej. OLV-984218 o SH-48201"
                        className="w-full text-xs font-mono font-bold p-2 rounded-lg border border-gray-200 bg-surface outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      {/* Botón Guardar Guía */}
                      <button
                        onClick={() => handleSaveShipping(order.id)}
                        disabled={currentShipping.saving}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                          currentShipping.saved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#0F281E] hover:bg-emerald-950 text-white'
                        }`}
                      >
                        {currentShipping.saved ? (
                          <><Check size={14} /> ¡Guía Guardada!</>
                        ) : currentShipping.saving ? (
                          <>Guardando...</>
                        ) : (
                          <><Save size={14} /> Guardar Guía y Courier</>
                        )}
                      </button>

                      {/* Botón Notificar por WhatsApp */}
                      <a
                        href={generateWhatsAppTrackingLink(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white transition flex items-center justify-center gap-1.5 shadow-sm text-center"
                        title="Abrir WhatsApp con mensaje pre-armado para el cliente"
                      >
                        <MessageCircle size={15} /> Notificar Guía por WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="bg-surface p-12 rounded-2xl text-center text-gray-500 text-sm shadow-sm border border-gray-100">
            No hay pedidos que coincidan con los filtros seleccionados.
          </div>
        )}
      </div>

    </div>
  );
}
