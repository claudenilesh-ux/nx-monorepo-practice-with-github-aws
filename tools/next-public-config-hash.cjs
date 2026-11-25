const { createHash } = require('node:crypto');
const { existsSync, readFileSync } = require('node:fs');
const { parse } = require('dotenv');
const file = 'apps/next-app/.env.local';
const local = existsSync(file) ? parse(readFileSync(file)) : {};
const names = new Set([...Object.keys(local), ...Object.keys(process.env)].filter((name) => name.startsWith('NEXT_PUBLIC_')));
const values = [...names].sort().map((name) => [name, process.env[name] ?? local[name]]);
process.stdout.write(createHash('sha256').update(JSON.stringify(values)).digest('hex'));
