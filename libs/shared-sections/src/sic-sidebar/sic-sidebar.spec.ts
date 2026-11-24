/** @jest-environment jsdom */
import './sic-sidebar';
import type { SicSidebar } from './sic-sidebar';

it('requests a close and one creation intent while preserving controlled tab state', async () => {
  const sidebar = document.createElement('sic-sidebar') as SicSidebar;
  sidebar.isOpen = true;
  sidebar.activeTab = 'shared';
  document.body.append(sidebar);
  await sidebar.updateComplete;
  let closes = 0;
  let creates = 0;
  sidebar.addEventListener('sidebar-close', () => closes++);
  sidebar.addEventListener('project-create', () => creates++);
  sidebar.shadowRoot?.querySelector('uic-icon-button')?.click();
  sidebar.shadowRoot?.querySelector('uic-button')?.click();
  expect(closes).toBe(1);
  expect(creates).toBe(1);
  expect(sidebar.activeTab).toBe('shared');
  sidebar.remove();
});
