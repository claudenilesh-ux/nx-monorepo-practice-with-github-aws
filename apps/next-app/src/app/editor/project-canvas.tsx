'use client';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type DetailedHTMLProps, type HTMLAttributes } from 'react';
import './project-canvas.css';
import { componentCatalog } from './component-catalog';
import type { ComponentEntry } from '@nx-learning/shared-sections';

const Button = 'uic-button' as React.ElementType<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { disabled?: boolean }>;

const Library = 'sic-component-library' as React.ElementType<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { entries: readonly ComponentEntry[]; 'oncomponent-library-close': () => void }>;

type View = { x: number; y: number; zoom: number };
const initial: View = { x: 0, y: 0, zoom: 100 };
export default function ProjectCanvas() {
  const [view, setView] = useState(initial);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const toggle = useRef<HTMLElement>(null);
  const closeLibrary = () => { setLibraryOpen(false); toggle.current?.shadowRoot?.querySelector<HTMLButtonElement>('button')?.focus(); };
  const canvas = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const zoomAt = (step: number, x: number, y: number) => setView(previous => {
    const zoom = Math.min(200, Math.max(25, previous.zoom + step));
    const ratio = zoom / previous.zoom;
    return { zoom, x: x - (x - previous.x) * ratio, y: y - (y - previous.y) * ratio };
  });
  const zoomCenter = (step: number) => {
    const rect = canvas.current?.getBoundingClientRect();
    if (rect) zoomAt(step, rect.width / 2, rect.height / 2);
  };
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || event.deltaY === 0) return;
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      zoomAt(event.deltaY < 0 ? 10 : -10, event.clientX - rect.left, event.clientY - rect.top);
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, []);
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return <div className="project-canvas-wrap">
    <div ref={canvas} className="project-canvas" tabIndex={0} role="region" aria-label="Project canvas"
      style={{ '--grid-x': `${view.x}px`, '--grid-y': `${view.y}px`, '--grid-scale': view.zoom / 100 } as CSSProperties}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0 || drag.current) return;
        drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        const current = drag.current;
        if (!current || current.id !== event.pointerId) return;
        const dx = event.clientX - current.x; const dy = event.clientY - current.y;
        current.x = event.clientX; current.y = event.clientY;
        setView(previous => ({ ...previous, x: previous.x + dx, y: previous.y + dy }));
      }}
      onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={() => { drag.current = null; }}
      onKeyDown={event => {
        const moves: Record<string, [number, number]> = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] };
        const move = moves[event.key];
        if (move) { event.preventDefault(); setView(previous => ({ ...previous, x: previous.x + move[0], y: previous.y + move[1] })); }
      }} />
    <div className="component-toggle"><Button ref={toggle} onClick={() => libraryOpen ? closeLibrary() : setLibraryOpen(true)}>Components</Button></div>
    {libraryOpen && <Library className="component-panel" role="complementary" aria-label="Components" entries={componentCatalog} oncomponent-library-close={closeLibrary} />}
    <div className="project-canvas-controls" aria-label="Canvas controls">
      <Button disabled={view.zoom <= 25} onClick={() => zoomCenter(-10)}>Zoom out</Button>
      <span aria-live="polite">{view.zoom}%</span>
      <Button disabled={view.zoom >= 200} onClick={() => zoomCenter(10)}>Zoom in</Button>
      <Button onClick={() => setView(initial)}>Reset</Button>
    </div>
  </div>;
}
