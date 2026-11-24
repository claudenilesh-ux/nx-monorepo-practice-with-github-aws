/** @jest-environment jsdom */
import './sic-editor-navbar';
import type { SicEditorNavbar } from './sic-editor-navbar';

it('reports its controlled state and emits one toggle request', async () => {
  const navbar = document.createElement('sic-editor-navbar') as SicEditorNavbar;
  navbar.sidebarOpen = true;
  document.body.append(navbar);
  await navbar.updateComplete;
  const control = navbar.shadowRoot?.querySelector('uic-icon-button');
  expect(control?.label).toBe('Close projects sidebar');
  expect(control?.expanded).toBe(true);
  let count = 0;
  navbar.addEventListener('sidebar-toggle', () => count++);
  control?.click();
  expect(count).toBe(1);
  navbar.remove();
});
