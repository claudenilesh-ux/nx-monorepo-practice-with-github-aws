import { loadExpressLocal } from './apps/express-api/src/app/config/load-local';

loadExpressLocal();
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'apps/express-api/prisma/schema.prisma',
  migrations: { path: 'apps/express-api/prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL },
});
