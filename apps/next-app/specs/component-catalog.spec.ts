import { componentCatalog } from '../src/app/editor/component-catalog';

it('contains twelve uniquely identified entries in the approved category order', () => {
  expect(componentCatalog).toHaveLength(12);
  expect(new Set(componentCatalog.map(entry => entry.id)).size).toBe(12);
  expect([...new Set(componentCatalog.map(entry => entry.category))]).toEqual(['Compute', 'Database', 'Networking', 'Storage', 'Applications']);
  expect(componentCatalog.filter(entry => entry.aliases.includes('aws')).map(entry => entry.id)).toEqual(['aws-ec2', 'aws-lambda', 'aws-ecs', 'aws-dynamodb', 'aws-api-gateway', 'aws-cloudfront', 'aws-s3']);
});
