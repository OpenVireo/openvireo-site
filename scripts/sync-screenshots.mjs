#!/usr/bin/env node
// Recreate the website's product screenshots from a keepassxc build and put them in place.
//
//   npm run screenshots                                   # ../keepassxc, built in cmake-build-debug
//   npm run screenshots -- path/to/keepassxc --build-dir path/to/build
//   npm run screenshots -- --docs                         # also regenerate the checkout's docs/images
//
// The checkout and build folder can also be set with KEEPASSXC_SRC and KEEPASSXC_BUILD. The build
// must be configured with -DWITH_GUI_TESTS=ON. This builds the testdocsscreenshots tool, runs its
// website steps (which open KeePassXC for a few seconds and drive it through a demo database) to
// write each screenshot and its thumbnail into static/assets/img/screenshots/, and updates the
// width/height attributes of every <img> that shows them.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const screenshotsDir = join(root, 'static/assets/img/screenshots');

// What the tool captures: everything on the Screenshots page (the landing page and download
// carousel use the first four)
const screenshots = [
    'database_view',
    'unlock_database',
    'autotype_entrylevel',
    'database_reports',
    'welcome_screen',
    'new_db_wizard_1',
    'new_db_wizard_2',
    'import_wizard',
    'csv_import',
    'edit_entry',
    'edit_entry_icons',
    'password_generator_advanced',
    'passphrase_generator',
    'sshagent_entry_settings',
    'theme_comparison',
];

// Arguments ----------------------------------------------------------------------------------

const args = process.argv.slice(2);
let repo = process.env.KEEPASSXC_SRC || join(root, '..', 'keepassxc');
let buildDir = process.env.KEEPASSXC_BUILD || null;
let docs = false;
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--build-dir') {
        buildDir = args[++i];
    } else if (args[i] === '--docs') {
        docs = true;
    } else if (args[i] === '-h' || args[i] === '--help') {
        console.log('Usage: npm run screenshots -- [path/to/keepassxc] [--build-dir path/to/build] [--docs]');
        process.exit(0);
    } else {
        repo = args[i];
    }
}
repo = resolve(repo);
buildDir = resolve(buildDir ?? join(repo, 'cmake-build-debug'));

function fail(message) {
    console.error(`error: ${message}`);
    process.exit(1);
}

if (!existsSync(join(repo, 'tests/gui/TestDocsScreenshots.cpp'))) {
    fail(`${repo} has no screenshot tool (tests/gui/TestDocsScreenshots.cpp). Pass the keepassxc checkout or set KEEPASSXC_SRC.`);
}
const cache = join(buildDir, 'CMakeCache.txt');
if (!existsSync(cache)) {
    fail(`${buildDir} is not a configured build. Configure one with -DWITH_GUI_TESTS=ON, or pass --build-dir.`);
}
if (!/^WITH_GUI_TESTS:BOOL=ON$/m.test(readFileSync(cache, 'utf8'))) {
    fail(`${buildDir} is configured without GUI tests; reconfigure it with -DWITH_GUI_TESTS=ON.`);
}

// Build and run the tool -----------------------------------------------------------------------

console.log(`Building the screenshot tool in ${buildDir}`);
execFileSync('cmake', ['--build', buildDir, '--target', 'testdocsscreenshots'], { stdio: 'inherit' });

// One app session captures both sets: --docs also writes the checkout's docs/images. The tool
// writes straight into place and leaves files that already show the same thing untouched, so
// only screenshots whose UI changed show up in git.
const env = { ...process.env, LANG: 'en_US.UTF-8', KPXC_SITE_SCREENSHOT_DIR: screenshotsDir };
if (docs) {
    env.KPXC_DOCS_SCREENSHOT_DIR = join(repo, 'docs', 'images');
}
console.log(`Capturing ${docs ? 'docs and website' : 'website'} screenshots (KeePassXC opens for ${docs ? 'about a minute' : 'a few seconds'})`);
const toolDir = join(buildDir, 'tests/gui');
let output;
try {
    // Steps whose folder isn't set skip themselves, so without --docs only the website ones run
    output = execFileSync(join(toolDir, 'testdocsscreenshots'), [], {
        cwd: toolDir,
        env,
        stdio: ['ignore', 'pipe', 'inherit'],
        encoding: 'utf8',
    });
} catch (error) {
    console.error(error.stdout ?? '');
    fail('the screenshot tool failed (see its output above)');
}
// The tool's summary: "<n> screenshots updated, <m> unchanged" and the updated files
const summary = output.split('\n').filter((line) => line.includes('QINFO') || line.startsWith('  /'));
for (const line of summary) {
    console.log(line.replace(/^QINFO\s*:\s*\S+\s*/, '').replace(root + '/', '').replace(repo + '/', 'keepassxc/'));
}

// Keep width/height attributes in step, so pages reserve the right space -----------------------

const sizes = {};
for (const name of screenshots) {
    for (const file of [`${name}.png`, `thumbs/${name}.png`]) {
        if (!existsSync(join(screenshotsDir, file))) {
            fail(`the tool did not produce ${file}`);
        }
        sizes[file] = pngSize(join(screenshotsDir, file));
    }
}
const updated = [];
for (const file of htmlFiles([join(root, 'layouts'), join(root, 'content')])) {
    const html = readFileSync(file, 'utf8');
    // Tags may hold Hugo shortcodes such as {{< baseurl >}}, whose ">" doesn't end the tag
    const next = html.replace(/<img\b(?:\{\{[^}]*\}\}|[^>])*>/g, (tag) => {
        const match = tag.match(/screenshots\/((?:thumbs\/)?[\w-]+\.png)/);
        const size = match && sizes[match[1]];
        if (!size) {
            return tag;
        }
        return tag.replace(/\bwidth="\d+"/, `width="${size[0]}"`).replace(/\bheight="\d+"/, `height="${size[1]}"`);
    });
    if (next !== html) {
        writeFileSync(file, next);
        updated.push(relative(root, file));
    }
}
if (updated.length) {
    console.log(`Updated image sizes in ${updated.join(', ')}`);
}

console.log('\nDone. Review the changes with `git status` and preview them with `hugo serve`.');

// Helpers --------------------------------------------------------------------------------------

// Width and height from a PNG's IHDR chunk
function pngSize(file) {
    const header = readFileSync(file).subarray(0, 24);
    return [header.readUInt32BE(16), header.readUInt32BE(20)];
}

function* htmlFiles(dirs) {
    for (const dir of dirs) {
        for (const entry of readdirSync(dir)) {
            const path = join(dir, entry);
            if (statSync(path).isDirectory()) {
                yield* htmlFiles([path]);
            } else if (path.endsWith('.html')) {
                yield path;
            }
        }
    }
}
