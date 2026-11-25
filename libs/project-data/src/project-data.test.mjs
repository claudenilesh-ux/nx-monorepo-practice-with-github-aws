import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { validateProjectName, readProjects, writeProjects } from './project-data.ts';

test('normalizes names and rejects invalid or duplicate slugs', () => {
  assert.deepEqual(validateProjectName('  AWS   Architecture  ', []), { name: 'AWS Architecture', slug: 'aws-architecture' });
  assert.equal(validateProjectName('API--Gateway', []).slug, 'api-gateway');
  for (const name of ['', '---', '!!!!', 'Project!', 'a'.repeat(101)]) assert.ok(validateProjectName(name, []).error);
  const projects = [{ id: '1', name: 'API Gateway', slug: 'api-gateway' }];
  assert.ok(validateProjectName('api--gateway', projects).error);
  assert.equal(validateProjectName('api--gateway', projects, '1').slug, 'api-gateway');
});

test('storage is scoped, validated and preserves malformed data', () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  const projects = [{ id: '1', name: 'Project', slug: 'project' }];
  writeProjects(storage, 'user-a', projects);
  assert.deepEqual(readProjects(storage, 'user-a'), projects);
  assert.deepEqual(readProjects(storage, 'user-b'), []);
  const key = [...data.keys()][0]; data.set(key, '{bad');
  assert.throws(() => readProjects(storage, 'user-a'));
  assert.equal(data.get(key), '{bad');
  assert.throws(() => writeProjects({ setItem() { throw Error('full'); } }, 'user-a', projects));
});
