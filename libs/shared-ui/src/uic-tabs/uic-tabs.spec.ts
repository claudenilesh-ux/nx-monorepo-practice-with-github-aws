/** @jest-environment jsdom */
import './uic-tabs';

it('associates tabs with panels and switches selection using the keyboard', async () => {
  const tabs = document.createElement('uic-tabs') as import('./uic-tabs').UicTabs;
  tabs.items = [{ id: 'mine', label: 'My Projects' }, { id: 'shared', label: 'Shared' }];
  tabs.value = 'mine';
  tabs.setAttribute('panels', '');
  document.body.append(tabs);
  await tabs.updateComplete;
  const root = tabs.shadowRoot;
  if (!root) throw new Error('Missing shadow root');
  const buttons = root.querySelectorAll<HTMLButtonElement>('[role=tab]');
  const panels = root.querySelectorAll<HTMLElement>('[role=tabpanel]');
  expect(buttons[0].getAttribute('aria-controls')).toBe(panels[0].id);
  expect(panels[0].getAttribute('aria-labelledby')).toBe(buttons[0].id);
  expect(panels[0].hidden).toBe(false);
  expect(panels[1].hidden).toBe(true);
  buttons[0].focus();
  buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  await tabs.updateComplete;
  expect(tabs.value).toBe('shared');
  expect(buttons[1].getAttribute('aria-selected')).toBe('true');
  expect(panels[1].hidden).toBe(false);
  expect(root.activeElement).toBe(buttons[1]);
  tabs.remove();
});
