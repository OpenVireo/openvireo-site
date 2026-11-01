// Shared by sync-screenshots.mjs (desktop) and sync-ios-screenshots.mjs (iPhone): image sizes and the pages'
// width/height attributes.

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

// Width and height from a PNG's IHDR chunk
export function pngSize(file) {
    const header = readFileSync(file).subarray(0, 24);
    return [header.readUInt32BE(16), header.readUInt32BE(20)];
}

export function* htmlFiles(dirs) {
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

// Sets width/height on every <img> under layouts/ and content/ that shows one of `sizes` (keyed by the path
// under assets/img/screenshots/, e.g. "thumbs/welcome_screen.png" or "ios/items.png"), so pages reserve the
// right space. Returns the files it changed.
export function updateImageSizes(root, sizes) {
    const updated = [];
    for (const file of htmlFiles([join(root, 'layouts'), join(root, 'content')])) {
        const html = readFileSync(file, 'utf8');
        // Tags may hold Hugo shortcodes such as {{< baseurl >}}, whose ">" doesn't end the tag
        const next = html.replace(/<img\b(?:\{\{[^}]*\}\}|[^>])*>/g, (tag) => {
            const match = tag.match(/screenshots\/((?:ios\/)?(?:thumbs\/)?[\w-]+\.png)/);
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
    return updated;
}
