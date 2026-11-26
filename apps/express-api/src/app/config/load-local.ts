import { config } from 'dotenv';
import { resolve } from 'node:path';

export function loadExpressLocal(): void {
  if (process.env.RUN_DATABASE_TESTS === '1') {
    if (process.env.ARCHLOOM_DATABASE_PROFILE !== 'test') throw new Error('Integration tests require the test database profile');
    validateDatabaseTarget('test', process.env.DATABASE_URL, process.env.DIRECT_URL);
    return;
  }
  const cwd = process.cwd();
  const appRoot = cwd.endsWith('/apps/express-api') ? cwd : resolve(cwd, 'apps/express-api');
  if (process.env.ARCHLOOM_DATABASE_PROFILE === 'cloud') {
    config({ path: resolve(appRoot, '.env.cloud'), quiet: true });
  }
  config({ path: resolve(appRoot, '.env.local'), quiet: true });
}

export function validateDatabaseTarget(profile: string, databaseUrl?: string, directUrl?: string): void {
  const invalid = () => { throw new Error('Invalid database configuration for selected profile'); };
  let runtime: URL;
  let direct: URL | undefined;
  try {
    runtime = new URL(databaseUrl || '');
    direct = directUrl ? new URL(directUrl) : undefined;
  } catch { return invalid(); }
  const postgres = (url: URL) => ['postgres:', 'postgresql:'].includes(url.protocol);
  const local = (url: URL) => ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (!postgres(runtime)) return invalid();
  if (profile === 'test') {
    if (!local(runtime) || runtime.pathname !== '/archloom_test' || direct) invalid();
  } else if (profile === 'local') {
    if (!local(runtime) || (direct && (!postgres(direct) || direct.hostname !== runtime.hostname || (direct.port || '5432') !== (runtime.port || '5432') || direct.pathname !== runtime.pathname))) invalid();
  } else if (profile === 'cloud') {
    if (!direct || !postgres(direct) || runtime.hostname !== 'pooled.db.prisma.io' || direct.hostname !== 'db.prisma.io' ||
      runtime.username !== direct.username || runtime.password !== direct.password || runtime.pathname !== direct.pathname ||
      runtime.searchParams.get('sslmode') !== 'require' || direct.searchParams.get('sslmode') !== 'require') invalid();
  } else invalid();
}
