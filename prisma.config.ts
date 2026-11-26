import { loadExpressLocal, validateDatabaseTarget } from './apps/express-api/src/app/config/load-local';

loadExpressLocal();
const profile = process.env.ARCHLOOM_DATABASE_PROFILE || 'local';
if (process.env.RUN_DATABASE_TESTS === '1' || process.env.DATABASE_URL || profile === 'cloud') {
  validateDatabaseTarget(process.env.RUN_DATABASE_TESTS === '1' ? 'test' : profile, process.env.DATABASE_URL, process.env.DIRECT_URL);
}
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'apps/express-api/prisma/schema.prisma',
  migrations: { path: 'apps/express-api/prisma/migrations' },
  datasource: { url: profile === 'cloud' ? process.env.DIRECT_URL : process.env.DIRECT_URL || process.env.DATABASE_URL },
});
