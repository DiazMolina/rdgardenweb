# R&D Garden — checklist de seguridad para actualizaciones

## Antes de fusionar

- [ ] Cada nueva lectura administrativa verifica `requireAdmin()` antes de acceder a datos.
- [ ] Cada Server Action privilegiada verifica identidad y rol por sí misma; no depende solo del layout o Proxy.
- [ ] El rol procede de `app_metadata` verificado o UUID permitido solo en servidor; nunca de metadata editable, email o formulario.
- [ ] IDs UUID, cantidades enteras acotadas, importes finitos y estados permitidos se validan en servidor.
- [ ] Consultas parametrizadas/tipadas; columnas de ordenamiento y nombres de objetos provienen de listas fijas.
- [ ] Sin SQL formado con entradas de usuario, incluso desde datos previamente almacenados.
- [ ] No hay asignación masiva de objetos de solicitud a tablas ni merges recursivos sin esquema.
- [ ] Texto de productos, clientes y ajustes se renderiza mediante React; JSON-LD usa `safeJson`.
- [ ] Las exportaciones codifican HTML y neutralizan fórmulas.
- [ ] URLs impiden esquemas ejecutables y credenciales; subidas futuras verifican tipo real, tamaño, extensión, almacenamiento y autorización.
- [ ] El cliente de servicio importa `server-only`; ninguna clave privada aparece en bundles o logs.
- [ ] Cambios de dependencias pasan `npm audit` y scanners disponibles; se revisan también dependencias transitivas.
- [ ] Se ejecutan `npm run test:security`, `npm run security:scan`, TypeScript, build y pruebas SQL cuando cambie comercio/DB.
- [ ] Pruebas dinámicas se limitan a loopback o staging expresamente autorizado; jamás seed/ataques sobre producción.

## Datos y checkout

- [ ] La función `secure_checkout` existe antes de publicar código dependiente de ella.
- [ ] Precios, nombres, embalaje, método de pago y disponibilidad se recuperan en servidor; nunca del total del navegador.
- [ ] Stock agregado por producto considera todas las variantes; filas bloqueadas antes de comprobar y decrementar.
- [ ] Orden, líneas, stock e idempotencia pertenecen a una única transacción.
- [ ] Un error revierte toda la operación y no se informa éxito parcial.
- [ ] La misma petición no se repite al reintentar; cambios de contenido/huella no recuperan otra respuesta.
- [ ] Se prueba concurrencia real multi-conexión, no solo ejecución serial en PostgreSQL embebido.
- [ ] El estado inicial es Pendiente y solo operaciones administrativas autorizadas cambian estado.
- [ ] El personal verifica pedido y pago bancario real; mensaje, screenshot o voucher no confirman automáticamente pago.
- [ ] Cualquier futuro webhook valida firma criptográfica sobre cuerpo original, ventana temporal e idempotencia.
- [ ] Se define expiración/cancelación de reservas y reposición de stock sin doble incremento.
- [ ] Contador persistente y control distribuido limitan abuso; solicitudes fallidas también tienen protección en ingress.

## Base de datos y permisos

- [ ] RLS activa en tablas expuestas; browser roles sin permisos de escritura comercial.
- [ ] Anon/authenticated no pueden leer pedidos, líneas, solicitudes idempotentes ni configuración de despacho privada.
- [ ] Productos no publicados y pausados no aparecen tampoco por URL directa/API/metadatos.
- [ ] Se comprueban políticas restrictivas frente a políticas permisivas históricas.
- [ ] Solo service_role ejecuta RPC privilegiada; ningún grant PUBLIC accidental.
- [ ] Funciones SECURITY DEFINER fijan search_path y cualifican objetos; privilegios de creación de objetos revisados.
- [ ] CHECKs NOT VALID se validan después de revisar anomalías sin modificar clientes automáticamente.
- [ ] Se revisan tablas históricas, views, funciones, buckets y esquemas adicionales del entorno real.
- [ ] Backups, restauración y retención de pedidos/ledger están definidos y probados.

## Identidad, sesiones y servidor

- [ ] Cuenta admin real provisionada por personal autorizado; MFA y recuperación probados.
- [ ] Cookies HttpOnly, Secure en producción, SameSite=Lax o más estricto compatible; logout/refresh/revocación verificados.
- [ ] Login devuelve errores genéricos y rate limit distribuido evita fuerza bruta y enumeración.
- [ ] Cabeceras de IP no son controlables por el cliente; `TRUST_PROXY_IP_HEADERS` solo con ingress configurado.
- [ ] Server Actions rechazan Origin ajeno; toda API autenticada de escritura implementa defensa CSRF.
- [ ] CORS no permite orígenes/credenciales arbitrarios.
- [ ] APIs diagnósticas no devuelven pedidos, tokens o trazas; respuestas privadas no se cachean.
- [ ] GET no muta datos; seed únicamente en base local y con bandera explícita, bloqueado en producción.
- [ ] CSP aplica nonce impredecible por respuesta y bloquea scripts/eventos inyectados; scripts legítimos funcionan.
- [ ] Sin unsafe-eval en producción; excepciones CSP de estilos/imágenes revisadas.
- [ ] HTTPS/TLS y HSTS verificados en ingress/CDN real, junto con nosniff, DENY, Referrer-Policy y Permissions-Policy.
- [ ] Logs y auditoría de cambios administrativos omiten secretos y PII innecesaria; alertas operativas disponibles.

## Cierre de una auditoría

- [ ] El informe distingue inspección, prueba local, simulaciones y verificación del entorno remoto.
- [ ] No se atribuyen resultados a scanners que no se ejecutaron ni se anuncia un arreglo sin regresión.
- [ ] Evidencias reproducibles no contienen credenciales completas ni datos de clientes.
- [ ] Si hay evidencia de compromiso, rotación y respuesta a incidentes preceden la limpieza coordinada del historial.
- [ ] Riesgos residuales, responsables y condiciones pendientes de despliegue quedan registrados.
