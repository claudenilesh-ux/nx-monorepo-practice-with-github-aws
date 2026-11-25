/** @jest-environment node */

import { ProjectsApi, ProjectsApiError } from '../src/app/editor/projects-api';

const project = { id: '11111111-1111-4111-8111-111111111111', name: 'Test', slug: 'test', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' };
const response = (status: number, body?: unknown) => new Response(body === undefined ? null : JSON.stringify(body), { status });

afterEach(() => jest.restoreAllMocks());
it('sends a fresh token and handles all project contracts', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce(response(200, { projects: [project] })).mockResolvedValueOnce(response(201, { project })).mockResolvedValueOnce(response(200, { project })).mockResolvedValueOnce(response(204));
  const token = jest.fn().mockResolvedValue('session');
  const api = new ProjectsApi('http://localhost:3001', token);
  expect(await api.list()).toEqual([project]);
  expect(await api.create('Test')).toEqual(project);
  expect(await api.rename('1', 'Test')).toEqual(project);
  await api.delete('1');
  expect(token).toHaveBeenCalledTimes(4);
  expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'POST', body: '{"name":"Test"}', credentials: 'omit', cache: 'no-store', redirect: 'error', headers: { Authorization: 'Bearer session', 'Content-Type': 'application/json' } });
});
it('does not fetch without a token', async () => {
  const fetchMock = jest.spyOn(global, 'fetch');
  await expect(new ProjectsApi('http://localhost:3001', async () => null).list()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  expect(fetchMock).not.toHaveBeenCalled();
});
it('maps API errors without exposing server messages', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue(response(409, { error: { code: 'SLUG_CONFLICT', message: 'private detail' } }));
  await expect(new ProjectsApi('http://localhost:3001', async () => 'token').create('Test')).rejects.toMatchObject({ code: 'SLUG_CONFLICT' });
});
it('rejects invalid response shapes and invalid origins', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue(response(200, { projects: [{}] }));
  await expect(new ProjectsApi('http://localhost:3001', async () => 'token').list()).rejects.toBeInstanceOf(ProjectsApiError);
  expect(() => new ProjectsApi('https://example.com/path', async () => 'token')).toThrow();
  expect(() => new ProjectsApi('http://example.com', async () => 'token')).toThrow();
});

it.each([[400, 'VALIDATION_ERROR'], [401, 'UNAUTHORIZED'], [404, 'PROJECT_NOT_FOUND'], [409, 'SLUG_CONFLICT'], [413, 'PAYLOAD_TOO_LARGE'], [500, 'UNAVAILABLE'], [503, 'UNAVAILABLE']] as const)('maps status %i safely', async (status, code) => {
  jest.spyOn(global, 'fetch').mockResolvedValue(response(status, { error: { code, message: 'server detail' } }));
  await expect(new ProjectsApi('http://localhost:3001', async () => 'token').list()).rejects.toMatchObject({ code });
});
