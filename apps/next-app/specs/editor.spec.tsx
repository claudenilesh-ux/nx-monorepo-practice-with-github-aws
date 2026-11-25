import { act, render, waitFor } from '@testing-library/react';
import Editor from '../src/app/editor/editor';

let mockUserId = 'test-user';
jest.mock('@clerk/nextjs', () => ({ useAuth: () => ({ isLoaded: true, isSignedIn: true, userId: mockUserId }), UserButton: () => null }));
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: jest.fn() }) }));
jest.mock('@nx-learning/shared-sections', () => {
  for (const name of ['sic-editor-navbar', 'sic-sidebar', 'sic-project-dialog', 'uic-empty-state', 'uic-button', 'uic-icon']) {
    if (!customElements.get(name)) customElements.define(name, class extends HTMLElement { projects: unknown[] = []; });
  }
  return {};
});

it('persists create, rename and delete with a stable id', async () => {
  localStorage.clear();
  const { container } = render(<Editor />);
  await waitFor(() => expect(container.querySelector('sic-sidebar')).not.toBeNull());
  const sidebar = container.querySelector('sic-sidebar');
  const dialog = container.querySelector('sic-project-dialog');
  if (!sidebar || !dialog) throw new Error('Editor components missing');
  const emit = (element: Element, name: string, detail?: unknown) => act(() => { element.dispatchEvent(new CustomEvent(name, { detail })); });
  emit(sidebar, 'project-create');
  emit(dialog, 'project-submit', { name: 'First', slug: 'first' });
  const key = Object.keys(localStorage).find(value => value.startsWith('nx-learning:projects:v1:'));
  if (!key) throw new Error('Project storage missing');
  const stored = () => JSON.parse(localStorage.getItem(key) ?? 'null');
  const created = stored()[0];
  expect(created.name).toBe('First');
  emit(sidebar, 'project-edit', { id: created.id });
  emit(dialog, 'project-submit', { name: 'Renamed', slug: 'renamed' });
  expect(stored()).toEqual([{ id: created.id, name: 'Renamed', slug: 'renamed' }]);
  emit(sidebar, 'project-delete', { id: created.id });
  emit(dialog, 'project-submit');
  expect(stored()).toEqual([]);
});


it('clears the previous user projects when the identity changes', async () => {
  localStorage.clear();
  mockUserId = 'first-user';
  localStorage.setItem('nx-learning:projects:v1:first-user', JSON.stringify([{ id: 'one', name: 'First', slug: 'first' }]));
  const { container, rerender } = render(<Editor />);
  await waitFor(() => expect((container.querySelector('sic-sidebar') as HTMLElement & {projects: unknown[]}).projects).toHaveLength(1));
  mockUserId = 'second-user';
  rerender(<Editor />);
  await waitFor(() => expect((container.querySelector('sic-sidebar') as HTMLElement & {projects: unknown[]}).projects).toHaveLength(0));
});

it.each([1, 2])('focuses a surviving project control after deleting from %i project(s)', async (count) => {
  mockUserId = 'focus-user';
  const projects = [
    { id: 'one', name: 'First', slug: 'first' },
    { id: 'two', name: 'Second', slug: 'second' },
  ].slice(0, count);
  localStorage.clear();
  localStorage.setItem('nx-learning:projects:v1:focus-user', JSON.stringify(projects));
  const { container } = render(<Editor />);
  await waitFor(() => expect((container.querySelector('sic-sidebar') as HTMLElement & { projects: unknown[] })?.projects).toHaveLength(count));
  const sidebar = container.querySelector('sic-sidebar');
  const dialog = container.querySelector('sic-project-dialog');
  if (!sidebar || !dialog) throw new Error('Editor components missing');
  const sidebarRoot = sidebar.attachShadow({ mode: 'open' });
  const row = document.createElement('uic-list-item');
  const rowRoot = row.attachShadow({ mode: 'open' });
  const rowButton = document.createElement('button');
  rowButton.className = 'label';
  rowRoot.append(rowButton);
  if (count > 1) sidebarRoot.append(row);
  const footer = document.createElement('footer');
  const create = document.createElement('uic-button');
  const createRoot = create.attachShadow({ mode: 'open' });
  const createButton = document.createElement('button');
  createRoot.append(createButton);
  footer.append(create);
  sidebarRoot.append(footer);
  Object.assign(sidebar, { updateComplete: Promise.resolve(true) });
  const dialogRoot = dialog.attachShadow({ mode: 'open' });
  const modal = document.createElement('uic-modal');
  const modalRoot = modal.attachShadow({ mode: 'open' });
  const nativeDialog = document.createElement('dialog');
  modalRoot.append(nativeDialog);
  dialogRoot.append(modal);
  const emit = (element: Element, name: string, detail?: unknown) => act(() => { element.dispatchEvent(new CustomEvent(name, { detail })); });
  if (count > 1) emit(sidebar, 'project-select', { id: 'two' });
  emit(sidebar, 'project-delete', { id: 'one' });
  emit(dialog, 'project-submit');
  await act(async () => { nativeDialog.dispatchEvent(new Event('close')); await Promise.resolve(); });
  expect(count > 1 ? rowRoot.activeElement : createRoot.activeElement).toBe(count > 1 ? rowButton : createButton);
  if (count > 1) expect(container.querySelector('main h1')?.textContent).toBe('Second');
});

it('preserves projects written by another tab before submitting', async () => {
  mockUserId = 'concurrent-user';
  localStorage.clear();
  const key = 'nx-learning:projects:v1:concurrent-user';
  const { container } = render(<Editor />);
  await waitFor(() => expect(container.querySelector('sic-sidebar')).not.toBeNull());
  const sidebar = container.querySelector('sic-sidebar');
  const dialog = container.querySelector('sic-project-dialog');
  if (!sidebar || !dialog) throw new Error('Editor components missing');
  act(() => sidebar.dispatchEvent(new CustomEvent('project-create')));
  localStorage.setItem(key, JSON.stringify([{ id: 'other', name: 'Other', slug: 'other' }]));
  act(() => dialog.dispatchEvent(new CustomEvent('project-submit', { detail: { name: 'New', slug: 'new' } })));
  expect(JSON.parse(localStorage.getItem(key) ?? 'null')).toEqual([
    { id: 'other', name: 'Other', slug: 'other' },
    expect.objectContaining({ name: 'New', slug: 'new' }),
  ]);
});

it('rejects a slug added by another tab while the dialog is open', async () => {
  mockUserId = 'collision-user';
  localStorage.clear();
  const key = 'nx-learning:projects:v1:collision-user';
  const { container } = render(<Editor />);
  await waitFor(() => expect(container.querySelector('sic-sidebar')).not.toBeNull());
  const sidebar = container.querySelector('sic-sidebar');
  const dialog = container.querySelector('sic-project-dialog');
  if (!sidebar || !dialog) throw new Error('Editor components missing');
  act(() => sidebar.dispatchEvent(new CustomEvent('project-create')));
  const other = [{ id: 'other', name: 'New', slug: 'new' }];
  localStorage.setItem(key, JSON.stringify(other));
  act(() => dialog.dispatchEvent(new CustomEvent('project-submit', { detail: { name: 'New', slug: 'new' } })));
  expect(JSON.parse(localStorage.getItem(key) ?? 'null')).toEqual(other);
  expect((sidebar as HTMLElement & { projects: unknown[] }).projects).toEqual(other);
});
