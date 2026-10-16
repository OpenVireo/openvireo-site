#!/usr/bin/env node
// Split the Asciidoctor-built KeePassXC User Guide into one themed Hugo page per chapter.
//
//   node scripts/build-user-guide.mjs path/to/KeePassXC_UserGuide.html
//
// The input is the single-file HTML produced by the keepassxc repository's docs build (with
// images embedded as data URIs). The script writes:
//   content/docs/user-guide/<chapter>.html   one page per chapter, with its section list
//   content/docs/user-guide/_index.html      the guide's landing page (version + intro)
//   static/docs/user-guide/images/*          the extracted images
//   static/docs/KeePassXC_UserGuide.html     a tiny redirect so old links and anchors keep working
//
// Re-run it whenever a new User Guide is released; generated files are replaced wholesale.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content/docs/user-guide');
const imageDir = join(root, 'static/docs/user-guide/images');
const imageUrl = '/docs/user-guide/images';
const redirectFile = join(root, 'static/docs/KeePassXC_UserGuide.html');

// Chapter order on the site (the licence moves to the end), an icon, and the one-line
// summary shown on the landing page cards.
const chapters = {
    _interface_overview: {
        weight: 1, icon: 'fa-table-columns',
        summary: 'Find your way around the main window, toolbar, themes, settings, shortcuts, and command-line options.',
    },
    _database_operations: {
        weight: 2, icon: 'fa-database',
        summary: 'Create, store, and unlock databases, manage entries, search, merge, and keep backups.',
    },
    _database_settings: {
        weight: 3, icon: 'fa-sliders',
        summary: 'Change a database’s name, encryption, and other settings, and keep it in good shape.',
    },
    _password_generator: {
        weight: 4, icon: 'fa-dice',
        summary: 'Generate strong random passwords and memorable passphrases.',
    },
    _importing_databases: {
        weight: 5, icon: 'fa-file-import',
        summary: 'Bring in passwords from CSV files, other password managers, and KeePass 1 databases.',
    },
    _exporting_databases: {
        weight: 6, icon: 'fa-file-export',
        summary: 'Export your database to use in other programs, to print, or to archive.',
    },
    _database_sharing_with_keeshare: {
        weight: 7, icon: 'fa-share-nodes',
        summary: 'Share a subset of your credentials with other people, and receive theirs, using KeeShare.',
    },
    _browser_integration: {
        weight: 8, icon: 'fa-globe',
        summary: 'Connect the KeePassXC-Browser extension to fill in logins on websites automatically.',
    },
    _passkeys: {
        weight: 9, icon: 'fa-fingerprint',
        summary: 'Create passkeys and sign in with them, stored safely in your KeePassXC database.',
    },
    _auto_type: {
        weight: 10, icon: 'fa-keyboard',
        summary: 'Let KeePassXC type your usernames and passwords into any application or website.',
    },
    _secret_service_integration: {
        weight: 11, icon: 'fa-user-secret',
        summary: 'Use KeePassXC as the Secret Service provider for other applications on Linux.',
    },
    _ssh_agent_integration: {
        weight: 12, icon: 'fa-key',
        summary: 'Keep SSH keys in your database and add them to your SSH agent automatically.',
    },
    _command_line_tool: {
        weight: 13, icon: 'fa-terminal',
        summary: 'Access and manage your database from a terminal with keepassxc-cli.',
    },
    _reference: {
        weight: 14, icon: 'fa-book-bookmark',
        summary: 'Placeholders, auto-type actions, cross-references, backup paths, and other details.',
    },
    _license_and_disclaimers: {
        weight: 15, icon: 'fa-scale-balanced',
        summary: 'KeePassXC’s licence, warranty disclaimer, and limitation of liability.',
    },
};

// Links in the source whose target doesn't exist, mapped to the section they mean
const linkAliases = {
    'Setting up SSH Agent integration': '_setup_ssh_agent_integration',
};

const callouts = {
    note: 'fa-circle-info',
    tip: 'fa-lightbulb',
    important: 'fa-circle-exclamation',
    warning: 'fa-triangle-exclamation',
    caution: 'fa-fire',
};

const input = process.argv[2];
if (!input) {
    console.error('Usage: node scripts/build-user-guide.mjs path/to/KeePassXC_UserGuide.html');
    process.exit(1);
}
const source = readFileSync(input, 'utf8');
if (!/<meta name="generator" content="Asciidoctor/.test(source)) {
    console.error(`${input} does not look like Asciidoctor output (is it the redirect stub?)`);
    process.exit(1);
}

const version = source.match(/<span id="revnumber">version ([^<]+)<\/span>/)?.[1].trim() ?? '';
const updated = source.match(/Last updated (\d{4}-\d{2}-\d{2})/)?.[1] ?? '';

const stripTags = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const decode = (text) => text.replace(/&#8217;/g, '’').replace(/&#8230;/g, '…').replace(/&#8201;/g, ' ')
    .replace(/&#8212;/g, '—').replace(/&#8211;/g, '–').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"');
const slugOf = (id) => id.replace(/^_/, '').replace(/_/g, '-');
const yaml = (value) => JSON.stringify(value);

// Split the content into chapters --------------------------------------------------------

const content = source.slice(source.indexOf('<div id="content">'), source.indexOf('<div id="footer">'));
const parts = content.split('<div class="sect1">').slice(1);

const parsed = parts.map((part) => {
    const head = part.match(/^\s*<h2 id="([^"]+)">(?:<a class="anchor"[^>]*><\/a>)?([\s\S]*?)<\/h2>\s*<div class="sectionbody">/);
    if (!head) {
        throw new Error(`Unexpected chapter markup: ${part.slice(0, 200)}`);
    }
    const [, id, title] = head;
    const body = part.slice(head[0].length).replace(/(\s*<\/div>){2,3}\s*$/, '\n');
    const meta = chapters[id];
    if (!meta) {
        throw new Error(`Unknown chapter ${id}: add it to the chapters table in this script`);
    }
    const sections = [...body.matchAll(/<h3 id="([^"]+)">(?:<a class="anchor"[^>]*><\/a>)?([\s\S]*?)<\/h3>/g)]
        .map(([, sid, stitle]) => ({ id: sid, title: decode(stripTags(stitle)) }));
    return { id, slug: slugOf(id), title: decode(stripTags(title)), body, sections, ...meta };
});

// Every id in the guide -> the chapter that holds it, for link rewriting and the redirect
const anchorPage = {};
for (const chapter of parsed) {
    anchorPage[chapter.id] = chapter.slug;
    for (const [, aid] of chapter.body.matchAll(/\sid="([^"]+)"/g)) {
        anchorPage[aid] = chapter.slug;
    }
}

// Transform chapter markup into the site's components ------------------------------------

rmSync(imageDir, { recursive: true, force: true });
mkdirSync(imageDir, { recursive: true });
const written = new Set();

function saveImage(type, data, alt) {
    const bytes = Buffer.from(data, 'base64');
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 8);
    const name = `${(alt || 'image').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${hash}.${type}`;
    if (!written.has(name)) {
        writeFileSync(join(imageDir, name), bytes);
        written.add(name);
    }
    // PNG stores its dimensions in the IHDR chunk; reserve layout space with them
    const size = type === 'png' ? ` width="${bytes.readUInt32BE(16)}" height="${bytes.readUInt32BE(20)}"` : '';
    return { src: `${imageUrl}/${name}`, size };
}

function transform(chapter) {
    let html = chapter.body;

    // Admonitions (rendered by Asciidoctor as one-row tables) -> callouts
    html = html.replace(
        /<div class="admonitionblock (\w+)">\s*<table>\s*<tr>\s*<td class="icon">\s*<i class="fa icon-\w+" title="([^"]*)"><\/i>\s*<\/td>\s*<td class="content">([\s\S]*?)<\/td>\s*<\/tr>\s*<\/table>\s*<\/div>/g,
        (_, kind, label, body) => `<aside class="callout callout-${kind}">
<i class="fa-solid ${callouts[kind] ?? 'fa-circle-info'} callout-icon" aria-hidden="true"></i>
<div class="callout-body">
<p class="callout-label">${label}</p>
${body.trim()}
</div>
</aside>`);

    // Image blocks -> lightbox figures with captions
    html = html.replace(
        /<div class="imageblock">\s*<div class="content">\s*<img src="data:image\/(\w+);base64,([^"]+)" alt="([^"]*)"(?: width="([^"]*)")?>\s*<\/div>\s*(?:<div class="title">([\s\S]*?)<\/div>\s*)?<\/div>/g,
        (_, type, data, alt, width, title) => {
            const { src, size } = saveImage(type, data, alt);
            const style = width?.endsWith('%') ? ` style="max-width: ${width}"` : '';
            const caption = title ? `\n<figcaption>${title.replace(/^Figure \d+\.\s*/, '')}</figcaption>` : '';
            return `<figure class="guide-figure" data-lightbox>
<a href="${src}"${title ? ` data-caption="${stripTags(title).replace(/^Figure \d+\.\s*/, '').replace(/"/g, '&quot;')}"` : ''}><img src="${src}" alt="${alt}"${size}${style} loading="lazy"></a>${caption}
</figure>`;
        });

    // Any remaining inline images
    html = html.replace(/<img src="data:image\/(\w+);base64,([^"]+)" alt="([^"]*)"/g, (_, type, data, alt) => {
        const { src, size } = saveImage(type, data, alt);
        return `<img src="${src}" alt="${alt}"${size} loading="lazy"`;
    });

    // Wide tables scroll inside their own frame on small screens
    // (their fixed print widths are dropped so they fill the column)
    html = html.replace(/<table class="tableblock[\s\S]*?<\/table>/g, (table) =>
        `<div class="table-wrap">\n${table.replace(/^(<table[^>]*?) style="width: [\d.]+%;"/, '$1')}\n</div>`);

    // Print-only page breaks
    html = html.replace(/\s*<div style="page-break-after: always;"><\/div>/g, '');

    // Cross-chapter links -> the page that holds the anchor. Unresolved Asciidoctor xrefs
    // render as "[Target]"; those get the target section's real title.
    const allSections = parsed.flatMap((c) => c.sections);
    html = html.replace(/<a href="#([^"]+)">(\[?)([\s\S]*?)\]?<\/a>/g, (match, anchor, bracket, text) => {
        let target = decodeURIComponent(anchor);
        if (!anchorPage[target]) {
            target = linkAliases[target];
            if (!target) {
                console.warn(`warning: no target for link #${anchor} in ${chapter.slug}`);
                return match;
            }
        }
        const label = bracket ? (allSections.find((s) => s.id === target)?.title ?? text) : text;
        const page = anchorPage[target];
        const href = page === chapter.slug ? `#${target}` : `../${page}/#${target}`;
        return `<a href="${href}">${label}</a>`;
    });

    return html.trim();
}

// Write the pages -----------------------------------------------------------------------

mkdirSync(contentDir, { recursive: true });
for (const file of readdirSync(contentDir)) {
    if (file.endsWith('.html')) {
        rmSync(join(contentDir, file));
    }
}

const banner = '<!-- Generated by scripts/build-user-guide.mjs from the Asciidoctor User Guide; do not edit by hand. -->';

writeFileSync(join(contentDir, '_index.html'), `---
title: User Guide
description: ${yaml('Everything KeePassXC can do, explained chapter by chapter.')}
version: ${yaml(version)}
updated: ${yaml(updated)}
---
${banner}
`);

for (const chapter of parsed) {
    const sections = chapter.sections.map((s) => `  - id: ${yaml(s.id)}\n    title: ${yaml(s.title)}`).join('\n');
    writeFileSync(join(contentDir, `${chapter.slug}.html`), `---
title: ${yaml(chapter.title)}
description: ${yaml(chapter.summary)}
weight: ${chapter.weight}
icon: ${yaml(chapter.icon)}
anchor: ${yaml(chapter.id)}
sections:${sections ? `\n${sections}` : ' []'}
---
${banner}
${transform(chapter)}
`);
}

// Redirect stub for the old single-page URL, preserving deep links -----------------------

writeFileSync(redirectFile, `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>KeePassXC: User Guide</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="/docs/user-guide/">
<meta http-equiv="refresh" content="0; url=/docs/user-guide/">
<script>
// Generated by scripts/build-user-guide.mjs: send #anchors to the chapter that now holds them
const pages = ${JSON.stringify(anchorPage)};
const anchor = decodeURIComponent(location.hash.slice(1));
const page = pages[anchor];
location.replace(page ? '/docs/user-guide/' + page + '/#' + anchor : '/docs/user-guide/');
</script>
</head>
<body>
<p>The User Guide has moved to <a href="/docs/user-guide/">keepassxc.org/docs/user-guide</a>.</p>
</body>
</html>
`);

console.log(`User Guide ${version}: ${parsed.length} chapters, ${written.size} images, ${Object.keys(anchorPage).length} anchors`);
