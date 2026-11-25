#!/usr/bin/env node
const { spawn } = require('node:child_process');

const children = new Set();
let stopping = false;
let exitCode = 0;
let forceTimer;

function start(command, args, env) {
  const child = spawn(command, args, { env, stdio: 'inherit', detached: process.platform !== 'win32' });
  children.add(child);
  child.once('error', () => { console.error(`Could not start ${command}.`); stop(1); });
  child.once('close', (code, signal) => {
    children.delete(child);
    if (!stopping) {
      console.error(`${command} exited${signal ? ` (${signal})` : ` (${code})`}.`);
      stop(code || 1);
    }
    if (stopping && children.size === 0) { clearTimeout(forceTimer); process.exitCode = exitCode; }
  });
  return child;
}
function signalChild(child, signal) {
  try { process.kill(process.platform === 'win32' ? child.pid : -child.pid, signal); } catch { /* Already exited. */ }
}
function stop(code) {
  if (stopping) return;
  stopping = true; exitCode = code;
  for (const child of children) signalChild(child, 'SIGTERM');
  if (!children.size) { process.exitCode = code; return; }
  forceTimer = setTimeout(() => { for (const child of children) signalChild(child, 'SIGKILL'); }, 5000);
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

function startApps(env) {
  if (stopping) return;
  console.log('Starting Next.js and Express. Press Ctrl+C to stop them.');
  start('nx', ['dev', 'next-app'], env);
  start('nx', ['serve', 'express-api'], env.ARCHLOOM_DATABASE_PROFILE === 'cloud' ? { ...env, NX_LOAD_DOT_ENV_FILES: 'false' } : env);
}
const appEnv = { ...process.env };
const args = process.argv.slice(2);
if (args.some(arg => !['--local', '--cloud'].includes(arg)) || (args.includes('--local') && args.includes('--cloud'))) {
  console.error('Choose either --local or --cloud.');
  process.exit(1);
}
const cloud = args.includes('--cloud') || (!args.includes('--local') && process.env.ARCHLOOM_SKIP_LOCAL_DATABASE !== '1');
appEnv.ARCHLOOM_DATABASE_PROFILE = cloud ? 'cloud' : 'local';
if (cloud) {
  process.env.ARCHLOOM_DATABASE_PROFILE = 'cloud';
  require('@swc-node/register');
  const { loadExpressLocal, validateDatabaseTarget } = require('../apps/express-api/src/app/config/load-local.ts');
  loadExpressLocal();
  try { validateDatabaseTarget('cloud', process.env.DATABASE_URL, process.env.DIRECT_URL); }
  catch { console.error('Invalid cloud database configuration.'); process.exit(1); }
}
if (cloud || (process.env.ARCHLOOM_SKIP_LOCAL_DATABASE === '1' && !args.includes('--local'))) {
  startApps(appEnv);
} else {
  require('@swc-node/register');
  require('../apps/express-api/src/app/config/load-local.ts').loadExpressLocal();
  const composeEnv = { ...appEnv, POSTGRES_USER: process.env.POSTGRES_USER, POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD };
  console.log('Starting local PostgreSQL and waiting for readiness.');
  const database = start('docker', ['compose', 'up', '-d', '--wait', 'postgres'], composeEnv);
  // A successful Compose exit is expected before the long-running app processes start.
  database.removeAllListeners('close');
  database.once('close', (code, signal) => {
    children.delete(database);
    if (stopping) { if (!children.size) { clearTimeout(forceTimer); process.exitCode = exitCode; } return; }
    if (code === 0 && !signal) startApps(appEnv);
    else { console.error('PostgreSQL did not become ready.'); stop(code || 1); }
  });
}
