import { config } from 'dotenv';
import { resolve } from 'node:path';

export function loadExpressLocal(): void {
  const cwd = process.cwd();
  const appRoot = cwd.endsWith('/apps/express-api') ? cwd : resolve(cwd, 'apps/express-api');
  config({ path: resolve(appRoot, '.env.local'), quiet: true });
}
