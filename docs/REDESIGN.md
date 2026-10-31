# R&D Garden — auditoría y ejecución

## Estado inicial
Next.js 16.4.2 App Router, React 19.3, Tailwind 4, Supabase SSR y cliente. Sin biblioteca de animación ni pruebas de navegador instalada. TypeScript inicial: aprobado. Se preserva el árbol de trabajo previo sin commit.

Rutas: inicio, catálogo paginado, producto por id, deseos, administración (productos, pedidos, categorías, carrusel, ajustes y legal), alias legales, acciones de checkout y APIs existentes. Carrito y favoritos usan localStorage; compra mediante modal, reserva, Yape/Plin/transferencia y WhatsApp. No se alteran contratos de pedidos ni pagos.

Componentes reutilizables: Navbar, Footer, ProductCard, ProductGallery, QuickViewModal, CheckoutModal, filtros y paginación. Problemas: colores rígidos; marca inconsistente; controles solo en hover; falta de manejo de foco y Escape en overlays; carrusel automático sin pausa; imágenes originales sin tamaños adaptativos; moneda incorrecta en búsqueda; filtros no reinician page; conteo paginado usa longitud de página. No hay columnas species/rarity: buscar especie por nombre y filtrar etiqueta real (badge), sin inventar taxonomía.

Administración: métricas con proyecciones presentadas como ventas cuando faltan órdenes; corregir estado vacío. La autorización y políticas Supabase requieren auditoría específica de seguridad; no se modifica autenticación en esta intervención.

## Plan y criterios de avance
1. Base: tokens de color, superficie, contraste, tipografía editorial local y espaciado; tema sistema/claro/oscuro persistente antes de pintar; foco y movimiento reducido. Verificar tipos.
2. Escaparate: hero editorial con imágenes existentes, controles manuales y pausa, tarjetas con acciones táctiles visibles, navegación y footer consistentes. Sin dependencias nuevas. Verificar tipos y compilación.
3. Compra: búsqueda completa por nombre, filtros acumulables por categoría/precio/stock/etiqueta, paginación correcta, galería, foco contenido y restaurado en diálogos. Mantener acciones de pago. Verificar estática y flujos sin crear pedidos reales.
4. Calidad: build, comparación de activos, respuestas HTTP si el entorno lo permite. No afirmar Lighthouse/Core Web Vitals sin navegador y datos reales accesibles.

## Sistema visual
Bosque #143c2f, marfil #f6f4ec, salvia #dce5d6, arcilla #ad674b. Oscuro: fondo #101b16, superficie #19271f, texto #edf1e7, acento #b9d1a5. Georgia editorial, sistema sans para interfaz: cero descargas tipográficas. Escala espacial de 4 px. Contenedores de 1280 px, composición editorial con imágenes amplias y bordes discretos. Movimiento CSS de opacidad/transform; no Three.js/GSAP porque no resuelven una necesidad de compra.

## Medición
Se registrarán resultados verificables al finalizar. Las métricas de laboratorio deben obtenerse con el mismo equipo, modo producción, datos, red y viewport antes/después. Los bytes de compilación no equivalen a LCP, CLS o INP.

## Cierre de implementación
Sistema visual aplicado a las rutas existentes, hero editorial, imágenes adaptativas, vista rápida diferida, filtros y búsqueda completa, paginación SQL, mejoras de teclado/checkout y administración sin ventas inventadas. Consultas independientes paralelizadas. Ver `QA.md` para resultados, evidencias, comparación de rendimiento y tareas que requieren Supabase accesible. No hay dependencias nuevas ni publicación.
