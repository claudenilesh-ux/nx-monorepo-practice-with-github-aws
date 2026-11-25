import { getPrisma, disconnectPrisma } from './prisma';

describe('database configuration', () => {
  it('rejects missing configuration without exposing a connection string', () => {
    const original = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    expect(() => getPrisma()).toThrow('DATABASE_URL is required');
    if (original === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = original;
  });
  afterAll(async () => disconnectPrisma());
});
