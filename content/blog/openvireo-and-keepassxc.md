---
title: "OpenVireo and KeePassXC: what changed, and why"
author: "Bongani Mbigi"
date: 2026-11-17
category: "Announcements"
description: "OpenVireo is a fork of KeePassXC. Why it exists, what's the same, what it adds, and how to move over if you use KeePassXC today."
---

If you've used KeePassXC, OpenVireo will look familiar. That's on purpose: OpenVireo is a fork of KeePassXC. It
opens the same files, has the same desktop features, and works without an account exactly as KeePassXC does. This post
is about why it exists, what it changes, and what it deliberately leaves alone.

<!--more-->

## Why a fork

KeePassXC is a great password manager with a clear focus: your passwords live in a file on your computer, and nothing
talks to a server unless you set it up. Its team has said no to built-in sync and accounts, and that's a reasonable
choice for the app they want to make.

But it leaves a gap. To use your passwords on your phone, you put the file in Dropbox or Nextcloud, install a
third-party KeePass app, and hope two devices don't change the file at the same time. When they do, you get a
"conflicted copy" to merge by hand. To share a few passwords with your family, you set up a second file and share that.

OpenVireo fills that gap without giving up what makes KeePass good: an open file format, local files that work
offline, and no lock-in.

## What stays the same

- **Your files.** OpenVireo reads and writes the same KeePass (`.kdbx`) files. Your databases open unchanged, with
  their key files and YubiKeys. Files saved by OpenVireo still open in KeePassXC and every other KeePass app.
- **The desktop app.** Auto-type, browser integration, passkeys, the SSH agent, Secret Service on Linux, database
  reports and the command-line tool all carry over.
- **No account needed.** Choose "Use without an account" and OpenVireo is a local password manager. No servers, no
  sign-up, nothing leaves your computer.
- **Free and open source.** The desktop app is GPL, like KeePassXC.

> **Update, 22 November 2026:** When this post went up, KeeShare was on the list above too. OpenVireo has since removed
> it: sharing a vault with an account replaces it. Databases that used KeeShare in KeePassXC still open and keep their
> share settings, but OpenVireo no longer imports or exports shared containers.

## What OpenVireo adds

- **Sync that merges.** With a free account, or your [own sync server]({{< baseurl >}}self-hosted/), every device keeps
  a full copy of your vault and merges changes from the others. Two edits on two devices both survive. There are no
  conflicted copies to sort out.
- **An iPhone app and a web app.** [OpenVireo for iPhone]({{< baseurl >}}ios/) fills passwords and passkeys in Safari
  and other apps, and works offline. OpenVireo Web opens your vaults in any browser.
- **Sharing.** Share a vault with family or a team, with read-only, edit or manage access, or send one password with a
  [share link]({{< baseurl >}}blog/share-a-password-without-an-account/) that opens without an account.
- **Secrets for automation.** Service accounts, the `ov` CLI and a GitHub Action give scripts and CI jobs their own
  access to a vault.

All of it is end-to-end encrypted. Your vaults are encrypted on your devices with a key made from your master password
and a Secret Key that never leaves them. Our servers store files they can't open. The details are in
[what our servers can't see]({{< baseurl >}}blog/what-our-servers-cant-see/).

## What we left alone on purpose

A fork can break things for the people who use the original. We tried hard not to:

- **The file format.** OpenVireo doesn't add anything to your file that other KeePass apps can't read, and it doesn't
  rename the data KeePassXC and its browser extension store inside it.
- **Credit.** The code's copyright notices stay, and OpenVireo says it's a fork everywhere you'd look: the About
  dialog, the website and the README. OpenVireo isn't made, endorsed or supported by the KeePassXC Team.
- **Side by side.** OpenVireo has its own settings and its own name in your system, so you can install it next to
  KeePassXC and open the same file in either one.

## Where KeePassXC is still ahead

We'd rather you pick the right tool. Stay with KeePassXC if:

- you only want local files, and the account features are code you'd rather not have;
- you want a project with a long track record, an independent audit and a security certification (OpenVireo is new,
  and its audit is still to come);
- you want the version in your Linux distribution's repositories.

There's a full side-by-side on [OpenVireo vs KeePassXC]({{< baseurl >}}compare/keepassxc/).

## Moving from KeePassXC

There's nothing to import:

1. [Download OpenVireo]({{< baseurl >}}download/) and open your `.kdbx` file.
2. Install the [OpenVireo Browser]({{< baseurl >}}blog/openvireo-in-your-browser/) extension and connect it, as you did
   with KeePassXC-Browser.
3. If you want sync, create a free account and choose **Account › Move Database to Account…**. A copy of your database
   becomes a vault that syncs to your iPhone and the web. Your original file isn't changed, so you can keep it as a
   backup.

If you change your mind, export the vault to a `.kdbx` file and open it in KeePassXC. Your passwords are never stuck
with us.
