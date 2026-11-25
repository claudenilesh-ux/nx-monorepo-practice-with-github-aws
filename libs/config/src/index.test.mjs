import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requiredValue } from './index.ts';

test('required values reject missing or blank input without echoing it', () => {
  assert.throws(() => requiredValue('VALUE', undefined), { message: 'VALUE is required' });
  assert.throws(() => requiredValue('VALUE', '  '), { message: 'VALUE is required' });
  assert.equal(requiredValue('VALUE', 'configured'), 'configured');
});
