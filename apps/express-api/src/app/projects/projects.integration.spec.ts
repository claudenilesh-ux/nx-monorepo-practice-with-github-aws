import { randomUUID } from 'node:crypto';
import { disconnectPrisma, getPrisma } from '../database/prisma';
import { createProject, deleteProject, listProjects, renameProject } from './projects.service';

const integration = process.env.RUN_DATABASE_TESTS === '1' ? describe : describe.skip;
integration('project service with PostgreSQL', () => {
  const owner = `test-${randomUUID()}`, other = `test-${randomUUID()}`;
  afterAll(async () => {
    await getPrisma().project.deleteMany({ where: { ownerId: { in: [owner, other] } } });
    await disconnectPrisma();
  });
  it('enforces ownership, uniqueness and stable rename', async () => {
    const project = await createProject(owner, { name: 'Alpha' });
    const same = await renameProject(owner, project.id, { name: ' Alpha ' });
    expect(same.updatedAt).toEqual(project.updatedAt);
    await expect(renameProject(other, project.id, { name: 'Stolen' })).rejects.toMatchObject({ code: 'PROJECT_NOT_FOUND' });
    await expect(deleteProject(other, project.id)).rejects.toMatchObject({ code: 'P2025' });
    const renamed = await renameProject(owner, project.id, { name: 'Beta' });
    expect(renamed.id).toBe(project.id);
    await expect(createProject(owner, { name: 'Beta' })).rejects.toMatchObject({ code: 'P2002' });
    const otherProject = await createProject(other, { name: 'Beta' });
    expect((await listProjects(owner)).map(p => p.id)).toEqual([project.id]);
    expect((await listProjects(other)).map(p => p.id)).toEqual([otherProject.id]);
    const concurrent = await Promise.allSettled([createProject(owner, { name: 'Race' }), createProject(owner, { name: 'Race' })]);
    expect(concurrent.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(concurrent.filter(result => result.status === 'rejected')).toHaveLength(1);
    const race = (await listProjects(owner)).find(p => p.slug === 'race');
    expect(race).toBeDefined();
    await expect(renameProject(owner, project.id, { name: 'Race' })).rejects.toMatchObject({ code: 'P2002' });
    await getPrisma().projectCollaborator.create({ data: { projectId: project.id, userId: other } });
    await expect(renameProject(other, project.id, { name: 'Stolen' })).rejects.toMatchObject({ code: 'PROJECT_NOT_FOUND' });
    expect((await listProjects(owner)).find(p => p.id === project.id)?.name).toBe('Beta');
    await deleteProject(owner, project.id);
    expect((await listProjects(owner)).some(p => p.id === project.id)).toBe(false);
  });
});
