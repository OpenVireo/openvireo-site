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

## Update the User Guide

The User Guide is written in AsciiDoc in the [KeePassXC repository](https://github.com/keepassxreboot/keepassxc/tree/develop/docs)
and built there into a single `KeePassXC_UserGuide.html`. To publish a new version on the website, split that file
into themed chapter pages:

```bash
node scripts/build-user-guide.mjs path/to/KeePassXC_UserGuide.html
```

This regenerates `content/docs/user-guide/` (one page per chapter), extracts the images to
`static/docs/user-guide/images/`, and rewrites `static/docs/KeePassXC_UserGuide.html` as a redirect so old links and
`#anchors` still land on the right chapter. If the guide gains a new chapter, add it to the `chapters` table at the
top of the script (order, icon, and card summary).
