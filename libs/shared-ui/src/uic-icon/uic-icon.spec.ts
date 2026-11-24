/** @jest-environment jsdom */
import './uic-icon';

it('renders a Lucide SVG inside its shadow root', async () => {
  const icon = document.createElement('uic-icon');
  icon.name = 'plus';
  document.body.append(icon);
  await icon.updateComplete;
  expect(icon.shadowRoot?.querySelector('svg path, svg line')).not.toBeNull();
  icon.remove();
});
