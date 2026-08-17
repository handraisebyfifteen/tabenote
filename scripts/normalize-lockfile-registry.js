#!/usr/bin/env node
// npm on Replit runs against an internal proxy (NPM_CONFIG_REGISTRY=http://package-firewall.replit.local/npm/),
// and that host name is baked into every `resolved` URL it writes. EAS builders cannot resolve it, so
// `npm ci` there dies with ENOTFOUND. The env var outranks any project .npmrc, so normalize after install.

const fs = require('fs');
const path = require('path');

const PROXY = 'http://package-firewall.replit.local/npm/';
const PUBLIC = 'https://registry.npmjs.org/';

const lockfile = path.join(__dirname, '..', 'package-lock.json');
if (!fs.existsSync(lockfile)) process.exit(0);

const before = fs.readFileSync(lockfile, 'utf8');
const after = before.split(PROXY).join(PUBLIC);
if (before === after) process.exit(0);

const count = before.split(PROXY).length - 1;
fs.writeFileSync(lockfile, after);
console.log(`normalize-lockfile-registry: rewrote ${count} resolved URL(s) to ${PUBLIC}`);
