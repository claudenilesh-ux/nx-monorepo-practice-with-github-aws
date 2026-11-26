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

describe('database target validation', () => {
  const { validateDatabaseTarget } = require('../config/load-local');
  const pooled = 'postgresql://fixture:fixture@pooled.db.prisma.io:5432/postgres?sslmode=require';
  const direct = 'postgresql://fixture:fixture@db.prisma.io:5432/postgres?sslmode=require';
  it('accepts matching cloud endpoints and rejects mixed or incomplete targets', () => {
    expect(() => validateDatabaseTarget('cloud', pooled, direct)).not.toThrow();
    expect(() => validateDatabaseTarget('cloud', pooled, undefined)).toThrow();
    expect(() => validateDatabaseTarget('cloud', pooled, direct.replace('fixture:fixture', 'other:fixture'))).toThrow();
    expect(() => validateDatabaseTarget('cloud', pooled.replace('sslmode=require', 'sslmode=disable'), direct)).toThrow();
    expect(() => validateDatabaseTarget('local', pooled, direct)).toThrow();
    expect(() => validateDatabaseTarget('local', 'postgresql://fixture:fixture@localhost:5432/archloom', 'postgresql://fixture:fixture@localhost:5433/archloom')).toThrow();
  });
  it('permits integration writes only to an explicitly selected isolated local test database', () => {
    const local = 'postgresql://fixture:fixture@127.0.0.1:5432/archloom_test';
    expect(() => validateDatabaseTarget('test', local, undefined)).not.toThrow();
    expect(() => validateDatabaseTarget('test', local, direct)).toThrow();
    expect(() => validateDatabaseTarget('test', local.replace('archloom_test', 'archloom'), undefined)).toThrow();
    expect(() => validateDatabaseTarget('test', pooled, undefined)).toThrow();
  });
});
