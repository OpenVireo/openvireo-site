---
title: "Self-host your password sync in 15 minutes"
author: "Bongani Mbigi"
date: 2026-11-20
category: "Features"
description: "A step-by-step guide to running the OpenVireo Sync Server with Docker and Caddy, then syncing your computer and iPhone to it."
---

The OpenVireo Sync Server keeps your KeePass files in sync between your computers and your iPhone, on hardware you
control. It's one free, open-source program, and it never sees your passwords: it stores encrypted files and nothing
it can open. This guide takes you from an empty server to two synced devices, with HTTPS, in about 15 minutes.

<!--more-->

## What you need

- A small Linux server with Docker: a VPS, a home server or a Raspberry Pi (the image runs on x64 and arm64).
- A domain name pointing at it, for example `sync.example.com`, with ports 80 and 443 open. Caddy uses them to get a
  free HTTPS certificate.
- [OpenVireo]({{< baseurl >}}download/) on your computer, and the [iPhone app]({{< baseurl >}}ios/) if you want it.

HTTPS isn't optional. Each device sends its access token with every request, so anything other than `localhost` needs
TLS in front of it.

## 1. Start the server and Caddy

Make a folder for it, and a data folder the server's unprivileged user (uid 10001) can write to:

```sh
mkdir openvireo-sync && cd openvireo-sync
mkdir data && sudo chown 10001 data
```

Create `compose.yaml`:

```yaml
services:
  sync:
    image: ghcr.io/openvireo/openvireo-sync-server:0.2.0
    restart: unless-stopped
    environment:
      SYNC_BEHIND_PROXY: "1"     # TLS is handled by Caddy in front
    volumes:
      - ./data:/data

  caddy:
    image: caddy:2
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data

volumes:
  caddy-data:
```

And a `Caddyfile` with your domain:

```text
sync.example.com {
    reverse_proxy sync:8787
}
```

Start both:

```sh
docker compose up -d
```

Caddy gets a certificate on its own within a few seconds. The sync server isn't published on any port of its own: only
Caddy can reach it.

## 2. Add yourself

Each person on the server is a user, and each of their devices gets its own token. Add yourself and your first device:

```sh
docker compose exec sync openvireo-sync-server users add alice laptop
```

It prints the laptop's access token **once**. Keep it handy for the next step.

## 3. Sync your computer

In OpenVireo on your computer:

1. Open the database you want to sync (or create one).
2. Go to **Database › Database Settings › Remote Sync** and choose **OpenVireo Sync Server**.
3. Enter `https://sync.example.com`, a database ID (any short name, such as `personal`) and the token from step 2.

The first sync uploads your database. From then on, OpenVireo syncs after each save, when another device uploads a
change, and when you come back online.

If you're setting up OpenVireo for the first time, you can also choose **Use my own sync server** on the welcome
screen, and new databases are set up to sync with your server.

## 4. Add your iPhone

You don't need to copy tokens around for other devices. Make a **pairing code** instead. On your computer, in
**Remote Sync**, select the server and click **Pair Device…**, or on the server run:

```sh
docker compose exec sync openvireo-sync-server devices pair alice
```

It prints a code like `WJDA-247W`. It works once, for 10 minutes.

In the iPhone app, choose **Use my own sync server**, then scan the QR code from your computer, or type the server
address and the code. The phone trades the code for a token of its own, and your database appears. It fills passwords
with AutoFill and keeps working offline, like any other vault on the phone.

Another computer works the same way: enter the pairing code where OpenVireo asks for the access token.

## 5. Back it up

Your devices each have a full copy of every database, so a dead server doesn't lose any passwords. Still, back up the
server, so you keep its previous versions and don't have to re-pair everything. Everything is in `./data`:

```sh
sqlite3 data/users.sqlite ".backup 'backups/users.sqlite'"
rsync -a --exclude users.sqlite data/ backups/data/
```

`users.sqlite` can change while the server runs, so it's copied with SQLite's online backup. The databases themselves
are written atomically, so `rsync` can copy them at any time. The backup holds only encrypted files and hashes of
tokens, but keep it private anyway.

## Day-to-day

- **Lost a device?** `openvireo-sync-server devices list alice`, then `devices revoke alice <id>`. Its token stops
  working at once. If whoever has it might know your master password, change that too.
- **Restore an older version.** The server keeps the last 10 versions of each database (`SYNC_HISTORY_SIZE`).
- **Upgrade.** Change the image tag in `compose.yaml` and run `docker compose up -d`. Check the
  [releases](https://github.com/OpenVireo/openvireo-sync-server/releases) for notes first.
- **Family on the same server.** Add each person with `users add`. Each user has their own databases and can't see
  anyone else's.

## What a self-hosted server doesn't do

- **Sharing between people.** Shared vaults and organizations need a hosted OpenVireo account. On your server, each
  user's databases are their own.
- **Host the web app.** OpenVireo Web can pair with your server, but it's a hosted app; you can't run it yourself.
- **Android.** There's no OpenVireo Android app yet. KeePass apps on Android can still open your files.

## Prefer not to run a server?

The same apps sign in to a free OpenVireo account, and moving a database there takes a few clicks. You can go the
other way at any time by exporting a KeePass file.

The full reference, including Postgres and S3 storage, systemd, nginx and the API, is in the
[sync server docs](https://developer.openvireo.com/self-hosting/). Why self-host with OpenVireo at all is on the
[self-hosting page]({{< baseurl >}}self-hosted/).
