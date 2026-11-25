/** @jest-environment jsdom */
import './sic-sidebar';
import type { SicSidebar } from './sic-sidebar';

it('renders project rows and forwards actions without selecting', async () => {
  const sidebar = document.createElement('sic-sidebar') as SicSidebar;
  sidebar.projects = [{ id: 'one', name: 'Project One', slug: 'project-one' }];
  sidebar.selectedId = 'one';
  document.body.append(sidebar);
  await sidebar.updateComplete;
  const row = sidebar.shadowRoot?.querySelector('uic-list-item');
  expect(row).not.toBeNull();
  expect(row?.getAttribute('secondary')).toBe('project-one');
  let selected = 0;
  let edited = '';
  sidebar.addEventListener('project-select', () => selected++);
  sidebar.addEventListener('project-edit', (event) => edited = (event as CustomEvent<{id: string}>).detail.id);
  row?.dispatchEvent(new CustomEvent('uic-edit', { bubbles: true, composed: true }));
  expect(edited).toBe('one');
  expect(selected).toBe(0);
  sidebar.remove();
});

it('keeps the create action available after selecting among many projects', async () => {
  const sidebar = document.createElement('sic-sidebar') as SicSidebar;
  sidebar.isOpen = true;
  sidebar.projects = Array.from({ length: 30 }, (_, index) => ({ id: String(index), name: `Project ${index}`, slug: `project-${index}` }));
  sidebar.selectedId = '0';
  document.body.append(sidebar);
  await sidebar.updateComplete;
  const button = sidebar.shadowRoot?.querySelector<HTMLElement>('footer uic-button');
  let creates = 0;
  sidebar.addEventListener('project-create', () => creates++);
  expect(button?.hasAttribute('disabled')).toBe(false);
  button?.click();
  expect(creates).toBe(1);
  sidebar.remove();
});
