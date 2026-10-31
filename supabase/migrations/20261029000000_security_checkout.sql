-- Apply in authorized staging first. This migration changes no existing customer rows.
BEGIN;

-- Legacy tables are unused by the current app. Deny browser access if present.
-- Dynamic identifiers come only from this fixed allowlist, never from request data.
DO $legacy$
DECLARE relation text;
BEGIN
  FOREACH relation IN ARRAY ARRAY['categorias', 'productos', 'variantes'] LOOP
    IF to_regclass(format('public.%I', relation)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', relation);
      EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated', relation);
    END IF;
  END LOOP;
END;
$legacy$;

ALTER TABLE public.products ADD CONSTRAINT security_stock CHECK (stock >= 0) NOT VALID;
ALTER TABLE public.products ADD CONSTRAINT security_price CHECK (price >= 0 AND price <= 1000000) NOT VALID;
ALTER TABLE public.order_items ADD CONSTRAINT security_quantity CHECK (quantity BETWEEN 1 AND 100) NOT VALID;
ALTER TABLE public.order_items ADD CONSTRAINT security_line_price CHECK (price >= 0 AND price <= 1000000) NOT VALID;
ALTER TABLE public.orders ADD CONSTRAINT security_total CHECK (total_amount >= 0) NOT VALID;

CREATE TABLE public.checkout_requests (
  request_id uuid PRIMARY KEY,
  fingerprint text NOT NULL,
  payload_hash text NOT NULL,
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX checkout_requests_rate_idx ON public.checkout_requests (fingerprint, created_at);
ALTER TABLE public.checkout_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.checkout_requests FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.checkout_requests TO service_role;

-- Explicit privilege boundary: browser roles cannot mutate commerce tables.
REVOKE ALL ON public.products, public.categories, public.hero_slides, public.site_settings,
  public.orders, public.order_items FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.products, public.categories, public.hero_slides, public.site_settings TO anon, authenticated;
GRANT ALL ON public.products, public.categories, public.hero_slides, public.site_settings,
  public.orders, public.order_items TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Restrictive policies remain effective if older permissive policies exist remotely.
CREATE POLICY products_public_read ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY products_visibility_boundary ON public.products AS RESTRICTIVE FOR SELECT TO anon, authenticated
  USING (is_published IS NOT FALSE AND NOT EXISTS (
    SELECT 1 FROM public.site_settings s WHERE s.key = 'product_visibility_' || products.id::text AND s.value = 'false'
  ));
CREATE POLICY categories_public_read ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY slides_public_read ON public.hero_slides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY settings_public_read ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY settings_visibility_boundary ON public.site_settings AS RESTRICTIVE FOR SELECT TO anon, authenticated
  USING (key IN (
    'contact_phone', 'announcement_bar', 'catalog_title', 'catalog_subtitle', 'featured_title', 'featured_subtitle',
    'whatsapp_link', 'whatsapp_button_text', 'packaging_fee_enabled', 'packaging_fee_per_item',
    'payment_yape_enabled', 'payment_yape_number', 'payment_yape_name', 'payment_plin_enabled',
    'payment_plin_number', 'payment_plin_banks', 'payment_transfer_enabled', 'payment_transfer_title', 'payment_transfer_details'
  ) OR key LIKE 'terms\_%' ESCAPE '\' OR key LIKE 'privacy\_%' ESCAPE '\'
    OR key LIKE 'product\_visibility\_%' ESCAPE '\' OR key LIKE 'product\_images\_%' ESCAPE '\');
CREATE POLICY orders_private_boundary ON public.orders AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY order_items_private_boundary ON public.order_items AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE FUNCTION public.secure_checkout(
  p_request_id uuid, p_fingerprint text, p_customer jsonb, p_items jsonb, p_payment_method text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  cached public.checkout_requests%ROWTYPE;
  payload_hash text;
  line jsonb;
  product public.products%ROWTYPE;
  needed integer;
  subtotal numeric := 0;
  packaging numeric := 0;
  fee numeric := 0;
  unit_count integer := 0;
  line_price numeric;
  selected text;
  result_items jsonb := '[]'::jsonb;
  result jsonb;
  order_id uuid;
  payment_key text;
BEGIN
  IF p_request_id IS NULL OR p_fingerprint IS NULL OR length(p_fingerprint) <> 64
    OR jsonb_typeof(p_customer) IS DISTINCT FROM 'object'
    OR jsonb_typeof(p_items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Invalid checkout';
  END IF;
  IF jsonb_array_length(p_items) NOT BETWEEN 1 AND 50
    OR length(coalesce(p_customer->>'customer_name', '')) NOT BETWEEN 1 AND 160
    OR length(coalesce(p_customer->>'customer_phone', '')) NOT BETWEEN 6 AND 30
    OR length(coalesce(p_customer->>'shipping_address', '')) NOT BETWEEN 1 AND 1000
    OR length(coalesce(p_customer->>'customer_email', '')) > 254
    OR length(coalesce(p_customer->>'customer_dni', '')) > 30 THEN
    RAISE EXCEPTION 'Invalid checkout';
  END IF;
  payment_key := CASE p_payment_method WHEN 'Yape' THEN 'payment_yape_enabled' WHEN 'Plin' THEN 'payment_plin_enabled'
    WHEN 'Transferencia Bancaria' THEN 'payment_transfer_enabled' ELSE NULL END;
  IF payment_key IS NULL OR EXISTS (SELECT 1 FROM public.site_settings WHERE key = payment_key AND value = 'false') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;
  payload_hash := encode(sha256(convert_to(jsonb_build_object('customer', p_customer, 'items', p_items, 'payment', p_payment_method)::text, 'UTF8')), 'hex');
  -- Serialize idempotency requests, including simultaneous requests for the same key.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  SELECT * INTO cached FROM public.checkout_requests WHERE request_id = p_request_id;
  IF FOUND THEN
    IF cached.payload_hash <> payload_hash OR cached.fingerprint <> p_fingerprint THEN RAISE EXCEPTION 'Idempotency mismatch'; END IF;
    RETURN cached.response;
  END IF;
  -- Serialize the rate counter across application instances.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_fingerprint, 1));
  IF (SELECT count(*) FROM public.checkout_requests WHERE fingerprint = p_fingerprint AND created_at > now() - interval '1 minute') >= 10 THEN
    RAISE EXCEPTION 'Rate limit';
  END IF;
  FOR line IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    IF jsonb_typeof(line) <> 'object' OR coalesce(line->>'quantity', '') !~ '^[1-9][0-9]{0,2}$'
      OR (line->>'quantity')::integer > 100 OR length(coalesce(line->>'selectedSize', 'Standard')) NOT BETWEEN 1 AND 100 THEN
      RAISE EXCEPTION 'Invalid order line';
    END IF;
    -- Cast rejects injection strings as invalid UUIDs, never as SQL.
    PERFORM (line->>'id')::uuid;
    IF line->>'id' IS NULL THEN RAISE EXCEPTION 'Invalid product'; END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_items) x GROUP BY (x->>'id')::uuid, coalesce(x->>'selectedSize', 'Standard') HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Duplicate order line';
  END IF;
  -- Lock in deterministic order before checking aggregate stock across variants.
  PERFORM 1 FROM public.products WHERE id IN (SELECT (x->>'id')::uuid FROM jsonb_array_elements(p_items) x) ORDER BY id FOR UPDATE;
  FOR line IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    SELECT * INTO product FROM public.products WHERE id = (line->>'id')::uuid;
    IF NOT FOUND OR product.is_published IS FALSE OR product.stock IS NULL OR product.price IS NULL
      OR product.price < 0 OR product.price > 1000000
      OR EXISTS (SELECT 1 FROM public.site_settings WHERE key = 'product_visibility_' || product.id::text AND value = 'false') THEN
      RAISE EXCEPTION 'Unavailable product';
    END IF;
    selected := coalesce(line->>'selectedSize', 'Standard');
    IF (cardinality(product.sizes) > 0 AND NOT selected = ANY(product.sizes))
      OR (coalesce(cardinality(product.sizes), 0) = 0 AND selected <> 'Standard') THEN RAISE EXCEPTION 'Invalid variant'; END IF;
    SELECT sum((x->>'quantity')::integer) INTO needed FROM jsonb_array_elements(p_items) x WHERE (x->>'id')::uuid = product.id;
    IF needed > product.stock THEN RAISE EXCEPTION 'Insufficient stock'; END IF;
    line_price := round(product.price, 2);
    subtotal := subtotal + line_price * (line->>'quantity')::integer;
    unit_count := unit_count + (line->>'quantity')::integer;
    result_items := result_items || jsonb_build_array(jsonb_build_object('id', product.id, 'name', product.name, 'price', line_price,
      'quantity', (line->>'quantity')::integer, 'selectedSize', selected));
  END LOOP;
  IF EXISTS (SELECT 1 FROM public.site_settings WHERE key = 'packaging_fee_enabled' AND value = 'true') THEN
    SELECT coalesce((SELECT value::numeric FROM public.site_settings WHERE key = 'packaging_fee_per_item'), 3) INTO fee;
    IF fee < 0 OR fee > 1000000 THEN RAISE EXCEPTION 'Invalid packaging fee'; END IF;
    packaging := round(fee, 2) * unit_count;
  END IF;
  INSERT INTO public.orders (customer_name, customer_email, customer_phone, customer_dni, shipping_address, total_amount, status)
    VALUES (p_customer->>'customer_name', coalesce(p_customer->>'customer_email', ''), p_customer->>'customer_phone',
      coalesce(p_customer->>'customer_dni', ''), p_customer->>'shipping_address', subtotal + packaging, 'Pendiente') RETURNING id INTO order_id;
  INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price, selected_size)
    SELECT order_id, (x->>'id')::uuid, x->>'name', (x->>'quantity')::integer, (x->>'price')::numeric, x->>'selectedSize'
    FROM jsonb_array_elements(result_items) x;
  UPDATE public.products p SET stock = p.stock - requested.qty FROM (
    SELECT (x->>'id')::uuid AS id, sum((x->>'quantity')::integer)::integer AS qty FROM jsonb_array_elements(p_items) x GROUP BY (x->>'id')::uuid
  ) requested WHERE p.id = requested.id;
  result := jsonb_build_object('orderId', order_id, 'totalAmount', subtotal + packaging, 'subtotal', subtotal, 'packagingFee', packaging, 'items', result_items);
  INSERT INTO public.checkout_requests (request_id, fingerprint, payload_hash, response) VALUES (p_request_id, p_fingerprint, payload_hash, result);
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.secure_checkout(uuid, text, jsonb, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.secure_checkout(uuid, text, jsonb, jsonb, text) TO service_role;
COMMIT;
