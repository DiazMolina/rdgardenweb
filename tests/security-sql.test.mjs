import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const modulePath = process.env.SECURITY_PGLITE_MODULE;
if (!modulePath) throw new Error('Set SECURITY_PGLITE_MODULE to an isolated @electric-sql/pglite module; never use a remote database.');
const { PGlite } = await import(pathToFileURL(modulePath).href);
const db = new PGlite();
await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE FUNCTION uuid_generate_v4() RETURNS uuid LANGUAGE sql AS $$ SELECT gen_random_uuid() $$;');
for (const name of (await fs.readdir('supabase/migrations')).filter(name => name.endsWith('.sql')).sort()) {
  await db.exec(await fs.readFile(`supabase/migrations/${name}`, 'utf8'));
}
const id = '11111111-1111-4111-8111-111111111111';
await db.query("INSERT INTO products(id,name,price,stock,sizes) VALUES ($1,'Fixture SQL aislada',25.25,10,ARRAY['S','M'])", [id]);
const customer = { customer_name: 'Cliente de prueba local', customer_email: '', customer_phone: '999999999', shipping_address: 'Dirección aislada de prueba', total_amount: 0.01 };
const fingerprint = 'a'.repeat(64);
let n = 0;
const requestId = () => `22222222-2222-4222-8222-${String(++n).padStart(12,'0')}`;
const items = (quantity = 1, selectedSize = 'S') => [{ id, quantity, selectedSize, price: 0.01, name: 'Nombre manipulado' }];
const checkout = async (lines = items(), key = requestId(), payment = 'Yape', cust = customer, fp = fingerprint) => {
  const rows = await db.query('SELECT secure_checkout($1::uuid,$2,$3::jsonb,$4::jsonb,$5) AS result', [key, fp, JSON.stringify(cust), JSON.stringify(lines), payment]);
  return rows.rows[0].result;
};
const stock = async () => (await db.query('SELECT stock FROM products WHERE id=$1',[id])).rows[0].stock;

// One connection serializes tests; true multi-connection race testing remains a staging gate.
test('database security regressions on isolated PostgreSQL', async t => {
  await t.test('server price and canonical name replace browser values', async () => {
    const order = await checkout();
    assert.equal(order.totalAmount,25.25); assert.equal(order.items[0].name,'Fixture SQL aislada'); assert.equal(order.items[0].price,25.25);
    assert.equal(await stock(),9);
  });
  await t.test('idempotent retry creates one order and decrements stock once', async () => {
    const key=requestId();const first=await checkout(items(),key);const remaining=await stock();
    const second=await checkout(items(),key);assert.deepEqual(second,first);assert.equal(await stock(),remaining);
    await assert.rejects(checkout(items(2),key),/Idempotency mismatch/);
  });
  await t.test('idempotency response is bound to server fingerprint', async () => {
    const key=requestId();await checkout(items(),key);
    await assert.rejects(checkout(items(),key,'Yape',customer,'b'.repeat(64)),/Idempotency mismatch/);
  });
  await t.test('negative, zero, fractional and excessive quantities fail', async () => {
    for(const q of [-1,0,1.5,101])await assert.rejects(checkout(items(q)));
  });
  await t.test('SQL injection strings in IDs are rejected without query execution', async () => {
    for(const payload of ["' OR 1=1 --", "1; SELECT pg_sleep(5)--", "' UNION SELECT NULL --"]){
      await assert.rejects(checkout([{id:payload,quantity:1,selectedSize:'S'}]));
    }
    assert.equal((await db.query('SELECT count(*)::int AS n FROM products WHERE id=$1',[id])).rows[0].n,1);
    const literal = "'; SELECT pg_sleep(5); DROP TABLE orders; --";
    const order = await checkout(items(), requestId(), 'Yape', { ...customer, customer_name: literal });
    assert.equal((await db.query('SELECT customer_name FROM orders WHERE id=$1', [order.orderId])).rows[0].customer_name, literal);
  });
  await t.test('duplicates, unknown variants and aggregate overstock across sizes fail', async () => {
    await assert.rejects(checkout([...items(),...items()]),/Duplicate/);
    await assert.rejects(checkout(items(1,'XL')),/Invalid variant/);
    await assert.rejects(checkout([...items(6,'S'),...items(6,'M')]),/Insufficient stock/);
  });
  await t.test('paused and unpublished products cannot be purchased', async () => {
    await db.query('UPDATE products SET is_published=false WHERE id=$1',[id]);
    await assert.rejects(checkout(),/Unavailable/);
    await db.query('UPDATE products SET is_published=true WHERE id=$1',[id]);
    await db.query("INSERT INTO site_settings(key,value) VALUES ($1,'false')",['product_visibility_'+id]);
    await assert.rejects(checkout(),/Unavailable/);
    await db.query('DELETE FROM site_settings WHERE key=$1',['product_visibility_'+id]);
  });
  await t.test('packaging is computed from database settings; payment method validated', async () => {
    await db.exec("INSERT INTO site_settings(key,value) VALUES ('packaging_fee_enabled','true'),('packaging_fee_per_item','3.5'),('payment_plin_enabled','false')");
    const order=await checkout();assert.equal(order.totalAmount,28.75);assert.equal(order.packagingFee,3.5);
    await assert.rejects(checkout(items(),requestId(),'Plin'),/Invalid payment/);
    await assert.rejects(checkout(items(),requestId(),'Paid'),/Invalid payment/);
  });
  await t.test('item insert failure rolls back order and inventory atomically', async () => {
    const remaining=await stock();const before=(await db.query('SELECT count(*)::int AS n FROM orders')).rows[0].n;
    await db.exec("CREATE FUNCTION qa_fail_item() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'qa rollback'; END $$; CREATE TRIGGER qa_fail BEFORE INSERT ON order_items FOR EACH ROW EXECUTE FUNCTION qa_fail_item();");
    await assert.rejects(checkout(),/qa rollback/);
    assert.equal(await stock(),remaining);assert.equal((await db.query('SELECT count(*)::int AS n FROM orders')).rows[0].n,before);
    await db.exec('DROP TRIGGER qa_fail ON order_items; DROP FUNCTION qa_fail_item();');
  });
  await t.test('browser database roles cannot read orders, mutate catalog or execute checkout', async () => {
    for(const role of ['anon','authenticated']) {
      await db.exec(`SET ROLE ${role}`);
      await assert.rejects(db.query('SELECT * FROM orders'),/permission denied/);
      await assert.rejects(db.query('SELECT * FROM order_items'),/permission denied/);
      for (const table of ['categorias','productos','variantes']) await assert.rejects(db.query(`SELECT * FROM ${table}`),/permission denied/);
      await assert.rejects(db.query("UPDATE products SET price=0 WHERE id=$1",[id]),/permission denied/);
      await assert.rejects(checkout(),/permission denied/);
      await db.exec('RESET ROLE');
    }
  });
  await t.test('RLS hides paused products and private order-shipping settings', async () => {
    await db.query("INSERT INTO site_settings(key,value) VALUES ('order_shipping_qa','private'),($1,'false')",['product_visibility_'+id]);
    await db.exec('SET ROLE anon');
    assert.equal((await db.query('SELECT * FROM products WHERE id=$1',[id])).rows.length,0);
    assert.equal((await db.query("SELECT * FROM site_settings WHERE key='order_shipping_qa'")).rows.length,0);
    await db.exec('RESET ROLE');
    await db.query('DELETE FROM site_settings WHERE key=$1',['product_visibility_'+id]);
  });
  await t.test('service role retains commerce access and can execute RPC', async () => {
    await db.exec('SET ROLE service_role');const order=await checkout();assert.ok(order.orderId);await db.exec('RESET ROLE');
  });
  await t.test('persistent checkout rate limit rejects the eleventh completed request', async () => {
    const fp='c'.repeat(64);
    await db.query('UPDATE products SET stock=100 WHERE id=$1',[id]);
    for(let i=0;i<10;i++)await checkout(items(),requestId(),'Yape',customer,fp);
    await assert.rejects(checkout(items(),requestId(),'Yape',customer,fp),/Rate limit/);
  });
  await db.close();
});
