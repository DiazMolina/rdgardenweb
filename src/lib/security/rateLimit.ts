import 'server-only';
import { createHash } from 'node:crypto';
import { headers } from 'next/headers';

const buckets = new Map<string, { count: number; reset: number }>();
export async function rateLimit(scope: string, limit: number, windowMs = 60000) {
  const requestHeaders = await headers();
  // Only enable behind an ingress that replaces, rather than appends, this header.
  const identity = process.env.TRUST_PROXY_IP_HEADERS === 'true'
    ? requestHeaders.get('x-real-ip') || 'shared-ingress'
    : 'shared-ingress';
  const key = createHash('sha256').update(`${scope}:${identity}`).digest('hex');
  const now = Date.now();
  for (const [id, bucket] of buckets) if (bucket.reset <= now) buckets.delete(id);
  let bucket = buckets.get(key);
  if (!bucket) { if (buckets.size >= 10000) throw new Error('Demasiadas solicitudes'); bucket = { count: 0, reset: now + windowMs }; buckets.set(key, bucket); }
  if (++bucket.count > limit) throw new Error('Demasiadas solicitudes');
  return key;
}
