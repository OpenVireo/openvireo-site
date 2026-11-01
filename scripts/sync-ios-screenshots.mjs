#!/usr/bin/env node
// Recreate the iPhone screenshots (the /ios/ page and the Screenshots page) from an openvireo-ios checkout.
//
//   npm run screenshots:ios                               # ../openvireo-ios
//   npm run screenshots:ios -- path/to/openvireo-ios
//
// The checkout can also be set with OPENVIREO_IOS_SRC. Needs macOS with Xcode and the iPhone 17 Pro Max simulator:
// this runs the checkout's scripts/screenshots.sh (its ScreenshotUITests drive the app through sign-up, a demo
// database, an organisation and an import, with no server), writes each screenshot and a 400 px wide thumbnail
// into static/assets/img/screenshots/ios/, and updates the width/height attributes of every <img> that shows them.
// The app takes the same pictures every run, so only screenshots whose UI changed show up in git.

import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pngSize, updateImageSizes } from './lib/screenshots.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'static/assets/img/screenshots/ios');
const thumbWidth = 400;

// What ScreenshotUITests capture, in the order the pages show them
const screenshots = [
    'welcome',
    'create_account',
    'emergency_kit',
    'new_database',
    'local_unlock',
    'items',
    'entry',
    'edit_entry',
    'generator',
    'organization',
    'import',
];

const args = process.argv.slice(2);
if (args.includes('-h') || args.includes('--help')) {
    console.log('Usage: npm run screenshots:ios -- [path/to/openvireo-ios]');
    process.exit(0);
}
const repo = resolve(args[0] || process.env.OPENVIREO_IOS_SRC || join(root, '..', 'openvireo-ios'));
const script = join(repo, 'scripts/screenshots.sh');
if (!existsSync(script)) {
    console.error(`error: ${repo} has no scripts/screenshots.sh. Pass the openvireo-ios checkout or set OPENVIREO_IOS_SRC.`);
    process.exit(1);
}

// Take the screenshots ------------------------------------------------------------------------

const work = mkdtempSync(join(tmpdir(), 'ov-ios-shots-'));
try {
    console.log('Taking the iPhone screenshots (builds the app and runs its screenshot tests, a few minutes)');
    try {
        execFileSync(script, [work], { stdio: 'inherit' });
    } catch {
        console.error('error: the screenshot script failed (see its output above)');
        process.exit(1);
    }

    // Copy the changed ones and make their thumbnails ------------------------------------------

    mkdirSync(join(outDir, 'thumbs'), { recursive: true });
    const changed = [];
    for (const name of screenshots) {
        const shot = join(work, `${name}.png`);
        const target = join(outDir, `${name}.png`);
        const thumb = join(outDir, 'thumbs', `${name}.png`);
        if (existsSync(target) && existsSync(thumb) && readFileSync(target).equals(readFileSync(shot))) {
            continue;
        }
        copyFileSync(shot, target);
        execFileSync('sips', ['--resampleWidth', String(thumbWidth), target, '--out', thumb], { stdio: 'ignore' });
        changed.push(name);
    }
    console.log(changed.length ? `Updated ${changed.join(', ')}` : 'No screenshot changed');
} finally {
    rmSync(work, { recursive: true, force: true });
}

// Keep width/height attributes in step ----------------------------------------------------------

const sizes = {};
for (const name of screenshots) {
    sizes[`ios/${name}.png`] = pngSize(join(outDir, `${name}.png`));
    sizes[`ios/thumbs/${name}.png`] = pngSize(join(outDir, 'thumbs', `${name}.png`));
}
const updated = updateImageSizes(root, sizes);
if (updated.length) {
    console.log(`Updated image sizes in ${updated.join(', ')}`);
}

console.log('\nDone. Review the changes with `git status` and preview them with `hugo serve`.');
