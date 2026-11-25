import { requiredValue } from '@nx-learning/config';
import { loadExpressLocal } from '../config/load-local';

loadExpressLocal();
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

let client: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!client) {
    const connectionString = requiredValue('DATABASE_URL', process.env.DATABASE_URL);
    client = new PrismaClient({
      adapter: new PrismaPg({ connectionString, max: 5, connectionTimeoutMillis: 5000 }),
    });
  }
  return client;
}

export async function disconnectPrisma(): Promise<void> {
  if (client) {
    const current = client;
    client = undefined;
    await current.$disconnect();
  }
}
