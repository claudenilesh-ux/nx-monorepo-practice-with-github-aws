/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import '../index';

it('shows profile details and emits sign-out from the shared control', async () => {
  const profile = document.createElement('uic-profile') as HTMLElement & {
    name: string; email: string; updateComplete: Promise<unknown>;
  };
  profile.name = 'Ada Lovelace';
  profile.email = 'ada@example.test';
  document.body.append(profile);
  await profile.updateComplete;
  expect(profile.shadowRoot?.querySelector('button')?.getAttribute('aria-label')).toBe('Open profile');
  profile.shadowRoot?.querySelector('button')?.click();
  await profile.updateComplete;
  expect(profile.shadowRoot?.textContent).toContain('Ada Lovelace');
  expect(profile.shadowRoot?.textContent).toContain('ada@example.test');
  const signOut = jest.fn();
  profile.addEventListener('profile-sign-out', signOut);
  profile.shadowRoot?.querySelector('uic-button')?.click();
  expect(signOut).toHaveBeenCalledTimes(1);
  profile.remove();
});

it('closes on Escape and returns focus to the profile button', async () => {
  const profile = document.createElement('uic-profile') as HTMLElement & { updateComplete: Promise<unknown> };
  document.body.append(profile);
  await profile.updateComplete;
  const trigger = profile.shadowRoot?.querySelector('button');
  trigger?.click();
  await profile.updateComplete;
  profile.shadowRoot?.querySelector('uic-card')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await profile.updateComplete;
  await Promise.resolve();
  expect(profile.shadowRoot?.querySelector('uic-card')).toBeNull();
  expect(profile.shadowRoot?.activeElement).toBe(trigger);
  profile.remove();
});
