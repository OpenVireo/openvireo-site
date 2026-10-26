#!/usr/bin/env node
// Publish the developer docs, the Markdown in openvireo-sync-server/docs and openvireo-sdk/docs, as
// themed guide pages, the same way sync-docs.mjs publishes the User Guide from openvireo.
//
//   npm run docs:dev                                  # both repos at their latest release tag
//   npm run docs:dev -- --ref develop                 # both at a branch, tag, or commit
//   npm run docs:dev -- --sync-ref v1.2.0 --sdk-ref v0.3.0
//   npm run docs:dev -- --only sdk --no-api           # one guide, without rebuilding the API reference
//
// The checkouts default to ../openvireo-sync-server and ../openvireo-sdk; OPENVIREO_SYNC_SRC and
// OPENVIREO_SDK_SRC override them. Files are read from the ref with git, so the working trees are left
// alone. For each guide it writes:
//   content/docs/<guide>/_index.md          the landing page (chapter cards)
//   content/docs/<guide>/<page>.md          one page per docs/*.md file
// plus, for the sync server, an API reference page generated from docs/openapi.yaml and a copy of that
// file in static/docs/sync-server/, and for the SDK the TypeDoc reference in static/docs/sdk/api/.
// Generated files are replaced wholesale; edit the docs in their own repositories.

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Per guide: where it comes from, its landing page, and each page's order (weights in steps of 10),
// icon and card summary. A docs file missing here still publishes, at the end, with a warning;
// files under `unpublished` don't.
const guides = {
    'sync-server': {
        repo: 'openvireo-sync-server',
        env: 'OPENVIREO_SYNC_SRC',
        title: 'Sync Server',
        description: 'Run your own OpenVireo Sync Server, or build a client for its HTTP API.',
        product: 'OpenVireo Sync Server',
        related: { title: 'Building on OpenVireo? SDK', url: '/docs/sdk/', icon: 'fa-code' },
        unpublished: ['docs/stateless-design.md'],
        apiReference: true,
        pages: {
            'docs/index.md': { slug: 'overview', weight: 10, icon: 'fa-server', summary: 'What the server does, how sync works, and a quick start.' },
            'docs/install.md': { slug: 'install', weight: 20, icon: 'fa-download', summary: 'Build from source, run the Docker image, deploy to DigitalOcean, put HTTPS in front.' },
            'docs/configuration.md': { slug: 'configuration', weight: 30, icon: 'fa-sliders', summary: 'Every SYNC_* setting, and the data directory or Postgres and S3 storage.' },
            'docs/users-and-devices.md': { slug: 'users-and-devices', weight: 40, icon: 'fa-users', summary: 'Add users and devices, pair new devices, shut out a lost one.' },
            'docs/accounts.md': { slug: 'accounts', weight: 50, icon: 'fa-id-card', summary: 'Run the server behind an OpenVireo account server, with access tokens and vaults.' },
            'docs/api.md': { slug: 'api', weight: 60, icon: 'fa-plug', summary: 'Routes, concurrency, history, events, CORS and errors.' },
            'api-reference': { slug: 'api-reference', weight: 70, icon: 'fa-book-open', summary: 'Every route, its parameters and responses, from the OpenAPI description.' },
            'docs/operations.md': { slug: 'operations', weight: 80, icon: 'fa-gauge-high', summary: 'Backups, upgrades, moving to Postgres, scaling and monitoring.' },
            'docs/development.md': { slug: 'development', weight: 90, icon: 'fa-code-branch', summary: 'Source layout, tests and releases.' },
        },
    },
    sdk: {
        repo: 'openvireo-sdk',
        env: 'OPENVIREO_SDK_SRC',
        title: 'SDK',
        description: 'Build on OpenVireo with the TypeScript SDK, the ov CLI, ov connect and the GitHub Action.',
        product: 'OpenVireo SDK',
        related: { title: 'API reference', url: '/docs/sdk/api/', icon: 'fa-book-open' },
        unpublished: [],
        typedoc: true,
        pages: {
            'docs/index.md': { slug: 'overview', weight: 10, icon: 'fa-cube', summary: 'The packages, installing, and a first program.' },
            'docs/concepts.md': { slug: 'concepts', weight: 20, icon: 'fa-key', summary: 'Keys, vaults, roles, organisations, references, and what the servers see.' },
            'docs/guides/hosted-account.md': { slug: 'hosted-account', weight: 30, icon: 'fa-right-to-bracket', summary: 'Sign up, sign in, unlock and lock, sessions and storage.' },
            'docs/guides/vaults-and-sharing.md': { slug: 'vaults-and-sharing', weight: 40, icon: 'fa-vault', summary: 'Open, read and write vaults; create, share, revoke; organisations.' },
            'docs/guides/events.md': { slug: 'events', weight: 50, icon: 'fa-bolt', summary: 'React to changes from other devices and to access changes.' },
            'docs/guides/offline.md': { slug: 'offline', weight: 60, icon: 'fa-plane', summary: 'Keep working without the network, and catch up afterwards.' },
            'docs/guides/move-to-account.md': { slug: 'move-to-account', weight: 70, icon: 'fa-file-import', summary: 'Turn an existing database into a vault.' },
            'docs/guides/recovery.md': { slug: 'recovery', weight: 80, icon: 'fa-life-ring', summary: 'Account resets and restoring the old vaults.' },
            'docs/guides/service-accounts.md': { slug: 'service-accounts', weight: 90, icon: 'fa-robot', summary: 'Secrets for CI, servers and long-running processes.' },
            'docs/guides/self-hosted-sync.md': { slug: 'self-hosted-sync', weight: 100, icon: 'fa-server', summary: 'Sync .kdbx files with a self-hosted server, no account needed.' },
            'docs/guides/testing.md': { slug: 'testing', weight: 110, icon: 'fa-vial', summary: 'Test your app against in-memory servers.' },
            'docs/cli.md': { slug: 'cli', weight: 120, icon: 'fa-terminal', summary: 'ov: read, inject, run and rotate secrets from the command line.' },
            'docs/connect.md': { slug: 'connect', weight: 130, icon: 'fa-network-wired', summary: 'ov connect: a REST server for one service account, and Kubernetes.' },
            'docs/github-action.md': { slug: 'github-action', weight: 140, icon: 'fa-gears', summary: 'Load secrets into GitHub Actions workflows.' },
            'docs/errors.md': { slug: 'errors', weight: 150, icon: 'fa-triangle-exclamation', summary: 'Every error code and what to do about it.' },
            'docs/merge-behaviour.md': { slug: 'merge-behaviour', weight: 160, icon: 'fa-code-merge', summary: 'How concurrent edits are combined, exactly.' },
            'docs/lower-level.md': { slug: 'lower-level', weight: 170, icon: 'fa-layer-group', summary: 'The sync loop, HTTP clients, KDBX helpers, Argon2 and OPAQUE.' },
        },
    },
};

// Arguments ----------------------------------------------------------------------------------

const args = process.argv.slice(2);
const refs = {};
let only = null;
let buildApi = true;
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--ref') {
        refs['sync-server'] = refs.sdk = args[++i];
    } else if (arg === '--sync-ref') {
        refs['sync-server'] = args[++i];
    } else if (arg === '--sdk-ref') {
        refs.sdk = args[++i];
    } else if (arg === '--only') {
        only = args[++i];
    } else if (arg === '--no-api') {
        buildApi = false;
    } else if (arg === '-h' || arg === '--help') {
        console.log('Usage: npm run docs:dev -- [--ref <ref>] [--sync-ref <ref>] [--sdk-ref <ref>] [--only sync-server|sdk] [--no-api]');
        process.exit(0);
    } else {
        fail(`unknown argument ${arg}`);
    }
}
if (only && !guides[only]) fail(`--only takes ${Object.keys(guides).join(' or ')}`);

function fail(message) {
    console.error(`error: ${message}`);
    process.exit(1);
}

const gitIn = (repo) => (...gitArgs) => execFileSync('git', ['-C', repo, ...gitArgs], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();

// Markdown -------------------------------------------------------------------------------------

/** GitHub's (and Hugo's "github") heading ids, so #anchors work the same on both. */
function headingId(text, used) {
    const plain = text
        .replace(/`([^`]*)`/g, '$1')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[*_]/g, '');
    let id = plain.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s/g, '-');
    if (used.has(id)) {
        let n = 1;
        while (used.has(`${id}-${n}`)) n++;
        id = `${id}-${n}`;
    }
    used.add(id);
    return id;
}

const yamlString = (s) => JSON.stringify(s);

/**
 * Turns one docs file into a page body: drops the title and the code-sample comments, moves headings
 * down a level (the guide layout's sections are h3), turns off line numbers in code blocks, and points
 * links at the site (pages it publishes) or GitHub (everything else).
 */
function convert(markdown, file, ctx) {
    const lines = markdown.split('\n');
    const out = [];
    const sections = [];
    const used = new Set();
    let title = null;
    let fence = null;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const open = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(line);
        if (fence) {
            if (open && open[2].startsWith(fence) && open[3].trim() === '') fence = null;
            out.push(line);
            continue;
        }
        if (open) {
            fence = open[2];
            const info = open[3].trim();
            out.push(`${open[1]}${open[2]}${info || 'text'} {linenos=false}`);
            continue;
        }
        if (title === null && /^# /.test(line)) {
            title = line.slice(2).trim().replace(/`/g, '');
            continue;
        }
        // Prelude and no-check comments are for the SDK's sample checker
        if (/^<!--\s*(prelude|no-check)\b/.test(line)) {
            while (i < lines.length && !lines[i].includes('-->')) i++;
            continue;
        }
        const heading = /^(#{2,5}) (.*)$/.exec(line);
        if (heading) {
            const id = headingId(heading[2], used);
            if (heading[1] === '##') sections.push({ id, title: heading[2].replace(/`/g, '') });
            line = `#${heading[1]} ${heading[2]} {#${id}}`;
        }
        out.push(rewriteLinks(line, file, ctx));
    }
    return { title, sections, body: out.join('\n').replace(/^\n+/, '') };
}

function rewriteLinks(line, file, ctx) {
    // Inline code keeps its text: split it out first
    return line.split(/(`[^`]*`)/).map((part, n) => (n % 2 ? part : part.replace(/\]\(([^)\s]+)\)/g, (m, target) => `](${linkTarget(target, file, ctx)})`))).join('');
}

function linkTarget(target, file, ctx) {
    if (/^https:\/\/openvireo\.com\//.test(target)) return target.replace('https://openvireo.com', '');
    const gh = /^https:\/\/github\.com\/openvireo\/([\w-]+)\/blob\/[^/]+\/(docs\/[^#]+\.md)(#.*)?$/i.exec(target);
    if (gh) {
        const page = ctx.pageUrl(gh[1], gh[2]);
        return page ? page + (gh[3] ?? '') : target;
    }
    if (/^[a-z]+:/i.test(target) || target.startsWith('#') || target.startsWith('/')) return target;
    const [path, anchor = ''] = target.split('#');
    const resolved = posix.normalize(posix.join(posix.dirname(file), path));
    const page = ctx.pageUrl(ctx.repo, resolved);
    if (page) return page + (anchor ? `#${anchor}` : '');
    if (resolved === 'docs/openapi.yaml' && ctx.repo === 'openvireo-sync-server') return '/docs/sync-server/openapi.yaml';
    const kind = ctx.isDirectory(resolved.replace(/\/$/, '')) ? 'tree' : 'blob';
    return `https://github.com/openvireo/${ctx.repo}/${kind}/${ctx.ref}/${resolved.replace(/\/$/, '')}${anchor ? `#${anchor}` : ''}`;
}

function frontMatter(fields) {
    const lines = ['---'];
    for (const [key, value] of Object.entries(fields)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
            if (value.length === 0) {
                lines.push(`${key}: []`);
                continue;
            }
            lines.push(`${key}:`);
            for (const item of value) {
                const entries = Object.entries(item);
                lines.push(`  - ${entries[0][0]}: ${yamlString(entries[0][1])}`);
                for (const [k, v] of entries.slice(1)) lines.push(`    ${k}: ${yamlString(v)}`);
            }
        } else if (value && typeof value === 'object') {
            lines.push(`${key}:`);
            for (const [k, v] of Object.entries(value)) lines.push(`  ${k}: ${yamlString(v)}`);
        } else {
            lines.push(`${key}: ${yamlString(value)}`);
        }
    }
    lines.push('---');
    return lines.join('\n');
}

// OpenAPI → Markdown -------------------------------------------------------------------------

function apiReference(spec) {
    const refOf = (obj) => {
        let o = obj;
        for (let n = 0; o && o.$ref && n < 10; n++) {
            o = o.$ref.replace(/^#\//, '').split('/').reduce((acc, k) => acc?.[k.replace(/~1/g, '/').replace(/~0/g, '~')], spec);
        }
        return o ?? {};
    };
    const schemaText = (s) => {
        const schema = refOf(s);
        if (s?.$ref) return `\`${s.$ref.split('/').pop()}\``;
        if (schema.const !== undefined) return `\`${JSON.stringify(schema.const)}\``;
        if (schema.enum) return schema.enum.map((v) => `\`${v}\``).join(', ');
        if (schema.type === 'array') return `array of ${schemaText(schema.items)}`;
        const type = Array.isArray(schema.type) ? schema.type.join(' or ') : schema.type ?? 'object';
        return schema.format ? `${type} (${schema.format})` : type;
    };
    const oneLine = (s) => (s ?? '').trim().replace(/\s*\n\s*/g, ' ');
    const cell = (s) => oneLine(s).replace(/\|/g, '\\|');
    const properties = (schema) => {
        const s = refOf(schema);
        const required = new Set(s.required ?? []);
        return Object.entries(s.properties ?? {}).map(([name, p]) =>
            `| \`${name}\`${required.has(name) ? '' : ' (optional)'} | ${schemaText(p)} | ${cell(refOf(p).description)} |`);
    };

    const out = [];
    out.push(`# API reference`, '');
    out.push(oneLine(spec.info.description).split('. ').length ? spec.info.description.trim() : '', '');
    out.push(`The machine-readable description is [openapi.yaml](/docs/sync-server/openapi.yaml) (OpenAPI ${spec.openapi}); `
        + 'import it into an HTTP client or a code generator. [HTTP API](/docs/sync-server/api/) explains how the routes fit together.', '');
    out.push('## Authentication', '');
    out.push('| Scheme | |', '|---|---|');
    for (const [name, scheme] of Object.entries(spec.components.securitySchemes)) out.push(`| \`${name}\` | ${cell(scheme.description)} |`);
    out.push('');

    for (const tag of spec.tags) {
        const ops = [];
        for (const [path, item] of Object.entries(spec.paths)) {
            for (const method of ['get', 'put', 'post', 'delete']) {
                if (item[method]?.tags?.includes(tag.name)) ops.push({ path, method, op: item[method], shared: item.parameters ?? [] });
            }
        }
        if (!ops.length) continue;
        out.push(`## ${tag.name[0].toUpperCase()}${tag.name.slice(1)}`, '');
        if (tag.description) out.push(tag.description, '');
        for (const { path, method, op, shared } of ops) {
            out.push(`### ${method.toUpperCase()} ${spec.servers?.[0] ? '/api/v1' : ''}${path}`, '');
            out.push(`**${oneLine(op.summary)}**${op.operationId ? ` (\`${op.operationId}\`)` : ''}`, '');
            if (op.description) out.push(op.description.trim(), '');
            const security = op.security ?? spec.security ?? [];
            out.push(`Token: ${security.length ? security.map((s) => `\`${Object.keys(s)[0]}\``).join(' or ') : 'none'}`, '');
            const params = [...shared, ...(op.parameters ?? [])].map(refOf);
            if (params.length) {
                out.push('| Parameter | In | Type | |', '|---|---|---|---|');
                for (const p of params) out.push(`| \`${p.name}\`${p.required ? '' : ' (optional)'} | ${p.in} | ${schemaText(p.schema)} | ${cell(p.description)} |`);
                out.push('');
            }
            const body = op.requestBody && refOf(op.requestBody);
            if (body?.content) {
                const [type, media] = Object.entries(body.content)[0];
                out.push(`Request body (\`${type}\`)${body.description ? `: ${oneLine(body.description)}` : ''}`, '');
                const rows = media.schema ? properties(media.schema) : [];
                if (rows.length) out.push('| Field | Type | |', '|---|---|---|', ...rows, '');
            }
            out.push('| Status | |', '|---|---|');
            for (const [status, r] of Object.entries(op.responses)) {
                const resp = refOf(r);
                const schema = resp.content && Object.values(resp.content)[0]?.schema;
                const shape = schema ? ` ${schemaText(schema)}` : '';
                out.push(`| ${status} | ${cell(resp.description)}${shape ? ` (${shape.trim()})` : ''} |`);
            }
            out.push('');
        }
    }

    out.push('## Schemas', '');
    for (const [name, schema] of Object.entries(spec.components.schemas)) {
        out.push(`### ${name}`, '');
        const rows = properties(schema);
        if (rows.length) out.push('| Field | Type | |', '|---|---|---|', ...rows, '');
        else out.push(`${schemaText(schema)}${schema.pattern ? `, matching \`${schema.pattern}\`` : ''}`, '');
    }
    return out.join('\n');
}

// Build ----------------------------------------------------------------------------------------

const sources = {};
for (const [name, guide] of Object.entries(guides)) {
    const repo = resolve(process.env[guide.env] || join(root, '..', guide.repo));
    if (!existsSync(join(repo, '.git'))) fail(`${repo} is not a ${guide.repo} checkout. Pass its path in ${guide.env}.`);
    const git = gitIn(repo);
    let ref = refs[name];
    if (!ref) {
        ref = git('tag', '--list', 'v*', '--sort=-v:refname').split('\n')[0];
        if (!ref) fail(`${guide.repo} has no release tags; pass --ref develop`);
    }
    let commit;
    try {
        commit = git('rev-parse', '--short', `${ref}^{commit}`);
    } catch {
        fail(`unknown ref "${ref}" in ${repo}`);
    }
    // origin/develop is develop on GitHub
    ref = ref.replace(/^origin\//, '');
    const files = git('ls-tree', '-r', '--name-only', commit, '--', 'docs').split('\n').filter((f) => f.endsWith('.md'));
    if (!files.includes('docs/index.md')) fail(`${guide.repo} at ${ref} has no docs/index.md (docs/ arrived after it); pass --ref develop`);
    sources[name] = { guide, repo, git, ref, commit, files: files.filter((f) => !guide.unpublished.includes(f)) };
}

const pageUrl = (repoName, file) => {
    const entry = Object.entries(guides).find(([, g]) => g.repo.toLowerCase() === repoName.toLowerCase());
    const page = entry && entry[1].pages[file];
    return page ? `/docs/${entry[0]}/${page.slug}/` : null;
};

for (const [name, { guide, repo, git, ref, commit, files }] of Object.entries(sources)) {
    if (only && name !== only) continue;
    const contentDir = join(root, 'content', 'docs', name);
    rmSync(contentDir, { recursive: true, force: true });
    mkdirSync(contentDir, { recursive: true });
    const updated = git('log', '-1', '--format=%cs', commit, '--', 'docs');
    const origin = `${ref}@${commit}`;
    const isDirectory = (path) => {
        try {
            return git('cat-file', '-t', `${commit}:${path}`) === 'tree';
        } catch {
            return false;
        }
    };
    const ctx = { repo: guide.repo, ref, pageUrl, isDirectory };
    const generated = `<!-- Generated by scripts/sync-dev-docs.mjs from ${guide.repo} ${origin}; do not edit by hand. -->`;
    const pages = [];

    const write = (key, title, sections, body) => {
        let page = guide.pages[key];
        if (!page) {
            const slug = posix.basename(key, '.md');
            console.warn(`  warning: ${key} isn't listed in sync-dev-docs.mjs; publishing it last as ${slug}`);
            page = { slug, weight: 1000 + pages.length, icon: 'fa-file-lines', summary: '' };
        }
        const fields = {
            title,
            description: page.summary,
            weight: page.weight,
            icon: page.icon,
            source: key.startsWith('docs/') ? `https://github.com/openvireo/${guide.repo}/blob/${ref}/${key}` : undefined,
            sections,
        };
        writeFileSync(join(contentDir, `${page.slug}.md`), `${frontMatter(fields)}\n${generated}\n\n${body}\n`);
        pages.push(page.slug);
    };

    for (const file of files) {
        const markdown = git('show', `${commit}:${file}`);
        const { title, sections, body } = convert(markdown, file, ctx);
        write(file, title ?? posix.basename(file, '.md'), sections, body);
    }

    if (guide.apiReference) {
        const yamlText = git('show', `${commit}:docs/openapi.yaml`);
        const spec = YAML.parse(yamlText);
        const { title, sections, body } = convert(apiReference(spec), 'docs/api-reference.md', ctx);
        write('api-reference', title, sections, body);
        const staticDir = join(root, 'static', 'docs', name);
        mkdirSync(staticDir, { recursive: true });
        writeFileSync(join(staticDir, 'openapi.yaml'), yamlText.endsWith('\n') ? yamlText : `${yamlText}\n`);
    }

    const label = /^v\d/.test(ref) ? `${guide.product} ${ref}` : `${guide.product}, ${ref} (${commit})`;
    writeFileSync(join(contentDir, '_index.md'), `${frontMatter({
        title: guide.title,
        description: guide.description,
        versionLabel: label,
        updated,
        origin,
        source: `https://github.com/openvireo/${guide.repo}/tree/${ref}/docs`,
        related: guide.related,
        type: 'guide',
        cascade: { type: 'guide' },
    })}\n${generated}\n`);
    console.log(`  ${guide.title}: ${pages.length} pages from ${guide.repo} ${origin}`);

    if (guide.typedoc && buildApi) {
        const work = mkdtempSync(join(tmpdir(), 'openvireo-sdk-'));
        try {
            execFileSync('sh', ['-c', 'git -C "$1" archive "$2" | tar -x -C "$3"', 'sh', repo, commit, work]);
            if (!existsSync(join(work, 'typedoc.json'))) fail(`${guide.repo} at ${ref} has no typedoc.json; pass --no-api or a newer ref`);
            console.log('  Building the API reference (npm ci, typedoc)…');
            execFileSync('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: work, stdio: ['ignore', 'ignore', 'inherit'] });
            // The repo's own settings, plus links back to the guides
            writeFileSync(join(work, 'typedoc.site.json'), JSON.stringify({
                extends: ['./typedoc.json'],
                out: 'docs-api',
                gitRevision: commit,
                navigationLinks: { 'SDK guides': '/docs/sdk/', GitHub: `https://github.com/openvireo/${guide.repo}` },
            }));
            execFileSync('npx', ['typedoc', '--options', 'typedoc.site.json'], { cwd: work, stdio: ['ignore', 'ignore', 'inherit'] });
            const apiDir = join(root, 'static', 'docs', name, 'api');
            rmSync(apiDir, { recursive: true, force: true });
            cpSync(join(work, 'docs-api'), apiDir, { recursive: true });
            console.log(`  API reference: ${readdirSync(apiDir).length} entries in static/docs/${name}/api/`);
        } finally {
            rmSync(work, { recursive: true, force: true });
        }
    }
}

console.log('\nDone. Review the changes with `git status` and preview them with `hugo serve`.');
