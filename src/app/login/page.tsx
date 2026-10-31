import { login } from './actions';
import Link from 'next/link';
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <main id="contenido" className="min-h-screen flex items-center justify-center p-6 bg-canvas"><div className="w-full max-w-sm bg-surface border border-line p-8 rounded-xl">
    <Link href="/" className="font-serif text-2xl">R&D Garden</Link>
    <h1 className="font-serif text-3xl mt-8 mb-3">Acceso administrativo</h1>
    <p className="text-sm text-gray-500 mb-6">Ingresa con tu cuenta autorizada.</p>
    {params.error && <p role="alert" className="text-sm mb-4">No se pudo iniciar sesión. Verifica tus datos o inténtalo más tarde.</p>}
    <form action={login} className="space-y-4">
      <label className="block text-sm" htmlFor="email">Correo electrónico</label><input id="email" name="email" type="email" autoComplete="username" required maxLength={254} className="w-full p-3 border border-line rounded bg-canvas" />
      <label className="block text-sm" htmlFor="password">Contraseña</label><input id="password" name="password" type="password" autoComplete="current-password" required maxLength={1024} className="w-full p-3 border border-line rounded bg-canvas" />
      <button className="w-full bg-[#18181b] hover:bg-[#27272a] text-white p-3 rounded-lg font-medium transition cursor-pointer">Ingresar</button>
    </form>
  </div></main>;
}
