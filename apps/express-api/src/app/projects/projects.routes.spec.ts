import express from 'express';
import { AddressInfo } from 'node:net';
import { projectsRouter } from './projects.routes';

jest.mock('@clerk/express', () => ({
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  getAuth: (req: express.Request) => ({ isAuthenticated: req.get('Authorization') === 'Bearer valid', userId: 'test-user' }),
}));
jest.mock('./projects.service', () => ({
  ...jest.requireActual('./projects.service'),
  listProjects: async () => [],
}));

describe('project HTTP boundary (mocked Clerk)', () => {
  let base: string;
  let server: ReturnType<express.Express['listen']>;
  beforeAll(async () => {
    process.env.CORS_ORIGIN = 'http://localhost:3000';
    process.env.CLERK_PUBLISHABLE_KEY = `pk_test_${Buffer.from('example.clerk.accounts.dev$').toString('base64')}`;
    process.env.CLERK_SECRET_KEY = 'sk_test_example';
    const app = express();
    app.use('/api/projects', projectsRouter());
    server = await new Promise(resolve => { const listener = app.listen(0, '127.0.0.1', () => resolve(listener)); });
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/projects`;
  });
  afterAll(async () => { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); });
  it('rejects malformed publishable keys before startup', () => {
    const original = process.env.CLERK_PUBLISHABLE_KEY;
    process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_example';
    try { expect(() => projectsRouter()).toThrow('Invalid Clerk configuration'); }
    finally { process.env.CLERK_PUBLISHABLE_KEY = original; }
  });
  it('allows only configured CORS origin and unauthenticated preflight', async () => {
    const allowed = await fetch(base, { method: 'OPTIONS', headers: { Origin: 'http://localhost:3000' } });
    expect(allowed.status).toBe(204);
    expect(allowed.headers.get('access-control-allow-origin')).toBe('http://localhost:3000');
    const denied = await fetch(base, { method: 'OPTIONS', headers: { Origin: 'http://other.example' } });
    expect(denied.headers.get('access-control-allow-origin')).toBeNull();
  });
  it('rejects missing, cookie-only, malformed and invalid authentication', async () => {
    for (const headers of [{}, { Cookie: '__session=valid' }, { Authorization: 'invalid' }, { Authorization: 'Bearer invalid' }]) {
      const response = await fetch(base, { headers });
      expect(response.status).toBe(401);
      expect(await response.json()).toMatchObject({ error: { code: 'UNAUTHORIZED' } });
      expect(response.headers.get('cache-control')).toBe('no-store');
    }
  });
  it('validates JSON and IDs and lists projects for a mocked session', async () => {
    const headers = { Authorization: 'Bearer valid', 'Content-Type': 'application/json' };
    expect(await (await fetch(base, { headers })).json()).toEqual({ projects: [] });
    expect((await fetch(base, { method: 'POST', headers, body: '{' })).status).toBe(400);
    expect((await fetch(`${base}/bad`, { method: 'PATCH', headers, body: '{}' })).status).toBe(400);
    expect((await fetch(base, { method: 'POST', headers, body: JSON.stringify({ name: 'ok', ownerId: 'forged' }) })).status).toBe(400);
    expect((await fetch(base, { method: 'POST', headers, body: JSON.stringify({ name: 'x'.repeat(17000) }) })).status).toBe(413);
  });
});
