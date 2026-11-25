import { act, render, waitFor } from '@testing-library/react';
import Editor from '../src/app/editor/editor';
let mockUserId = 'first';
let mockSessionId = 'session';
const mockGetToken = jest.fn(async () => 'token');
const mockSignOut = jest.fn(async (_options: { sessionId: string; redirectUrl: string }) => undefined);
jest.mock('@clerk/nextjs', () => ({ useAuth: () => ({ isLoaded: true, isSignedIn: true, userId: mockUserId, sessionId: mockSessionId, getToken: mockGetToken }), useClerk: () => ({ signOut: mockSignOut }), UserButton: () => null }));
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: jest.fn() }) }));
jest.mock('@nx-learning/shared-sections', () => {
  for (const name of ['sic-editor-navbar', 'sic-sidebar', 'sic-project-dialog', 'uic-empty-state', 'uic-button', 'uic-icon']) {
    if (!customElements.get(name)) customElements.define(name, class extends HTMLElement { projects: unknown[] = []; loading = false; });
  }
  return {};
});
const project = { id: '11111111-1111-4111-8111-111111111111', name: 'First', slug: 'first', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' };
const json = (value: unknown, status = 200) => ({ ok: true, status, json: async () => value }) as Response;
beforeEach(() => { mockUserId = 'first'; mockSessionId = 'session'; localStorage.clear(); process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001'; global.fetch = jest.fn(); });
it('loads server projects without changing legacy storage', async () => {
  const key = 'nx-learning:projects:v1:first';
  const legacy = JSON.stringify([{ id: 'old', name: 'Old', slug: 'old' }]);
  localStorage.setItem(key, legacy);
  jest.mocked(fetch).mockResolvedValue(json({ projects: [project] }));
  const { container, getByText } = render(<Editor />);
  await waitFor(() => expect((container.querySelector('sic-sidebar') as HTMLElement & { projects: unknown[] })?.projects).toHaveLength(1));
  expect(getByText(/local-only/i)).toBeTruthy();
  expect(localStorage.getItem(key)).toBe(legacy);
});
it('ignores late results from a previous identity', async () => {
  let resolveFirst: (value: Response) => void = () => undefined;
  jest.mocked(fetch).mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve; })).mockResolvedValueOnce(json({ projects: [] }));
  const { container, rerender } = render(<Editor />);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  mockUserId = 'second'; mockSessionId = 'other'; rerender(<Editor />);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  await act(async () => resolveFirst(json({ projects: [project] })));
  expect((container.querySelector('sic-sidebar') as HTMLElement & { projects: unknown[] }).projects).toEqual([]);
});
it('prevents duplicate submissions and applies only confirmed create', async () => {
  let resolveCreate: (value: Response) => void = () => undefined;
  jest.mocked(fetch).mockResolvedValueOnce(json({ projects: [] })).mockImplementationOnce(() => new Promise(resolve => { resolveCreate = resolve; }));
  const { container } = render(<Editor />);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  await waitFor(() => expect((container.querySelector('sic-sidebar') as HTMLElement & { loading?: boolean }).loading).toBe(false));
  const sidebar = container.querySelector('sic-sidebar');
  const dialog = container.querySelector('sic-project-dialog');
  if (!sidebar || !dialog) throw new Error('Editor components missing');
  act(() => sidebar.dispatchEvent(new CustomEvent('project-create')));
  act(() => { dialog.dispatchEvent(new CustomEvent('project-submit', { detail: { name: 'First', slug: 'first' } })); dialog.dispatchEvent(new CustomEvent('project-submit', { detail: { name: 'First', slug: 'first' } })); });
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect((sidebar as HTMLElement & { projects: unknown[] }).projects).toEqual([]);
  await act(async () => resolveCreate(json({ project }, 201)));
  await waitFor(() => expect((sidebar as HTMLElement & { projects: unknown[] }).projects).toEqual([project]));
  expect(fetch).toHaveBeenCalledTimes(2);
});
it('shows a retry instead of an empty state on load failure', async () => {
  jest.mocked(fetch).mockRejectedValueOnce(new Error('offline'));
  const { findByText, container } = render(<Editor />);
  expect(await findByText('Retry loading projects')).toBeTruthy();
  expect(container.querySelector('uic-empty-state')).toBeNull();
});
it('preserves the form and confirmed data after a conflict', async () => {
  jest.mocked(fetch).mockResolvedValueOnce(json({ projects: [project] })).mockResolvedValueOnce({ ok: false, status: 409, json: async () => ({ error: { code: 'SLUG_CONFLICT', message: 'duplicate' } }) } as Response);
  const { container } = render(<Editor />);
  await waitFor(() => expect((container.querySelector('sic-sidebar') as HTMLElement & { projects: unknown[] })?.projects).toEqual([project]));
  const sidebar = container.querySelector('sic-sidebar'); const dialog = container.querySelector('sic-project-dialog');
  if (!sidebar || !dialog) throw new Error('Editor components missing');
  act(() => sidebar.dispatchEvent(new CustomEvent('project-create')));
  act(() => dialog.dispatchEvent(new CustomEvent('project-submit', { detail: { name: 'Other', slug: 'other' } })));
  await waitFor(() => expect(dialog.getAttribute('validationerror')).toMatch(/already exists/));
  expect((sidebar as HTMLElement & { projects: unknown[] }).projects).toEqual([project]);
});
it('refreshes after an uncertain mutation without replaying it', async () => {
  jest.mocked(fetch).mockResolvedValueOnce(json({ projects: [] })).mockRejectedValueOnce(new Error('connection lost')).mockResolvedValueOnce(json({ projects: [project] }));
  const { container } = render(<Editor />);
  await waitFor(() => expect(container.querySelector('uic-empty-state')).not.toBeNull());
  const sidebar = container.querySelector('sic-sidebar'); const dialog = container.querySelector('sic-project-dialog');
  if (!sidebar || !dialog) throw new Error('Editor components missing');
  act(() => sidebar.dispatchEvent(new CustomEvent('project-create')));
  act(() => dialog.dispatchEvent(new CustomEvent('project-submit', { detail: { name: 'First', slug: 'first' } })));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  await waitFor(() => expect((sidebar as HTMLElement & { projects: unknown[] }).projects).toEqual([project]));
  expect(jest.mocked(fetch).mock.calls.map(call => call[1]?.method)).toEqual(['GET', 'POST', 'GET']);
});
it('preserves unreadable legacy data and still loads server projects', async () => {
  const key = 'nx-learning:projects:v1:first'; localStorage.setItem(key, '{broken');
  jest.mocked(fetch).mockResolvedValueOnce(json({ projects: [project] }));
  const { findByText, container } = render(<Editor />);
  expect(await findByText(/could not be read/i)).toBeTruthy();
  await waitFor(() => expect((container.querySelector('sic-sidebar') as HTMLElement & { projects: unknown[] }).projects).toEqual([project]));
  expect(localStorage.getItem(key)).toBe('{broken');
});
it('renames and deletes only after server confirmation', async () => {
  const renamed = { ...project, name: 'Renamed', slug: 'renamed' };
  jest.mocked(fetch).mockResolvedValueOnce(json({ projects: [project] })).mockResolvedValueOnce(json({ project: renamed })).mockResolvedValueOnce({ ok: true, status: 204 } as Response);
  const { container } = render(<Editor />);
  await waitFor(() => expect((container.querySelector('sic-sidebar') as HTMLElement & { projects: unknown[] })?.projects).toEqual([project]));
  const sidebar = container.querySelector('sic-sidebar'); const dialog = container.querySelector('sic-project-dialog');
  if (!sidebar || !dialog) throw new Error('Editor components missing');
  act(() => sidebar.dispatchEvent(new CustomEvent('project-select', { detail: { id: project.id } })));
  act(() => sidebar.dispatchEvent(new CustomEvent('project-edit', { detail: { id: project.id } })));
  act(() => dialog.dispatchEvent(new CustomEvent('project-submit', { detail: { name: 'Renamed', slug: 'renamed' } })));
  await waitFor(() => expect((sidebar as HTMLElement & { projects: unknown[] }).projects).toEqual([renamed]));
  expect(container.querySelector('h1')?.textContent).toBe('Renamed');
  act(() => sidebar.dispatchEvent(new CustomEvent('project-delete', { detail: { id: project.id } })));
  act(() => dialog.dispatchEvent(new CustomEvent('project-submit')));
  await waitFor(() => expect((sidebar as HTMLElement & { projects: unknown[] }).projects).toEqual([]));
  expect(container.querySelector('h1')).toBeNull();
});
it('exports validated legacy fields without changing storage', async () => {
  const key = 'nx-learning:projects:v1:first';
  const raw = JSON.stringify([{ id: 'old', name: 'Old', slug: 'old', extra: 'ignored' }]);
  localStorage.setItem(key, raw);
  jest.mocked(fetch).mockResolvedValueOnce(json({ projects: [] }));
  const create = jest.fn(() => 'blob:backup'); const revoke = jest.fn();
  Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
  const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  const { findByText } = render(<Editor />);
  const button = await findByText('Export JSON backup');
  act(() => button.click());
  expect(create).toHaveBeenCalledTimes(1);
  expect(revoke).toHaveBeenCalledWith('blob:backup');
  expect(click).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem(key)).toBe(raw);
  click.mockRestore();
});
it('ignores a late mutation after a session change', async () => {
  let finish: (value: Response) => void = () => undefined;
  jest.mocked(fetch).mockResolvedValueOnce(json({ projects: [] })).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValueOnce(json({ projects: [] }));
  const { container, rerender } = render(<Editor />);
  await waitFor(() => expect(container.querySelector('uic-empty-state')).not.toBeNull());
  const sidebar = container.querySelector('sic-sidebar'); const dialog = container.querySelector('sic-project-dialog');
  if (!sidebar || !dialog) throw new Error('Editor components missing');
  act(() => sidebar.dispatchEvent(new CustomEvent('project-create')));
  act(() => dialog.dispatchEvent(new CustomEvent('project-submit', { detail: { name: 'First', slug: 'first' } })));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  mockSessionId = 'new-session'; rerender(<Editor />);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  await act(async () => finish(json({ project }, 201)));
  expect((sidebar as HTMLElement & { projects: unknown[] }).projects).toEqual([]);
});

it('ends only the rejected session and clears protected projects after 401', async () => {
  mockSignOut.mockClear();
  jest.mocked(fetch).mockResolvedValueOnce(json({ projects: [project] })).mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'test' } }) } as Response);
  const { container } = render(<Editor />);
  await waitFor(() => expect((container.querySelector('sic-sidebar') as HTMLElement & { projects: unknown[] })?.projects).toEqual([project]));
  const sidebar = container.querySelector('sic-sidebar'); const dialog = container.querySelector('sic-project-dialog');
  if (!sidebar || !dialog) throw new Error('Editor components missing');
  act(() => sidebar.dispatchEvent(new CustomEvent('project-create')));
  act(() => dialog.dispatchEvent(new CustomEvent('project-submit', { detail: { name: 'Second', slug: 'second' } })));
  await waitFor(() => expect(mockSignOut).toHaveBeenCalledWith({ sessionId: 'session', redirectUrl: '/sign-in' }));
  expect(container.querySelector('sic-sidebar')).toBeNull();
  expect(container.textContent).not.toContain('First');
});

it('keeps the rejected session blocked when sign-out fails', async () => {
  mockSignOut.mockRejectedValueOnce(new Error('unavailable'));
  jest.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'test' } }) } as Response);
  const { findByText, container } = render(<Editor />);
  expect(await findByText(/Unable to sign out/)).toBeTruthy();
  expect(container.querySelector('sic-sidebar')).toBeNull();
});

it('ignores a 401 from an aborted previous identity', async () => {
  mockSignOut.mockClear();
  let rejectFirst: (value: Response) => void = () => undefined;
  jest.mocked(fetch).mockImplementationOnce(() => new Promise(resolve => { rejectFirst = resolve; })).mockResolvedValueOnce(json({ projects: [] }));
  const { rerender } = render(<Editor />);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  mockUserId = 'second'; mockSessionId = 'other'; rerender(<Editor />);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  await act(async () => rejectFirst({ ok: false, status: 401, json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'test' } }) } as Response));
  expect(mockSignOut).not.toHaveBeenCalled();
});
