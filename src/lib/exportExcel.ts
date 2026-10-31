import { spreadsheetText } from './security/output';
export function downloadOrdersExcel(orders: any[], dateRangeLabel?: string) {
  if (!orders || orders.length === 0) {
    alert('No hay pedidos para exportar.');
    return;
  }

  let table = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Reporte de Pedidos RD Garden</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        th { background-color: #0F281E; color: #FFFFFF; font-weight: bold; text-align: left; padding: 10px; }
        td { border: 1px solid #E8E3DA; padding: 8px; vertical-align: top; }
        .monto { font-weight: bold; color: #0F281E; }
        .pendiente { color: #D97706; font-weight: bold; }
        .enviado { color: #2563EB; font-weight: bold; }
        .entregado { color: #059669; font-weight: bold; }
      </style>
    </head>
    <body>
      <h2>Reporte Oficial de Pedidos - RD Garden Store</h2>
      <p><strong>Fecha de exportación:</strong> ${new Date().toLocaleString('es-ES')}</p>
      ${dateRangeLabel ? `<p><strong>Período de filtro:</strong> ${spreadsheetText(dateRangeLabel)}</p>` : ''}
      <p><strong>Total de pedidos exportados:</strong> ${orders.length}</p>
      <br/>
      <table>
        <thead>
          <tr>
            <th>ID Orden</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>DNI / Doc.</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Dirección de Envío</th>
            <th>Agencia / Courier</th>
            <th>N° Guía / Rastreo</th>
            <th>Estado</th>
            <th>Monto Total (S/)</th>
            <th>Productos Solicitados</th>
          </tr>
        </thead>
        <tbody>
  `;

  orders.forEach((o) => {
    const itemsSummary = o.order_items
      ?.map((i: any) => `${i.product_name} (${i.selected_size}) x${i.quantity} [S/ ${(i.quantity * i.price).toFixed(2)}]`)
      .join(' | ') || 'Sin desglose';

    const formattedDate = new Date(o.created_at).toLocaleString('es-ES');
    const statusClass = o.status === 'Pendiente' ? 'pendiente' : o.status === 'Enviado' ? 'enviado' : 'entregado';

    table += `
      <tr>
        <td>#${o.id.slice(0, 8)}</td>
        <td>${spreadsheetText(formattedDate)}</td>
        <td>${spreadsheetText(o.customer_name)}</td>
        <td>${spreadsheetText(o.customer_dni || 'N/A')}</td>
        <td>${spreadsheetText(o.customer_email)}</td>
        <td>${spreadsheetText(o.customer_phone || 'N/A')}</td>
        <td>${spreadsheetText(o.shipping_address)}</td>
        <td>${spreadsheetText(o.courier || 'Por asignar')}</td>
        <td>${spreadsheetText(o.tracking_number || 'Pendiente')}</td>
        <td class="${statusClass}">${spreadsheetText(o.status)}</td>
        <td class="monto">S/ ${Number(o.total_amount).toFixed(2)}</td>
        <td>${spreadsheetText(itemsSummary)}</td>
      </tr>
    `;
  });

  table += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([table], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Reporte_Pedidos_RDGarden_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
