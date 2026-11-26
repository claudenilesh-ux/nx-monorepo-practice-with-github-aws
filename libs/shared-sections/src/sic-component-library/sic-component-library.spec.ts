/** @jest-environment jsdom */
import './sic-component-library';
import type { SicComponentLibrary } from './sic-component-library';

it('filters labels, categories and aliases and clears the search', async () => {
  const panel = document.createElement('sic-component-library') as SicComponentLibrary;
  panel.entries = [
    { id: 'one', label: 'Lambda', category: 'Compute', icon: 'zap', aliases: ['serverless'] },
    { id: 'two', label: 'PostgreSQL', category: 'Database', icon: 'database', aliases: ['sql'] },
  ];
  document.body.append(panel);
  await panel.updateComplete;
  const input = panel.shadowRoot!.querySelector('uic-input')!;
  input.dispatchEvent(new CustomEvent('uic-change', { detail: { value: '  SERVERLESS ' } }));
  await panel.updateComplete;
  expect(panel.shadowRoot!.textContent).toContain('Lambda');
  expect(panel.shadowRoot!.textContent).not.toContain('PostgreSQL');
  input.dispatchEvent(new CustomEvent('uic-change', { detail: { value: 'dataBASE' } }));
  await panel.updateComplete;
  expect(panel.shadowRoot!.textContent).toContain('PostgreSQL');
  expect(panel.shadowRoot!.textContent).not.toContain('Lambda');
  input.dispatchEvent(new CustomEvent('uic-change', { detail: { value: 'missing' } }));
  await panel.updateComplete;
  expect(panel.shadowRoot!.querySelector('uic-empty-state')?.getAttribute('heading')).toBe('No components found');
  panel.shadowRoot!.querySelector<HTMLButtonElement>('[data-clear]')!.click();
  await panel.updateComplete;
  expect(panel.shadowRoot!.textContent).toContain('PostgreSQL');
  let closed = 0;
  panel.addEventListener('component-library-close', () => closed++);
  panel.shadowRoot!.querySelector('uic-icon-button')!.click();
  expect(closed).toBe(1);
  panel.remove();
});

it('emits the selected component id from a keyboard-accessible tile', async () => {
  const panel = document.createElement('sic-component-library') as SicComponentLibrary;
  panel.entries = [{ id: 'one', label: 'Lambda', category: 'Compute', icon: 'zap', aliases: [] }];
  document.body.append(panel);
  await panel.updateComplete;
  let received: Event | undefined;
  panel.addEventListener('component-library-activate', event => { received = event; });
  panel.shadowRoot!.querySelector<HTMLButtonElement>('button.tile')!.click();
  expect(received).toEqual(expect.objectContaining({ detail: { id: 'one' }, bubbles: true, composed: true }));
  panel.remove();
});

it('does not activate a tile when a drag ends with a click', async () => {
  const panel = document.createElement('sic-component-library') as SicComponentLibrary;
  panel.entries = [{ id: 'one', label: 'Lambda', category: 'Compute', icon: 'zap', aliases: [] }];
  document.body.append(panel);
  await panel.updateComplete;
  let activations = 0;
  panel.addEventListener('component-library-activate', () => activations++);
  const tile = panel.shadowRoot!.querySelector<HTMLButtonElement>('button.tile')!;
  tile.dispatchEvent(new Event('dragstart'));
  tile.dispatchEvent(new Event('dragend'));
  tile.click();
  expect(activations).toBe(0);
  tile.dispatchEvent(new Event('pointerdown'));
  tile.click();
  expect(activations).toBe(1);
  panel.remove();
});
