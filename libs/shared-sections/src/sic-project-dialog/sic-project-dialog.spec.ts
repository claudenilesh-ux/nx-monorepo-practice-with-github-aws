/** @jest-environment jsdom */
import './sic-project-dialog';
import type { SicProjectDialog } from './sic-project-dialog';

it('blocks invalid and duplicate names and emits normalized valid data', async () => {
  const dialog = document.createElement('sic-project-dialog') as SicProjectDialog;
  dialog.projects = [{ id: '1', name: 'Existing', slug: 'existing' }];
  document.body.append(dialog);
  await dialog.updateComplete;
  const input = dialog.shadowRoot?.querySelector('uic-input');
  const save = () => dialog.shadowRoot?.querySelector('uic-button[slot=footer]:last-of-type');
  let result: unknown;
  dialog.addEventListener('project-submit', event => result = (event as CustomEvent).detail);
  input?.dispatchEvent(new CustomEvent('uic-change', { detail: { value: 'Existing' } }));
  await dialog.updateComplete;
  expect(save()?.hasAttribute('disabled')).toBe(true);
  input?.dispatchEvent(new CustomEvent('uic-change', { detail: { value: ' My  Project ' } }));
  await dialog.updateComplete;
  save()?.dispatchEvent(new Event('click'));
  expect(result).toEqual({ name: 'My Project', slug: 'my-project' });
  dialog.remove();
});
