# R&D Garden — auditoría de seguridad

**Fecha:** 29 de octubre de 2026. **Alcance:** repositorio local, compilación de producción servida en localhost y PostgreSQL embebido aislado. No se ejecutaron ataques contra producción, migraciones remotas ni modificaciones de clientes reales. Se conservaron los cambios de interfaz que ya existían.

## Resumen ejecutivo

Se encontraron rutas administrativas sin autenticación, acciones con privilegios de servicio sin autorización, exposición potencial de pedidos completos, generación de datos mediante GET y un checkout que confiaba en precios y cantidades del navegador. Las migraciones históricas no habilitaban RLS para las tablas comerciales. También existían dos salidas de contenido sin codificación contextual: JSON-LD y exportación HTML para Excel.

Se implementaron controles de servidor, login/logout mediante Supabase Auth, validación de entradas, serialización segura, CSP con nonce, cabeceras y un checkout transaccional. **Las correcciones de base de datos están preparadas y probadas en PostgreSQL embebido; NO están aplicadas ni verificadas en Supabase remoto. No desplegar únicamente el código del checkout sin su migración.** El código falla de forma cerrada si falta la nueva función SQL, en lugar de usar el camino vulnerable anterior.

Resultados: 16 pruebas de aplicación, 14 pruebas SQL contabilizando la prueba contenedora y sus 13 subpruebas, pruebas dinámicas locales, TypeScript, compilación de producción y lint específico aprobados. `npm audit`: 0 avisos conocidos en la consulta realizada. Esto no demuestra ausencia de otras vulnerabilidades.

## Referencias y criterio

Se usaron [OWASP Top 10:2025](https://top10.owasp.org/2025/0x00_2025-Introduction/), [ASVS 5.0](https://asvs.owasp.org/), [OWASP API Security Top 10:2023](https://api-security.owasp.org/editions/2023/en/0x00-header/), y las guías de [SQL Injection](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) y [XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet). Alineación por dominios de autorización, autenticación, sesiones, validación, lógica de negocio, salida y configuración; no es una certificación ASVS ni una verificación completa de un nivel.

Los CVSS indicados son estimaciones CVSS v3.1 del comportamiento original observado en código. No se explotó el sistema anterior ni se constató exposición en un despliegue real. Los hallazgos dependientes de infraestructura se mantienen como riesgos pendientes, sin puntuación artificial.

## Arquitectura revisada

- Next.js 16.4.2 App Router, React 19.3 y Tailwind 4; Server Components, Server Actions y Route Handlers. Documentación local de Next leída antes de modificar autenticación, proxy, cookies y CSP.
- Supabase SSR para sesión/catálogo; cliente público para búsqueda; cliente de servicio exclusivamente servidor para administración y pedidos. No se encontró uso operativo de Prisma ni consultas `pg.query()` en la aplicación.
- PostgreSQL: `products`, `categories`, `hero_slides`, `site_settings`, `orders`, `order_items`; esquema histórico adicional `categorias`, `productos`, `variantes`. Nueva tabla privada `checkout_requests` para idempotencia y contador de pedidos.
- Carrito y favoritos en localStorage, manipulables por diseño. Se tratan como entrada no confiable.
- Pagos manuales Yape/Plin/transferencia y envío de constancia por WhatsApp. No hay webhooks ni integración de confirmación bancaria. Una reserva queda `Pendiente`; abrir WhatsApp no acredita pago.
- No existían inicio/cierre de sesión, registro, recuperación ni gestión de usuarios. Se agregó login/logout administrativo con Supabase Auth. La provisión y recuperación se delegan al proveedor, no se inventan cuentas ni contraseñas.

## Inventario de superficies de ataque

| Superficie | Entrada y acceso esperado | Control actual |
| --- | --- | --- |
| `/`, `/catalogo`, `/producto/[id]`, `/deseos` | Público: búsqueda, filtros, ID, localStorage | Consultas tipadas, codificación React/JSON, RLS preparada |
| Rutas legales y alias, robots, sitemap | Público: configuración y metadatos | Texto React; configuración pública limitada por RLS preparada |
| `/login` | Email/contraseña | Supabase Auth; error genérico; límite local de intentos |
| `/admin`, `new`, `edit/[id]`, `orders`, `categories`, `carousel`, `settings`, `terms`, `privacy` | Solo administrador | Layout y cada cargador de datos verifican sesión/rol |
| 16 acciones administrativas | FormData, IDs, stock, estados y guías | `requireAdmin()` antes de acceso privilegiado; validación y listas permitidas |
| `getStorePhone`, `getPackagingSettings`, `getPaymentSettings` | Acciones públicas de lectura | Selección fija de claves públicas, sin parámetros arbitrarios |
| `submitOrder` | Cliente, IDs/variantes/cantidades, UUID de petición | Validación; una RPC privada con precios del servidor, stock, idempotencia y rate limit |
| Login/logout | Server Actions | Sesión del proveedor, cookies HttpOnly; comprobación de Origin de Next |
| GET `/api/migrate` | Diagnóstico administrativo | 401 sin sesión; solo nombres de columnas, sin muestras de pedidos |
| GET/POST `/api/seed` | Herramienta de desarrollo | GET 405; POST exige admin, Origin propio, bandera y base en loopback; bloqueado en producción |
| Imágenes externas | URLs del administrador | HTTPS, validación de protocolo/hosts privados; optimizador con hosts permitidos y Supabase exacto |
| Exportación de pedidos | Contenido persistido de clientes | Codificación HTML y prefijo literal contra fórmulas |
| Claves y sesiones | Variables de entorno/cookies | `server-only`, sin persistencia en cliente de servicio, cookies protegidas |

El cliente Supabase público utiliza la clave anónima/publicable prevista por el proveedor. No equivale a una clave de servicio; su seguridad depende de permisos y RLS.

## Hallazgos, evidencia y correcciones

### SEC-01 — Administración y acciones privilegiadas sin autorización — crítica

**Antes:** `src/app/admin/**/page.tsx` consultaba con `supabaseAdmin`; las 16 acciones de productos, categorías, carrusel, pedidos, textos y ajustes no comprobaban identidad. Ocultar el enlace o conocer el identificador de una Server Action no constituye autorización. Se podían cambiar existencias, información de pago o estados de pedidos con privilegios de servicio.

**CVSS estimado:** 9.8, `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`. OWASP Broken Access Control y API Broken Function Level Authorization.

**Cambio:** `src/lib/security/admin.ts`, `src/app/admin/layout.tsx`, cada cargador y cada acción. `auth.getUser()` verifica la identidad contra Supabase. Solo `app_metadata.role === 'admin'` o UUID exacto en `ADMIN_USER_IDS` autoriza; nunca `user_metadata`, email enviado ni rol del formulario. Se agregó `/login` y cierre de sesión. Cookie HttpOnly, Secure en producción, SameSite=Lax; renovación en Proxy para las rutas de autenticación.

**Verificación:** las 16 acciones ejecutadas con proveedor de sesión simulado rechazan antes de cualquier acceso a DB; rol de usuario editable no autoriza; IDs/stock/estados inválidos también se rechazan con admin simulado. HTTP local `/admin`, `/admin/orders`, `/admin/settings`: 307 a `/login`. Sesión administrativa real, recuperación y revocación remota pendientes por conectividad.

### SEC-02 — API de diagnóstico exponía pedidos completos — alta

**Antes:** GET `src/app/api/migrate/route.ts` devolvía `sampleOrder` mediante una consulta privilegiada sin autenticación: nombre, dirección, teléfono y demás columnas del primer pedido.

**CVSS estimado:** 7.5, `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`.

**Cambio:** autorización previa; respuesta limitada a nombres de columnas y `Cache-Control: private, no-store`. Sin mensajes internos ni registros completos.

**Verificación:** prueba del handler confirma 401 y cero consultas para anónimo; HTTP local confirma 401 sin `sampleOrder` en respuesta. No se descargó un pedido real como prueba.

### SEC-03 — Seed escribía datos mediante GET público — alta

**Antes:** GET `src/app/api/seed/route.ts` insertaba 20 productos usando service role. Susceptible de invocación pública y ejecución accidental por precarga/enlaces.

**Cambio:** GET devuelve 405. POST exige administrador y Origin propio; únicamente `NODE_ENV=development`, `ENABLE_LOCAL_SEED=true` y hostname de Supabase en `localhost`, `127.0.0.1` o `::1`. No se modifica un backend remoto mediante esta herramienta.

**Verificación:** handler y HTTP: GET 405, POST anónimo 401 y cero escrituras. No se ejecutó el seed sobre datos reales. La funcionalidad de desarrollo queda conservada bajo condiciones explícitas.

### SEC-04 — Precios, cantidades y total controlados por el comprador — crítica

**Antes:** `submitOrder` insertaba `orderData.total_amount`, `item.price`, `item.name` y cantidades recibidas. La validación del formulario y localStorage se podían omitir. Un importe negativo o nominal y cantidades arbitrarias alcanzaban la operación privilegiada.

**Cambio:** `src/lib/security/validation.ts`, `src/app/checkout/actions.ts`, `src/components/CheckoutModal.tsx` y migración `20261029000000_security_checkout.sql`. El servidor solo acepta campos personales explícitos, IDs UUID, variantes y cantidades enteras entre 1 y 100; máximo 50 líneas, sin duplicados. Descarta precio, nombre, descuentos, estado e importe del navegador. SQL consulta precio/stock/publicación/variante, calcula embalaje desde ajustes y verifica método de pago habilitado. El resumen de éxito y mensaje inicial de WhatsApp usan la respuesta canónica del servidor.

**Verificación:** tests rechazan valores negativos, cero, fracciones, exceso y duplicados. SQL prueba precio/nombre manipulados, embalaje real y método deshabilitado. Un comprador siempre puede editar un mensaje de WhatsApp; el personal debe cotejarlo con el pedido de la DB y con la transacción bancaria.

**Estado:** código y SQL probados localmente; aplicación remota de migración pendiente. No se anuncia un arreglo en producción.

### SEC-05 — Pedido parcial, sobreventa y duplicados — alta

**Antes:** pedido, líneas y descuentos de stock se ejecutaban en llamadas independientes; errores de ítems no invalidaban el éxito. Stock se leía y escribía sin bloqueo; repetir la solicitud creaba otra orden.

**Cambio:** una función PostgreSQL transaccional, bloqueo de filas de productos en orden estable, comprobación de stock agregado entre tamaños, UUID idempotente y hash del contenido. Bloqueo advisory por petición evita reejecuciones simultáneas de una misma clave; el contador también se serializa por huella. No hay ruta de respaldo no transaccional.

**Verificación:** reintento devuelve la misma orden y stock; reutilizar clave con otro contenido/huella se rechaza; un trigger de fallo exclusivamente en la DB de pruebas demuestra rollback de pedido y stock. PostgreSQL embebido serializa conexiones: **la carrera real entre varias conexiones no se ejercitó**. La revisión de bloqueos y estas regresiones no sustituyen esa prueba de staging.

### SEC-06 — Falta de RLS y permisos mínimos en migraciones — crítica potencial

**Evidencia:** las migraciones históricas no contenían políticas ni habilitación RLS para las tablas comerciales. No se inspeccionaron permisos efectivos en Supabase remoto; no se afirma que todos sus datos estén públicamente expuestos.

**Cambio preparado:** migración revoca permisos de escritura a PUBLIC/anon/authenticated, protege pedidos y líneas de todo acceso por esos roles, habilita RLS, oculta plantas pausadas/no publicadas y claves privadas como `order_shipping_*`. Las políticas restrictivas limitan políticas permisivas que pudieran existir. Tablas históricas no utilizadas quedan cerradas al navegador si existen. Solo service_role puede ejecutar `secure_checkout`; su cliente tiene `server-only`.

**Verificación:** aplicación completa de las migraciones en DB efímera; roles anon/authenticated no pueden leer pedidos, mutar catálogo, leer tablas históricas ni ejecutar RPC. Se prueban visibilidad de plantas/ajustes y acceso comercial de service_role. Los CHECK nuevos son NOT VALID para no validar/modificar filas históricas automáticamente; deben revisar datos y validarlos posteriormente.

**Estado:** pendiente de despliegue y comprobación de permisos reales, políticas existentes, funciones y buckets remotos.

### SEC-07 — XSS en JSON-LD de producto — alta

**Antes:** `dangerouslySetInnerHTML` recibía `JSON.stringify` de campos de producto. Una cadena `</script>` termina el elemento a nivel HTML aunque sea JSON válido; podía introducir otro script. El tema de layout utiliza una cadena constante y no tenía ese mismo origen no confiable.

**Cambio:** `safeJson()` codifica `<`, `>`, `&`, U+2028/U+2029; aplicada a JSON-LD del producto, breadcrumbs e inicio. Contenido normal sigue como texto React, sin habilitar HTML enriquecido. Nonces en scripts legítimos.

**Verificación:** payload de cierre y script queda sin `<` literal y se recupera con `JSON.parse`. Chrome local con HTML interceptado solo para QA y la CSP real bloquea script y atributo de evento inyectados, pero ejecuta el script legítimo del tema. La primera prueba mediante ejecución privilegiada de DevTools no era válida como contexto de ataque; fue reemplazada por inserción de HTML mediante el parser.

### SEC-08 — HTML y fórmulas en exportación de pedidos — alta

**Antes:** `src/lib/exportExcel.ts` interpolaba campos del cliente directamente en un documento HTML `.xls`. Un cliente podía almacenar etiquetas activas o prefijos interpretables como fórmulas por una hoja de cálculo.

**Cambio:** codificación de caracteres HTML en campos exportados y prefijo literal para `=`, `+`, `-`, `@`, incluso tras espacios/controles iniciales. Revocación de URL temporal.

**Verificación:** pruebas de etiquetas y fórmulas pasan. La interpretación exacta del archivo se debe comprobar en las versiones de Excel/LibreOffice usadas por operaciones; no se ejecutaron esos programas.

### SEC-09 — Ausencia de límites de abuso y cabeceras — media/alta

**Cambio:** límite de login por proceso, error genérico, límite local para checkout y contador persistente en la RPC; CSP de scripts con nonce por petición, `strict-dynamic`, sin unsafe-eval en producción; nosniff, DENY, Referrer-Policy, Permissions-Policy y HSTS en producción. Se deshabilita X-Powered-By. Supabase permitido en optimizador por hostname exacto; sin HTTP ni hosts privados en nuevos formularios de imágenes.

**Verificación:** CSP/nonce único y sobrescritura de nonce de entrada, cookies y cabeceras por tests; Chrome verifica CSP y funcionamiento del tema; SQL rechaza el undécimo pedido completado por huella/minuto. Next rechaza una Server Action con Origin ajeno (HTTP 500, sin cookie emitida). Es su comportamiento de rechazo; no se ha cambiado a un falso éxito.

**Riesgos residuales:** rate limit de login y solicitudes fallidas es por instancia. No es una defensa distribuida completa. `TRUST_PROXY_IP_HEADERS` permanece desactivado por defecto; la huella es compartida conservadoramente. No habilitar esa variable sin un ingress que elimine/reemplace `x-real-ip` del cliente. Requiere límite en gateway/WAF antes de producción. CSP permite estilos inline para componentes existentes e imágenes HTTPS externas; no se anuncia como política máxima de aislamiento.

## SQL injection y otras clases examinadas

- No se encontró SQL crudo construido a partir de parámetros del usuario en el código operativo. Se utilizan métodos Supabase/PostgREST y una RPC tipada. Las pruebas de UUID incluyen variantes clásicas, booleanas/UNION y `pg_sleep`; fallan como datos inválidos, no se ejecutan. No es una prueba de carga/time-based sobre un servidor remoto.
- `sort` selecciona ramas de columnas fijas; no se acepta un identificador SQL libre. Filtros usan métodos tipados y valores; parámetros de URL no escalares se normalizan y la página se limita a 10.000. El campo `badge` usa igualdad. La construcción de filtros de IDs usa claves controladas por servidor; con RLS y autorización no es una consulta SQL concatenada.
- SQL nuevo usa parámetros y referencias cualificadas; la única sentencia dinámica es mantenimiento de tres identificadores de tabla de una lista literal fija, con `%I`. No hay entrada de solicitud en ese SQL. Datos persistidos se vuelven a validar/escapar al usarse: prueba de second-order en JSON/exportación.
- No hay intérprete de comandos, endpoints de archivos, carga binaria ni NoSQL en el runtime auditado. Formularios nuevos rechazan `File`; las imágenes son URLs. No se encontraron merges recursivos de objetos de usuario; checkout construye una lista explícita de campos, evitando mass assignment. Esto no equivale a garantizar las dependencias frente a prototype pollution.
- No hay `Access-Control-Allow-Origin: *` añadido ni acceso autenticado cross-origin autorizado. Next valida Origin en Server Actions y seed lo comprueba explícitamente. No hay webhooks para validar firmas, ni cupones/descuentos/portes automatizados existentes que se puedan auditar como funcionalidades reales.
- SSRF: no se halló un fetch genérico del servidor con destino de usuario. El optimizador de imágenes y los hosts permitidos siguen siendo superficie de revisión de infraestructura; no se probaron endpoints de metadatos ni DNS rebinding remotos.

## Herramientas y evidencias

| Herramienta | Resultado real |
| --- | --- |
| Revisión de código, `rg`, AST TypeScript | Inventario de consultas/handlers, guardas de todos los cargadores y acciones; ubicaciones en `docs/security/surface-locations.txt` |
| Node test runner + TypeScript VM | 16 pruebas aprobadas; `docs/security/unit-tests.txt` |
| PostgreSQL embebido PGlite temporal | 13 subpruebas SQL + contenedor, 14 tests aprobados; `docs/security/sql-tests.txt` |
| HTTP y Chrome/CDP local, producción | Denegación anónima, cabeceras, CSRF, CSP, tema y ancho móvil; `docs/security/dynamic.json` |
| `npm audit --json` | 0 vulnerabilidades conocidas en la respuesta; `docs/security/npm-audit.json` |
| Escáner regex propio | 1 commit accesible, 8 archivos históricos examinados, ninguna coincidencia; `.env.local` ignorado; comparación exacta de clave de servicio contra bundles cliente realizada y sin coincidencia; `docs/security/secrets-scan.json` |
| TypeScript, build y ESLint específico | Aprobados; el lint específico no implica limpiar todo el lint histórico |
| Semgrep, CodeQL, Gitleaks, OSV-Scanner, ZAP, Playwright | No disponibles/no ejecutados. Se usó Chrome/CDP sin instalar Playwright. No se atribuyen resultados a esas herramientas |
| Docker/Postgres de varias conexiones | Docker daemon no disponible; por eso se usó DB efímera WASM |

El escaneo de secretos no cubre todas las credenciales posibles, caches de herramientas/IDE, todas las ramas de un repositorio remoto ni configuraciones externas. No se imprimieron secretos completos. No hay evidencia obtenida aquí de que una credencial se haya filtrado. Si hubo exposición previa, revisar incidentes y rotar las credenciales afectadas; limpiar historial solo después de coordinar respaldos y rotación.

## Ejecución reproducible

```sh
npm run test:security
npm run security:scan
npx tsc --noEmit
npm run build
```

Para SQL, usar una instalación temporal fuera de las dependencias de aplicación y una DB completamente efímera:

```sh
npm install --prefix /private/tmp/rd-security-tools --no-save --ignore-scripts @electric-sql/pglite
SECURITY_PGLITE_MODULE=/private/tmp/rd-security-tools/node_modules/@electric-sql/pglite/dist/index.js npm run test:security:sql
```

El test crea roles/esquema/fixtures aislados. Para el esquema histórico, sustituye localmente la función UUID de extensión con un wrapper de `gen_random_uuid()`. No conecta con Supabase ni usa datos reales. No utilizar esta prueba como cliente de una base remota.

Prueba dinámica: iniciar `npm run start -- --port 3101`, Chrome con perfil temporal y `--remote-debugging-port=9334`, luego `npm run test:security:browser`. El script contiene únicamente destinos loopback, una credencial ficticia enviada a una petición CSRF que debe rechazarse, y una respuesta interceptada en el navegador para comprobar CSP. No registra pedidos. Cerrar los procesos de QA al terminar.

## Recomendaciones y orden de despliegue

1. Corregir la conectividad de Supabase en desarrollo/staging. El hostname configurado devuelve ENOTFOUND; no se cambió a otra base ni se crearon clientes ficticios en la aplicación.
2. Respaldar esquema, inspeccionar grants/policies existentes y desplegar la migración en staging autorizado. Revisar filas inválidas antes de `VALIDATE CONSTRAINT`, extensiones, backups, buckets y privilegios de funciones/views externas a este repositorio.
3. Proveer una cuenta administrativa real mediante Supabase y asignar `app_metadata.role=admin` desde una herramienta privilegiada o definir `ADMIN_USER_IDS` solo en servidor. No usar metadata editable del usuario. Configurar MFA, política de contraseñas, recuperación y expiración en el proveedor. [Supabase documenta hashing bcrypt con salt](https://supabase.com/docs/guides/auth/password-security); la aplicación no guarda hashes ni sustituye su hashing por uno casero.
4. Añadir rate limiting distribuido/antiabuso en el ingress y configurar IP real únicamente bajo cabecera reemplazada por el proxy confiable. Definir retención y limpieza de `checkout_requests` con una ventana de idempotencia documentada, sin borrar órdenes.
5. Ejecutar pruebas con varias conexiones de reserva del último stock y mismo UUID simultáneo; confirmar una sola operación y stock nunca negativo. Probar login/logout/refresh/usuario sin rol, detalle/favoritos/búsqueda y checkout de punta a punta con fixtures autorizadas. Verificar políticas efectivas desde roles anónimo, cliente y servicio.
6. Desplegar migración y aplicación de forma coordinada. La función nueva es requisito del checkout; la reversión no debe reactivar la implementación vulnerable. Mantener la herramienta seed bloqueada en producción.
7. Validar HTTPS y TLS en el balanceador real, HSTS, headers/CSP en CDN y ausencia de caché de datos privados. CSP por nonce convierte las páginas HTML en dinámicas; revisar costo/latencia/caché tras el despliegue.
8. Definir validación bancaria y procesos de cancelación/expiración de reservas, conciliación y reposición de stock. Un voucher o mensaje de WhatsApp no prueba el pago; no se implementó una pasarela inexistente.
9. Ejecutar scanners especializados disponibles en CI, monitoreo y auditoría de cambios administrativos con datos minimizados. Falta logging/auditoría persistente de operaciones, alertas y pruebas de restauración.

## Archivos modificados

- `src/lib/security/{admin,validation,output,rateLimit}.ts`: controles compartidos.
- `src/lib/supabaseAdmin.ts`, `supabaseServer.ts`: frontera servidor y cookies.
- `src/proxy.ts`, `next.config.ts`, `src/app/layout.tsx`: CSP, renovación, cabeceras y nonce.
- `src/app/login/*`, `src/app/admin/layout.tsx`, cargadores y `actions.ts` administrativos, `src/components/Admin/AdminNav.tsx`: acceso, rol y salida.
- `src/app/api/{migrate,seed}/route.ts`: diagnóstico y seed restringidos.
- `src/app/checkout/actions.ts`, `src/components/CheckoutModal.tsx`, migración SQL: importe canónico y transacción.
- `src/app/page.tsx`, `src/app/producto/[id]/page.tsx`, `src/lib/exportExcel.ts`, `src/components/BotanicalImage.tsx`: salidas y URLs.
- `tests/security*.mjs`, `scripts/security-scan.mjs`, scripts de `package.json`, `docs/security/*`: regresiones y evidencias. No se añadieron dependencias de runtime ni se alteraron los archivos de lock por esta auditoría.

**Conclusión:** controles críticos implementados y verificados dentro del alcance local. La seguridad efectiva de producción continúa condicionada al despliegue de la migración, cuentas/configuración reales y pruebas pendientes de infraestructura y concurrencia. No se declara el sistema 100% seguro.
