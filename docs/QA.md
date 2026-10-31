# Verificación del rediseño — 29 de octubre de 2026

## Resultados
- `npx tsc --noEmit`: aprobado antes y después de la implementación.
- ESLint de los seis componentes nuevos o reescritos: aprobado sin errores ni advertencias. No implica que el lint histórico completo esté limpio.
- Compilación de etapa: aprobada (Next.js 16.4.2 / Turbopack). La primera ejecución dentro del sandbox falló por restricción al abrir puertos; fuera del sandbox compiló. Resultado de compilación final al pie.
- Chrome headless local con perfil temporal, sin paquetes adicionales: sin desbordamiento horizontal a 360, 390, 768 y 1440 px en portada y catálogo.
- Oscuro: fondo calculado rgb(16,27,22), texto rgb(237,241,231), superficies y textos de navegación adaptados. Preferencia `dark` persistente después de recargar. Claro verificado en capturas. Modo sistema mediante media query.
- Menú móvil y carrito: foco contenido, cierre con Escape. Retorno al botón del carrito aprobado al enfocar el disparador como una interacción real. La primera prueba con `.click()` sintético sin enfocar el botón devolvió null; no representa la navegación por teclado.
- Buscador móvil: foco inicial en `q`, cierre con Escape. Formularios permiten enviar a la búsqueda completa.
- Movimiento reducido: media query activada, duración de entrada calculada 0.00001 s.
- Carrito temporal exclusivamente en localStorage del perfil QA: persistencia al recargar, subtotal de dos unidades, incremento hasta stock 3 y botón deshabilitado al alcanzar el límite. Fixture eliminado; no se escribió en Supabase ni se envió un pedido.
- Checkout: abre con foco contenido, nueve campos con etiquetas asociadas. No se comprobó una transferencia, registro real ni envío de WhatsApp.
- Filtros: categoría reinicia `page` y conserva `q`, `badge`, `inStock` y `price`. El selector de prueba inicial tomaba el enlace fijo del menú móvil; se corrigió a los enlaces dentro de `main` y todas las comprobaciones pasaron.
- HTTP: inicio, deseos y dos páginas legales respondieron 200. Catálogo agotó 25 s en la primera comprobación de streaming; la navegación posterior mostró filtros y mensaje de error explícito.
- Imagen de respaldo inicial devolvía 404. Se reutilizó otra URL existente del proyecto, verificada HTTP 200; Chrome confirmó imagen optimizada con ancho natural 390 y variante solicitada de 640 px.

## Límites y pendientes
El hostname configurado para Supabase no resuelve (`ENOTFOUND`), incluso con acceso de red fuera del sandbox. No se sustituyeron productos por datos ficticios. Pendiente con conectividad restablecida: verificar categorías/productos reales, cantidades y orden SQL, varias páginas de resultados, detalle/galería con datos, favoritos desde tarjeta, vista rápida, métodos de pago configurados, pedidos y administración. La revisión visual disponible cubre portada con contenido de respaldo y estados vacíos/de error. No certifica conformidad WCAG 2.2 AA: faltan auditoría completa de contraste/lector de pantalla y pruebas en dispositivos táctiles físicos.

## Rendimiento: comparación verificable

| Aspecto | Antes | Después |
| --- | --- | --- |
| Imágenes hero en DOM | Todas las diapositivas con `<img>` | Solo diapositiva activa con `next/image`, `sizes` y preload inicial |
| Fotos de tarjetas/colecciones/galería | Original remoto sin variantes adaptativas | Variantes del optimizador para hosts conocidos; URLs externas conservadas sin optimización |
| Vista rápida | Importada y montada por cada tarjeta cerrada | Import dinámico; montaje al abrir |
| Consultas independientes de inicio | Productos y visibilidad secuenciales | En paralelo |
| Consultas de categorías y etiquetas | En serie | En paralelo |
| Consultas de métricas admin | Cuatro en serie | En paralelo |
| Fuentes y librerías de animación añadidas | — | Cero |
| Animación automática del hero | Cada 5 s sin pausa | Manual por defecto; reproducción optativa, pausa al interactuar y con movimiento reducido |
| LCP / CLS / INP / Lighthouse | Sin línea base válida | Pendientes; no se atribuyen porcentajes de mejora |

Las capturas son del servidor de desarrollo, no sirven como benchmark de producción. Repetir tres mediciones en producción con datos accesibles, mismo viewport y red, comparar medianas; medir campo para INP. El fallo DNS domina los tiempos actuales.

## Archivos
- `src/app/globals.css`: tokens, claro/oscuro/sistema, tipografía, composición editorial, acciones táctiles y movimiento reducido.
- `src/app/layout.tsx`, `src/components/ThemeToggle.tsx`: preferencia persistente antes de pintar y salto al contenido.
- `src/components/Home/HeroCarousel.tsx`: composición, controles, pausa y respeto por destino configurado.
- `src/components/BotanicalImage.tsx`: optimización adaptable conservando hosts externos.
- `src/components/Navbar.tsx`, `useDialog.ts`, `QuickViewModal.tsx`, `CheckoutModal.tsx`: overlays, foco, Escape, etiquetado y variantes reales.
- `src/components/ProductCard.tsx`, `ProductGallery.tsx`, `ToastNotification.tsx`: imágenes, acciones, feedback y moneda.
- `src/components/LiveSearch.tsx`: debounce, descarte de respuestas obsoletas, exclusión de productos pausados, estado de error y búsqueda completa en soles.
- `src/app/page.tsx`, `src/app/catalogo/page.tsx`, `src/components/Home/CatalogDiscovery.tsx`, filtros: portada, búsqueda, etiquetas reales, conteo SQL y reinicio de paginación.
- `src/app/admin/page.tsx`, `src/components/Admin/AdminNav.tsx`: consultas concurrentes, tema y estado de ventas vacío sin proyecciones ficticias.
- Rutas de detalle, deseos, legales y demás componentes: superficies/textos semánticos compartidos. No se modificaron APIs, migraciones, acciones de pago ni dependencias.

Capturas: [escritorio](qa/desktop.png), [móvil](qa/mobile.png). Evidencia estructurada en `docs/qa/*.json`. Los scripts CDP y perfil temporal se usaron fuera del repositorio; no se instala infraestructura de pruebas en la aplicación.

Compilación de producción: aprobada, 22/22 páginas generadas; rutas existentes conservadas. Último ajuste de diálogos: liberar el bloqueo de scroll al cambiar a un breakpoint que oculta el overlay. TypeScript y lint específico aprobados tras ese ajuste.
