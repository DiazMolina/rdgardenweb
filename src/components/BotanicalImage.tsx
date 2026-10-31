import Image, { type ImageProps } from 'next/image';

/** Optimize known storage hosts; retain support for admin-entered external URLs. */
export default function BotanicalImage({ src, ...props }: ImageProps) {
  const value = typeof src === 'string' ? src : '';
  let known = value.startsWith('/');
  try { const url = new URL(value); known = url.protocol === 'https:' && (['images.unsplash.com', 'picsum.photos'].includes(url.hostname) || url.hostname === new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://unconfigured.invalid').hostname); } catch { /* Local images and missing photos. */ }
  if (!src) return <div className="flex h-full w-full items-center justify-center bg-tint text-accent text-xs" role="img" aria-label={props.alt}>Imagen no disponible</div>;
  return <Image src={src} {...props} alt={props.alt} unoptimized={!known} />;
}
