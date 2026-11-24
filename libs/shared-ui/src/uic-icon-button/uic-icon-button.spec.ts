/** @jest-environment jsdom */
import './uic-icon-button';

it('exposes the controlled expanded state on its native button', async () => {
  const button = document.createElement('uic-icon-button');
  button.setAttribute('expanded', 'true');
  document.body.append(button);
  await button.updateComplete;
  expect(button.shadowRoot?.querySelector('button')?.getAttribute('aria-expanded')).toBe('true');
  button.remove();
});
