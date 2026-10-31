'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Leaf } from 'lucide-react';
import Link from 'next/link';
import BotanicalImage from '../BotanicalImage';

const DEFAULT_SLIDES = [
  {
    id: '1',
    title: 'Tropicales',
    subtitle: 'Exóticas y Aclimatadas',
    description: 'Ejemplares de colección con raíces fuertes y follaje exuberante. Explora los ejemplares disponibles en nuestro catálogo.',
    badge_text: 'Colección Exclusiva de Plantas Raras',
    image_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2000&auto=format&fit=crop',
    button_text: 'Explorar Tienda',
    button_link: '/catalogo',
  },
  {
    id: '2',
    title: 'Jardín Botánico',
    subtitle: 'Follaje Exuberante',
    description: 'Transforma tus espacios con plantas de interior seleccionadas a mano por nuestros expertos.',
    badge_text: 'Selección botánica',
    image_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2000&auto=format&fit=crop',
    button_text: 'Explorar Tienda',
    button_link: '/catalogo',
  },
];


type Slide = { id: string; title: string; subtitle?: string; description?: string; badge_text?: string; image_url: string; button_text?: string; button_link?: string };
export default function HeroCarousel({ slides }: { slides?: Slide[] }) {
  const activeSlides = slides?.length ? slides : DEFAULT_SLIDES;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [interacting, setInteracting] = useState(false);
  useEffect(() => {
    if (!playing || interacting || activeSlides.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => { if (!document.hidden) setIndex(previous => (previous + 1) % activeSlides.length); }, 7000);
    return () => clearInterval(timer);
  }, [playing, interacting, activeSlides.length]);
  const slide = activeSlides[index] || activeSlides[0];
  const target = slide.button_link || '/catalogo';
  const href = target.startsWith('/') && !target.startsWith('//') ? target : '/catalogo';
  return <section className="botanical-hero" aria-label="Colecciones destacadas" aria-roledescription="carrusel" onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
    <div className="hero-layout">
      <div className="hero-copy">
        <span className="eyebrow">R&D Garden · Coleccionismo botánico</span>
        <div key={slide.id} className="hero-reveal" aria-live={playing ? 'off' : 'polite'}>
          <h1>{slide.title}{slide.subtitle && <em>{slide.subtitle}</em>}</h1>
          {slide.description && <p>{slide.description}</p>}
          <Link href={href} className="hero-cta">{slide.button_text || 'Explorar el catálogo'} <ArrowRight size={18} /></Link>
        </div>
        {activeSlides.length > 1 && <div className="hero-controls">
          <button aria-label="Colección anterior" onClick={() => setIndex((index - 1 + activeSlides.length) % activeSlides.length)}><ChevronLeft size={18} /></button>
          <span>{String(index + 1).padStart(2, '0')} / {String(activeSlides.length).padStart(2, '0')}</span>
          <button aria-label="Colección siguiente" onClick={() => setIndex((index + 1) % activeSlides.length)}><ChevronRight size={18} /></button>
          <button aria-label={playing ? 'Pausar carrusel' : 'Reproducir carrusel'} aria-pressed={playing} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
        </div>}
      </div>
      <div className="hero-photo">
        <BotanicalImage key={slide.image_url} src={slide.image_url} alt={slide.title} fill sizes="(max-width: 767px) 100vw, 50vw" preload={index === 0} />
        <div className="hero-caption"><span>{slide.badge_text || 'Nuestra colección'}</span><Leaf size={22} aria-hidden="true" /></div>
      </div>
    </div>
  </section>;
}
