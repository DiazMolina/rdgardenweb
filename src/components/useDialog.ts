'use client';

import { useEffect, useRef } from 'react';

/** One overlay owns keyboard focus, scroll locking and return focus. */
export function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const element = ref.current;
    if (!element) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(element.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(node => node.getClientRects().length > 0);
    (focusable()[0] || element).focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const nodes = focusable();
      const first = nodes[0]; const last = nodes[nodes.length - 1];
      if (!first) { event.preventDefault(); element.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !element.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !element.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    const resize = () => { if (!element.getClientRects().length) closeRef.current(); };
    window.addEventListener('resize', resize);
    document.addEventListener('keydown', keyboard);
    return () => { window.removeEventListener('resize', resize); document.removeEventListener('keydown', keyboard); document.body.style.overflow = overflow; if (previous?.isConnected && !previous.closest('[inert]')) previous.focus(); };
  }, [open]);
  return ref;
}
