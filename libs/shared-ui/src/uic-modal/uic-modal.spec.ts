/** @jest-environment jsdom */
import './uic-modal';

it('names the dialog and associates an optional description', async () => {
  const modal = document.createElement('uic-modal') as import('./uic-modal').UicModal;
  modal.heading = 'Example';
  const description = document.createElement('p');
  description.slot = 'description';
  description.textContent = 'Supporting text';
  modal.append(description);
  document.body.append(modal);
  await modal.updateComplete;
  const dialog = modal.shadowRoot?.querySelector('dialog');
  expect(dialog?.getAttribute('aria-labelledby')).toBe('dialog-title');
  expect(dialog?.getAttribute('aria-describedby')).toBe('dialog-description');
  expect(modal.shadowRoot?.querySelector('slot[name=footer]')).not.toBeNull();
  modal.remove();
});
