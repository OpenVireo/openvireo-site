# KeePassXC.org

Website sources for https://keepassxc.org.

## Prerequisites

This website uses [Hugo](https://gohugo.io/). To build the sources, you need to install it first.

Additionally, NPM (bundled with NodeJS) is required to install other dependencies.

Linux:
```bash
sudo snap install hugo
sudo snap install node --classic
```

macOS:
```bash
brew install hugo node
```

Windows:
```bash
winget install Hugo.Hugo.Extended OpenJS.NodeJS
```

## Build website

Install NPM dependencies
```bash
npm install
```

Compile website:
```bash
hugo
```

The compiled HTML files will be stored in the `public` folder.

Instead of building static HTML files, you can also start a Hugo development server with live reload:
```bash
hugo serve
```

## Create a new blog post

To create a new blog post, run

```bash
hugo new blog/202X-XX-XX-blog-post-name.md
```

This will create a new file `blog/202x-XX-XX-blog-post-name.md` from the `blog` archetype with inserted
boilerplate and some pre-filled frontmatter fields.

## Update the User Guide and Getting Started guide

Both guides are written in AsciiDoc in the [KeePassXC repository](https://github.com/keepassxreboot/keepassxc/tree/develop/docs)
and built there into single files, `KeePassXC_UserGuide.html` and `KeePassXC_GettingStarted.html`. To publish a new
version on the website, split each file into themed chapter pages:

```bash
node scripts/build-guide.mjs user-guide path/to/KeePassXC_UserGuide.html
node scripts/build-guide.mjs getting-started path/to/KeePassXC_GettingStarted.html
```

For each guide this regenerates `content/docs/<guide>/` (one page per chapter), extracts the images to
`static/docs/<guide>/images/`, and rewrites the old single-page file in `static/docs/` as a redirect so old links and
`#anchors` still land on the right chapter. If a guide gains a new chapter, add it to that guide's `chapters` table at
the top of the script (order, icon, and card summary).
