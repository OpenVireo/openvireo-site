#!/usr/bin/env node
// Refresh everything taken from a keepassxc checkout, in one go:
//   1. every screenshot: the docs images in the checkout's docs/images and the website's
//      product screenshots (one KeePassXC session, see sync-screenshots.mjs)
//   2. the User Guide and Getting Started pages, rebuilt from the checkout's working tree so the
//      new screenshots are used without committing them first (see sync-docs.mjs)
//
//   npm run refresh
//   npm run refresh -- path/to/keepassxc --build-dir path/to/build
//
// Defaults and environment variables (KEEPASSXC_SRC, KEEPASSXC_BUILD) are those of the two
// scripts. To publish docs from a branch or tag instead, run `npm run docs -- --ref <ref>` after
// committing the screenshots there.

import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scripts = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

if (args.includes('-h') || args.includes('--help')) {
    console.log('Usage: npm run refresh -- [path/to/keepassxc] [--build-dir path/to/build]');
    process.exit(0);
}

// sync-docs takes the checkout but not the build folder
const docsArgs = args.filter((arg, i) => arg !== '--build-dir' && args[i - 1] !== '--build-dir');

const run = (script, scriptArgs) =>
    execFileSync(process.execPath, [join(scripts, script), ...scriptArgs], { stdio: 'inherit' });

try {
    console.log('== Screenshots\n');
    run('sync-screenshots.mjs', ['--docs', ...args]);
    console.log('\n== Docs\n');
    run('sync-docs.mjs', docsArgs);
} catch {
    process.exit(1); // the failing script has already explained why
}
