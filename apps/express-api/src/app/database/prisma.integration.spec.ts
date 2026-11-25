import { randomUUID } from 'node:crypto';
import { disconnectPrisma, getPrisma } from './prisma';

const integration = process.env.RUN_DATABASE_TESTS === '1' ? describe : describe.skip;

integration('local PostgreSQL', () => {
  const ownerId = `test-${randomUUID()}`;
  const otherOwnerId = `test-${randomUUID()}`;
  let db: ReturnType<typeof getPrisma>;

  beforeAll(() => { db = getPrisma(); });

  afterAll(async () => {
    await db.project.deleteMany({ where: { ownerId: { in: [ownerId, otherOwnerId] } } });
    await disconnectPrisma();
  });

  it('supports CRUD, stable IDs and owner-scoped slugs', async () => {
    const project = await db.project.create({ data: { ownerId, name: 'Test', slug: 'test' } });
    expect((await db.project.findUniqueOrThrow({ where: { id: project.id } })).name).toBe('Test');
    const renamed = await db.project.update({ where: { id: project.id }, data: { name: 'Renamed', slug: 'renamed' } });
    expect(renamed.id).toBe(project.id);
    await expect(db.project.create({ data: { ownerId, name: 'Duplicate', slug: 'renamed' } })).rejects.toMatchObject({ code: 'P2002' });
    const other = await db.project.create({ data: { ownerId: otherOwnerId, name: 'Other', slug: 'renamed' } });
    await db.project.delete({ where: { id: project.id } });
    expect(await db.project.findUnique({ where: { id: project.id } })).toBeNull();
    expect(other.id).not.toBe(project.id);
  });
});
