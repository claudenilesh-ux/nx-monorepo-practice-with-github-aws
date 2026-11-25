import { projectName } from './projects.service';

describe('projectName', () => {
  it('normalizes a valid name with the shared rules', () => {
    expect(projectName({ name: '  API--  Gateway  ' })).toEqual({ name: 'API-- Gateway', slug: 'api-gateway' });
  });

  it.each([null, {}, { name: '---' }, { name: 'Project!' }, { name: 'ok', ownerId: 'forged' }])('rejects invalid input', (input) => {
    expect(() => projectName(input)).toThrow('Invalid project name');
  });
});
