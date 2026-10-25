# OpenVireo website

Website sources for https://openvireo.com.

OpenVireo is a fork of [KeePassXC](https://keepassxc.org), and this site is a fork of the KeePassXC website
([keepassxreboot/keepassxc-org](https://github.com/keepassxreboot/keepassxc-org)). It is not affiliated with or
endorsed by the KeePassXC Team.

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

Both guides are written in AsciiDoc in the [OpenVireo desktop repository](https://github.com/openvireo/openvireo/tree/develop/docs).
The website builds them straight from a checkout of that repository and splits them into themed chapter pages.
This needs [Asciidoctor](https://asciidoctor.org) (`brew install asciidoctor` or `gem install asciidoctor`).

With the openvireo repository checked out next to this one (`../openvireo`):

```bash
npm run docs -- --ref 2.8.0      # publish the docs of a release tag (or any branch/commit)
npm run docs                     # preview the checkout as it is on disk, including uncommitted edits
```

Use `npm run docs -- path/to/openvireo` (or set `OPENVIREO_SRC`) if the checkout lives elsewhere. Building from a
`--ref` exports that commit to a temporary folder, so your working tree and current branch are left alone.

For each guide this regenerates `content/docs/<guide>/` (one page per chapter), copies the screenshots it uses to
`static/docs/<guide>/images/`, and rewrites the old single-page file in `static/docs/` as a redirect so old links and
`#anchors` still land on the right chapter. The landing page records the version and the commit the docs came from.

New chapters publish automatically with a generic icon and a warning; give them a place, icon, and card summary in
the `guides` table at the top of `scripts/build-guide.mjs`. That script can also convert a prebuilt single-file
guide (e.g. from a release package): `node scripts/build-guide.mjs user-guide OpenVireo_UserGuide.html`.

## Update the product screenshots

The screenshots on the landing page, the Screenshots page and the download carousel are captured from
an OpenVireo build by the `testdocsscreenshots` tool in the openvireo repository:

```bash
npm run screenshots                                   # ../openvireo, built in cmake-build-debug
npm run screenshots -- path/to/openvireo --build-dir path/to/build
npm run screenshots -- --docs                         # also regenerate the checkout's docs/images
```

The build must be configured with `-DWITH_GUI_TESTS=ON`. OpenVireo opens for a few seconds while the tool drives it
through a demo database with a fixed clock, so every run shows the same content. Screenshots go straight to
`static/assets/img/screenshots/` (with thumbnails), files whose picture hasn't changed are left untouched, and the
`width`/`height` of every `<img>` showing them is kept up to date.

## Refresh everything

To recapture every screenshot (docs and website) and rebuild both guides from the openvireo checkout in one go:

```bash
npm run refresh                                       # ../openvireo, built in cmake-build-debug
npm run refresh -- path/to/openvireo --build-dir path/to/build
```

This builds the guides from the checkout's working tree, so the new docs screenshots are used straight away; commit
them in the openvireo repository too. To publish docs from a branch or tag instead, use `npm run docs -- --ref <ref>`.

## Deploy to DigitalOcean

The site is hosted as a static site on [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/).
App Platform builds the `Dockerfile` (so it gets Hugo extended and the NPM dependencies) and serves the files the
build stage puts in `/usr/share/nginx/html` from its CDN. The app is described by [`.do/app.yaml`](.do/app.yaml):
it builds `develop` on every push and serves `openvireo.com` and `www.openvireo.com`.

To create the app, or to apply changes to the spec:

```bash
doctl apps create --spec .do/app.yaml
doctl apps update <app-id> --spec .do/app.yaml   # app ids are listed by `doctl apps list`
```

App Platform needs access to the repository through its GitHub app, and the domains need DNS records pointing at
the app (the control panel shows them under **Settings → Domains**).
