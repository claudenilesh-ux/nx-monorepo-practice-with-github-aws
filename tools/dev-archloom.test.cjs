const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

test('starts database before both apps and shuts down their processes', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archloom-start-'));
  const log = path.join(dir, 'events');
  fs.writeFileSync(path.join(dir, 'docker'), '#!/bin/sh\necho "docker $*" >> "$TEST_LOG"\n', { mode: 0o755 });
  fs.writeFileSync(path.join(dir, 'nx'), '#!/bin/sh\necho "nx $*" >> "$TEST_LOG"\ntrap \'echo stopped >> "$TEST_LOG"; exit 0\' TERM INT\nwhile :; do sleep 1; done\n', { mode: 0o755 });
  const child = spawn(process.execPath, ['tools/dev-archloom.cjs', '--local'], { env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, TEST_LOG: log, POSTGRES_USER: 'test', POSTGRES_PASSWORD: 'test' }, stdio: 'ignore' });
  try {
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline && (!fs.existsSync(log) || fs.readFileSync(log, 'utf8').split('\n').filter(line => line.startsWith('nx ')).length < 2)) await new Promise(resolve => setTimeout(resolve, 50));
    const lines = fs.readFileSync(log, 'utf8');
    assert.match(lines, /^docker compose up -d --wait postgres/m);
    assert.match(lines, /nx dev next-app/);
    assert.match(lines, /nx serve express-api/);
    child.kill('SIGTERM');
    await new Promise(resolve => child.once('exit', resolve));
    assert.equal((fs.readFileSync(log, 'utf8').match(/stopped/g) || []).length, 2);
  } finally { if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL'); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('does not start applications when database readiness fails', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archloom-fail-'));
  const log = path.join(dir, 'events');
  fs.writeFileSync(path.join(dir, 'docker'), '#!/bin/sh\nexit 2\n', { mode: 0o755 });
  fs.writeFileSync(path.join(dir, 'nx'), '#!/bin/sh\necho started >> "$TEST_LOG"\n', { mode: 0o755 });
  const child = spawn(process.execPath, ['tools/dev-archloom.cjs', '--local'], { env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, TEST_LOG: log, POSTGRES_USER: 'test', POSTGRES_PASSWORD: 'test' }, stdio: 'ignore' });
  const code = await new Promise(resolve => child.once('exit', resolve));
  assert.equal(code, 2);
  assert.equal(fs.existsSync(log), false);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('external database mode does not start Compose', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archloom-external-'));
  const log = path.join(dir, 'events');
  fs.writeFileSync(path.join(dir, 'docker'), '#!/bin/sh\necho docker >> "$TEST_LOG"\n', { mode: 0o755 });
  fs.writeFileSync(path.join(dir, 'nx'), '#!/bin/sh\necho nx >> "$TEST_LOG"\nsleep 1\n', { mode: 0o755 });
  const child = spawn(process.execPath, ['tools/dev-archloom.cjs'], { env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, TEST_LOG: log, ARCHLOOM_SKIP_LOCAL_DATABASE: '1' }, stdio: 'ignore' });
  await new Promise(resolve => child.once('exit', resolve));
  assert.doesNotMatch(fs.readFileSync(log, 'utf8'), /docker/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('default cloud mode starts applications without Compose', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archloom-cloud-'));
  const log = path.join(dir, 'events');
  fs.writeFileSync(path.join(dir, 'docker'), '#!/bin/sh\necho docker >> "$TEST_LOG"\n', { mode: 0o755 });
  fs.writeFileSync(path.join(dir, 'nx'), '#!/bin/sh\necho "nx $* $NX_LOAD_DOT_ENV_FILES" >> "$TEST_LOG"\nsleep 1\n', { mode: 0o755 });
  const env = { ...process.env, PATH: `${dir}:${process.env.PATH}`, TEST_LOG: log, DATABASE_URL: 'postgresql://fixture:fixture@pooled.db.prisma.io/postgres?sslmode=require', DIRECT_URL: 'postgresql://fixture:fixture@db.prisma.io/postgres?sslmode=require' };
  delete env.ARCHLOOM_SKIP_LOCAL_DATABASE;
  const child = spawn(process.execPath, ['tools/dev-archloom.cjs'], { env, stdio: 'ignore' });
  await new Promise(resolve => child.once('exit', resolve));
  const lines = fs.readFileSync(log, 'utf8');
  assert.doesNotMatch(lines, /docker/);
  assert.match(lines, /nx serve express-api false/);
  fs.rmSync(dir, { recursive: true, force: true });
});
