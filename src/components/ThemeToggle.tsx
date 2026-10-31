'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useSyncExternalStore } from 'react';

type Theme = 'system' | 'light' | 'dark';
const subscribe = (callback: () => void) => {
  window.addEventListener('rd-theme', callback);
  window.addEventListener('storage', callback);
  return () => { window.removeEventListener('rd-theme', callback); window.removeEventListener('storage', callback); };
};
const snapshot = (): Theme => {
  try { const value = localStorage.getItem('rd-theme'); return value === 'light' || value === 'dark' ? value : 'system'; } catch { return 'system'; }
};
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, snapshot, () => 'system' as Theme);
  const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
  const labels = { system: 'sistema', light: 'claro', dark: 'oscuro' };
  return <button className="theme-toggle" aria-label={`Tema ${labels[theme]}. Cambiar a ${labels[next]}`} title={`Cambiar a tema ${labels[next]}`} onClick={() => {
    try { localStorage.setItem('rd-theme', next); } catch { /* Theme still works for this visit. */ }
    document.documentElement.dataset.theme = next;
    window.dispatchEvent(new Event('rd-theme'));
  }}>{theme === 'dark' ? <Moon size={19} /> : theme === 'light' ? <Sun size={19} /> : <Monitor size={19} />}</button>;
}
