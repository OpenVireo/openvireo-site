#!/usr/bin/env node
// Split an Asciidoctor-built KeePassXC guide into one themed Hugo page per chapter.
//
// Normally this runs as part of `npm run docs` (scripts/sync-docs.mjs), which builds the guides
// from a keepassxc checkout first. It can also convert a prebuilt single-file guide, such as one
// from a release package, with images embedded as data URIs:
//
//   node scripts/build-guide.mjs user-guide      path/to/KeePassXC_UserGuide.html
//   node scripts/build-guide.mjs getting-started path/to/KeePassXC_GettingStarted.html
//
// For a guide named <name> it writes:
//   content/docs/<name>/<chapter>.html   one page per chapter, with its section list
//   content/docs/<name>/_index.html      the guide's landing page (version, intro, related guide)
//   static/docs/<name>/images/*          the images the guide uses
//   static/docs/<old file name>          a tiny redirect so old links and #anchors keep working
//
// Generated files are replaced wholesale. Pages are rendered by layouts/guide/ and styled by
// assets/scss/_guide.scss.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Per guide: titles, the old single-page file to redirect, and each chapter's order (weights in
// steps of 10, so new chapters can slot in between), icon, and landing page card summary.
// Chapters missing here still publish, at the end with a generic icon, and print a warning.
export const guides = {
    'user-guide': {
        title: 'User Guide',
        description: 'Everything KeePassXC can do, explained chapter by chapter.',
        oldFile: 'KeePassXC_UserGuide.html',
        related: { title: 'New here? Getting Started', url: '/docs/getting-started/', icon: 'fa-rocket' },
        chapters: {
            _interface_overview: {
                weight: 10, icon: 'fa-table-columns',
                summary: 'Find your way around the main window, database picker, command bar, themes, settings, shortcuts, and command-line options.',
            },
            _database_operations: {
                weight: 20, icon: 'fa-database',
                summary: 'Create, store, and unlock databases, manage entries, search, merge, and keep backups.',
            },
            _database_settings: {
                weight: 30, icon: 'fa-sliders',
                summary: 'Change a database’s name, encryption, and other settings, and keep it in good shape.',
            },
            _remote_database_support: {
                weight: 35, icon: 'fa-arrows-rotate',
                summary: 'Sync a database stored elsewhere using your own download and upload commands, such as scp or rsync.',
            },
            _keepassxc_sync_server: {
                weight: 36, icon: 'fa-server',
                summary: 'Sync a database automatically with your own KeePassXC Sync Server, pair devices, and open older versions.',
            },
            _keepassxc_accounts: {
                weight: 37, icon: 'fa-user-shield',
                summary: 'Sign in to sync your vaults everywhere, share them with people and organizations, and set up service accounts.',
            },
            _password_generator: {
                weight: 40, icon: 'fa-dice',
                summary: 'Generate strong random passwords and memorable passphrases.',
            },
            _importing_databases: {
                weight: 50, icon: 'fa-file-import',
                summary: 'Bring in passwords from CSV files, other password managers, and KeePass 1 databases.',
            },
            _exporting_databases: {
                weight: 60, icon: 'fa-file-export',
                summary: 'Export your database to use in other programs, to print, or to archive.',
            },
            _database_sharing_with_keeshare: {
                weight: 70, icon: 'fa-share-nodes',
                summary: 'Share a subset of your credentials with other people, and receive theirs, using KeeShare.',
            },
            _browser_integration: {
                weight: 80, icon: 'fa-globe',
                summary: 'Connect the KeePassXC-Browser extension to fill in logins on websites automatically.',
            },
            _passkeys: {
                weight: 90, icon: 'fa-fingerprint',
                summary: 'Create passkeys and sign in with them, stored safely in your KeePassXC database.',
            },
            _auto_type: {
                weight: 100, icon: 'fa-keyboard',
                summary: 'Let KeePassXC type your usernames and passwords into any application or website.',
            },
            _secret_service_integration: {
                weight: 110, icon: 'fa-user-secret',
                summary: 'Use KeePassXC as the Secret Service provider for other applications on Linux.',
            },
            _ssh_agent_integration: {
                weight: 120, icon: 'fa-key',
                summary: 'Keep SSH keys in your database and add them to your SSH agent automatically.',
            },
            _command_line_tool: {
                weight: 130, icon: 'fa-terminal',
                summary: 'Access and manage your database from a terminal with keepassxc-cli.',
            },
            _reference: {
                weight: 140, icon: 'fa-book-bookmark',
                summary: 'Placeholders, auto-type actions, cross-references, backup paths, and other details.',
            },
            _license_and_disclaimers: {
                weight: 150, icon: 'fa-scale-balanced',
                summary: 'KeePassXC’s licence, warranty disclaimer, and limitation of liability.',
            },
        },
        // Links in the source whose target doesn't exist, mapped to the section they mean
        // (a /path value points to another guide)
        linkAliases: {
            'Setting up SSH Agent integration': '_setup_ssh_agent_integration',
            'KeePassXC \u2013 SSH Agent integration': '_ssh_agent_integration',
        },
    },
    'getting-started': {
        title: 'Getting Started',
        description: 'Download KeePassXC, create your first database, and connect your browser in a few easy steps.',
        oldFile: 'KeePassXC_GettingStarted.html',
        related: { title: 'Read the full User Guide', url: '/docs/user-guide/', icon: 'fa-book' },
        chapters: {
            _welcome: {
                weight: 10, icon: 'fa-door-open',
                summary: 'What KeePassXC is, how it keeps your information safe, and the features it offers.',
            },
            _downloading_keepassxc: {
                weight: 20, icon: 'fa-download',
                summary: 'Download and install KeePassXC on Windows, macOS, or Linux.',
            },
            _interface_overview: {
                weight: 30, icon: 'fa-table-columns',
                summary: 'Find your way around the main window, database picker, command bar, view options, settings, and shortcuts.',
            },
            _keepassxc_accounts: {
                weight: 35, icon: 'fa-user-shield',
                summary: 'Choose how to use KeePassXC: with an account, with your own sync server, or without an account.',
            },
            _database_operations: {
                weight: 40, icon: 'fa-database',
                summary: 'Create your first database, store and unlock it, and add and find your entries.',
            },
            _password_generator: {
                weight: 50, icon: 'fa-dice',
                summary: 'Generate strong random passwords and memorable passphrases.',
            },
            _browser_integration: {
                weight: 60, icon: 'fa-globe',
                summary: 'Install and connect the KeePassXC-Browser extension to fill in logins on websites.',
            },
            _contact_us: {
                weight: 70, icon: 'fa-comments',
                summary: 'Report bugs, request features, and get in touch with the KeePassXC team.',
            },
            _license_and_disclaimers: {
                weight: 80, icon: 'fa-scale-balanced',
                summary: 'KeePassXC\u2019s licence, warranty disclaimer, and limitation of liability.',
            },
        },
        // Links in the source whose target doesn't exist here; a /path points to another guide
        linkAliases: {
            'Database Maintenance': '/docs/user-guide/database-settings/#_database_maintenance',
            'KeePassXC Sync Server': '/docs/user-guide/keepassxc-sync-server/',
        },
    },
};

const callouts = {
    note: 'fa-circle-info',
    tip: 'fa-lightbulb',
    important: 'fa-circle-exclamation',
    warning: 'fa-triangle-exclamation',
    caution: 'fa-fire',
};

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const stripTags = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const decode = (text) => text.replace(/&#8217;/g, '’').replace(/&#8230;/g, '…').replace(/&#8201;/g, ' ')
    .replace(/&#8212;/g, '—').replace(/&#8211;/g, '–').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"');
const slugOf = (id) => id.replace(/^_/, '').replace(/_/g, '-');
const yaml = (value) => JSON.stringify(value);

/**
 * Split one Asciidoctor HTML guide into Hugo pages.
 *
 * @param {string} name     Guide key in `guides` (user-guide, getting-started)
 * @param {string} source   The Asciidoctor HTML
 * @param {object} options  assetDir: folder that relative image paths resolve against;
 *                          origin: where the docs came from, recorded in the landing page;
 *                          updated: last-updated date (default: read from the HTML footer)
 */
export function buildGuide(name, source, { assetDir, origin, updated: updatedDate } = {}) {
    const guide = guides[name];
    if (!guide) {
        throw new Error(`Unknown guide ${name}; expected one of ${Object.keys(guides).join(', ')}`);
    }
    if (!/<meta name="generator" content="Asciidoctor/.test(source)) {
        throw new Error(`The ${name} input does not look like Asciidoctor output (is it the redirect stub?)`);
    }

    const baseUrl = `/docs/${name}`;
    const contentDir = join(root, 'content/docs', name);
    const imageDir = join(root, 'static/docs', name, 'images');
    const imageUrl = `${baseUrl}/images`;
    const redirectFile = join(root, 'static/docs', guide.oldFile);
    const { chapters, linkAliases } = guide;

    const version = source.match(/<span id="revnumber">version ([^<]+)<\/span>/)?.[1].trim() ?? '';
    const updated = updatedDate ?? source.match(/Last updated (\d{4}-\d{2}-\d{2})/)?.[1] ?? '';

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
        let meta = chapters[id];
        if (!meta) {
            console.warn(`warning: new chapter ${id} in ${name}; add it to the guides table in scripts/build-guide.mjs`);
            const intro = decode(stripTags(body.match(/<div class="paragraph">\s*<p>([\s\S]*?)<\/p>/)?.[1] ?? ''));
            meta = {
                weight: 1000 + parts.indexOf(part),
                icon: 'fa-book-open',
                summary: intro.length > 160 ? `${intro.slice(0, 160).replace(/\s+\S*$/, '')}\u2026` : intro,
            };
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

    // Images are either embedded data URIs (a prebuilt single-file guide) or paths relative to
    // assetDir (a build from a keepassxc checkout, which keeps the source file names).
    function saveImage(src, alt) {
        let bytes;
        let fileName;
        const dataUri = src.match(/^data:image\/(\w+);base64,(.+)$/);
        if (dataUri) {
            bytes = Buffer.from(dataUri[2], 'base64');
            const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 8);
            fileName = `${(alt || 'image').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${hash}.${dataUri[1]}`;
        } else {
            if (!assetDir) {
                throw new Error(`Image ${src} is not embedded; pass the docs folder it is relative to`);
            }
            bytes = readFileSync(join(assetDir, src));
            fileName = basename(src);
        }
        if (!written.has(fileName)) {
            writeFileSync(join(imageDir, fileName), bytes);
            written.add(fileName);
        }
        // PNG stores its dimensions in the IHDR chunk; reserve layout space with them
        const isPng = bytes.subarray(1, 4).toString() === 'PNG';
        const size = isPng ? ` width="${bytes.readUInt32BE(16)}" height="${bytes.readUInt32BE(20)}"` : '';
        return { src: `${imageUrl}/${fileName}`, size };
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
            /<div class="imageblock">\s*<div class="content">\s*<img src="([^"]+)" alt="([^"]*)"(?: width="([^"]*)")?>\s*<\/div>\s*(?:<div class="title">([\s\S]*?)<\/div>\s*)?<\/div>/g,
            (_, original, alt, width, title) => {
                const { src, size } = saveImage(original, alt);
                const style = width?.endsWith('%') ? ` style="max-width: ${width}"` : '';
                const caption = title ? `\n<figcaption>${title.replace(/^Figure \d+\.\s*/, '')}</figcaption>` : '';
                return `<figure class="guide-figure" data-lightbox>
<a href="${src}"${title ? ` data-caption="${stripTags(title).replace(/^Figure \d+\.\s*/, '').replace(/"/g, '&quot;')}"` : ''}><img src="${src}" alt="${alt}"${size}${style} loading="lazy"></a>${caption}
</figure>`;
            });

        // Any remaining inline images
        html = html.replace(/<img src="((?!\/docs\/)[^"]+)" alt="([^"]*)"/g, (_, original, alt) => {
            const { src, size } = saveImage(original, alt);
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
                if (target.startsWith('/')) {
                    return `<a href="${target}">${bracket ? anchor : text}</a>`;
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

    const banner = `<!-- Generated by scripts/build-guide.mjs from the Asciidoctor ${guide.oldFile}; do not edit by hand. -->`;

    writeFileSync(join(contentDir, '_index.html'), `---
title: ${yaml(guide.title)}
description: ${yaml(guide.description)}
version: ${yaml(version)}
updated: ${yaml(updated)}${origin ? `\norigin: ${yaml(origin)}` : ''}
related:
  title: ${yaml(guide.related.title)}
  url: ${yaml(guide.related.url)}
  icon: ${yaml(guide.related.icon)}
type: guide
cascade:
  type: guide
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
<title>KeePassXC: ${guide.title}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${baseUrl}/">
<meta http-equiv="refresh" content="0; url=${baseUrl}/">
<script>
// Generated by scripts/build-guide.mjs: send #anchors to the chapter that now holds them
const pages = ${JSON.stringify(anchorPage)};
const anchor = decodeURIComponent(location.hash.slice(1));
const page = pages[anchor];
location.replace(page ? '${baseUrl}/' + page + '/#' + anchor : '${baseUrl}/');
</script>
</head>
<body>
<p>The ${guide.title} guide has moved to <a href="${baseUrl}/">keepassxc.org${baseUrl}</a>.</p>
</body>
</html>
`);

    return { title: guide.title, version, chapters: parsed.length, images: written.size, anchors: Object.keys(anchorPage).length };
}

// Command line: convert a prebuilt single-file guide ---------------------------------------

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    const [name, input] = process.argv.slice(2);
    if (!guides[name] || !input) {
        console.error(`Usage: node scripts/build-guide.mjs <${Object.keys(guides).join('|')}> path/to/guide.html`);
        console.error('To build straight from a keepassxc checkout, use scripts/sync-docs.mjs (npm run docs).');
        process.exit(1);
    }
    const result = buildGuide(name, readFileSync(input, 'utf8'), { assetDir: dirname(input) });
    console.log(`${result.title} ${result.version}: ${result.chapters} chapters, ${result.images} images, ${result.anchors} anchors`);
}
