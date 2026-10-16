#!/usr/bin/env node
// Build the User Guide and Getting Started guide straight from a keepassxc checkout and
// publish them as themed site pages, in one step.
//
//   npm run docs                                  # ../keepassxc, as it is on disk
//   npm run docs -- --ref develop                 # a branch, tag, or commit (working tree untouched)
//   npm run docs -- path/to/keepassxc --ref 2.8.0
//
// The checkout can also be set with KEEPASSXC_SRC. This runs Asciidoctor on the guides'
// AsciiDoc sources (as the keepassxc docs build does, minus the embedded images), then hands
// the HTML to scripts/build-guide.mjs, which writes content/docs/<guide>/ and copies the
// screenshots from docs/images under their original names.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGuide } from './build-guide.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const sources = {
    'user-guide': 'UserGuide.adoc',
    'getting-started': 'GettingStarted.adoc',
};

// Arguments ----------------------------------------------------------------------------------

const args = process.argv.slice(2);
let ref = null;
let repo = process.env.KEEPASSXC_SRC || join(root, '..', 'keepassxc');
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ref') {
        ref = args[++i];
    } else if (args[i] === '-h' || args[i] === '--help') {
        console.log('Usage: npm run docs -- [path/to/keepassxc] [--ref <branch|tag|commit>]');
        process.exit(0);
    } else {
        repo = args[i];
    }
}
repo = resolve(repo);

function fail(message) {
    console.error(`error: ${message}`);
    process.exit(1);
}

const git = (...gitArgs) => execFileSync('git', ['-C', repo, ...gitArgs], { encoding: 'utf8' }).trim();

if (!existsSync(join(repo, 'docs', 'UserGuide.adoc'))) {
    fail(`${repo} is not a keepassxc checkout (no docs/UserGuide.adoc). Pass its path or set KEEPASSXC_SRC.`);
}
try {
    execFileSync('asciidoctor', ['--version'], { stdio: 'ignore' });
} catch {
    fail('asciidoctor is not installed. Install it with `brew install asciidoctor` or `gem install asciidoctor`.');
}

// Source: a git ref exported to a temporary folder, or the working tree as is -----------------

let docsDir;
let cmakeFile;
let tempDir = null;
let origin;
let updated;

if (ref) {
    let commit;
    try {
        commit = git('rev-parse', '--short', `${ref}^{commit}`);
    } catch {
        fail(`unknown ref "${ref}" in ${repo}`);
    }
    tempDir = mkdtempSync(join(tmpdir(), 'keepassxc-docs-'));
    execFileSync('sh', ['-c', `git -C "$1" archive "$2" docs CMakeLists.txt | tar -x -C "$3"`, 'sh', repo, commit, tempDir]);
    docsDir = join(tempDir, 'docs');
    cmakeFile = join(tempDir, 'CMakeLists.txt');
    origin = `${ref}@${commit}`;
    updated = git('log', '-1', '--format=%cs', commit, '--', 'docs');
} else {
    docsDir = join(repo, 'docs');
    cmakeFile = join(repo, 'CMakeLists.txt');
    const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
    const dirty = git('status', '--porcelain', '--', 'docs') !== '';
    origin = `${branch}@${git('rev-parse', '--short', 'HEAD')}${dirty ? ' (with uncommitted docs changes)' : ''}`;
    updated = dirty ? new Date().toISOString().slice(0, 10) : git('log', '-1', '--format=%cs', '--', 'docs');
}

// Same version string the keepassxc build stamps into the guides
const cmake = readFileSync(cmakeFile, 'utf8');
const part = (name) => cmake.match(new RegExp(`set\\(KEEPASSXC_VERSION_${name} "(\\d+)"\\)`))?.[1];
const version = [part('MAJOR'), part('MINOR'), part('PATCH')].every(Boolean)
    ? `${part('MAJOR')}.${part('MINOR')}.${part('PATCH')}`
    : fail(`could not read KEEPASSXC_VERSION from ${cmakeFile}`);

console.log(`Building docs ${version} from ${repo} (${origin})`);

// Build and split each guide -------------------------------------------------------------------

try {
    for (const [name, adoc] of Object.entries(sources)) {
        // Images stay as files (data-uri off) so they are copied under their source names
        const html = execFileSync('asciidoctor', [
            '-o', '-',
            '-a', `revnumber=${version}`,
            '-a', 'data-uri!',
            adoc,
        ], { cwd: docsDir, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'inherit'] });

        const result = buildGuide(name, html, { assetDir: docsDir, origin, updated });
        console.log(`  ${result.title}: ${result.chapters} chapters, ${result.images} images, ${result.anchors} anchors`);
    }
} finally {
    if (tempDir) {
        rmSync(tempDir, { recursive: true, force: true });
    }
}

console.log('\nDone. Review the changes with `git status` and preview them with `hugo serve`.');
