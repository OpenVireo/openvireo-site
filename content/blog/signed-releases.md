---
title: "Signed, notarized and verifiable: how OpenVireo ships"
author: "Bongani Mbigi"
date: 2026-11-08
category: "Security"
description: "Every OpenVireo release is signed for macOS, Windows and Linux, updates are checked before they install, and you can verify any download yourself."
---

A password manager is only as trustworthy as the copy you actually installed. A tampered installer could do anything
with your passwords, however good the encryption inside the real app is. Here's how OpenVireo releases are signed, how
automatic updates are protected, and how to check a download yourself.

<!--more-->

## Signed for every platform

Releases are built and signed automatically on GitHub Actions, from tagged source:

- **macOS:** apps are signed with our Apple Developer ID and **notarized by Apple**. macOS checks this before the app
  first runs.
- **Windows:** installers and programs are **code signed** with Azure Artifact Signing, so Windows can tell you they
  come from OpenVireo.
- **Linux:** AppImages are signed with our **OpenPGP release key**.
- **Everything:** each release contains `SHA256SUMS.txt`, the SHA-256 hash of every file, and `SHA256SUMS.txt.asc`, a
  signature of that list made with the release key.

The same applies beyond the desktop app. The `ov` command line tool and the self-hosted sync server are published as
signed binaries for Linux, macOS and Windows too.

## Updates that check themselves

OpenVireo updates itself on macOS (with Sparkle) and Windows (with WinSparkle). Every update is described in a feed
signed with a separate **Ed25519 update key**, and the app refuses an update whose signature doesn't match the key built
into it. Someone who got between you and GitHub couldn't push you a fake update.

On Linux, AppImages update with zsync, and the app tells you when a new version is out.

There are two channels: **stable**, for releases, and **nightly**, for people who want to try changes as they land.

## Verify a download yourself

The operating system checks signatures on macOS and Windows, but you can verify any package, on any platform, with the
release key.

**OpenVireo Release Signing** &lt;admin@openvireo.com&gt; (Ed25519)
Fingerprint: `FE27 78BF 0747 05E0 994B  BAF9 FEBA 3556 2DE1 04CB`

Download `SHA256SUMS.txt` and `SHA256SUMS.txt.asc` from the release into the same folder as your package, then:

```shell
# Import the release key
curl -sSL https://openvireo.com/openvireo-release.asc | gpg --import
# or: gpg --keyserver hkps://keys.openpgp.org --recv-keys FE2778BF074705E0994BBAF9FEBA35562DE104CB

# Check the signature on the list, then check your package against the list
gpg --verify SHA256SUMS.txt.asc SHA256SUMS.txt
shasum -a 256 -c SHA256SUMS.txt --ignore-missing
```

You want a "Good signature" line from `gpg`, a primary key fingerprint that matches the one above, and `OK` next to
every package you downloaded. If anything doesn't match, don't install it; download it again, and if it still fails,
[open an issue](https://github.com/openvireo/openvireo/issues).

Don't take the fingerprint only from this post. It's also on our
[Verifying Signatures]({{< baseurl >}}verifying-signatures) page and on
[keys.openpgp.org](https://keys.openpgp.org/search?q=FE2778BF074705E0994BBAF9FEBA35562DE104CB). Checking that they
agree is the point.

## Our key, not KeePassXC's

OpenVireo is a fork of KeePassXC, but its releases are signed with OpenVireo's own key, not the KeePassXC release key.
A KeePassXC signature on a file means it's a KeePassXC release, not an OpenVireo one.

## A revoked key

Our previous release key, `23F6 403E 9392 E946 475E 7FD3 B556 83A4 3E98 C11C`, was revoked on 29 October 2026 and no
longer signs releases. The revocation is published on keys.openpgp.org. **Don't trust a signature made with it.** If
you imported it before, refresh it (`gpg --refresh-keys`) so `gpg` knows it's revoked.

## Built in the open

The release workflows, and the code they build, are public in the
[OpenVireo repository](https://github.com/openvireo/openvireo). If you spot a problem with how we sign or ship, please
report it through a [GitHub security advisory](https://github.com/openvireo/openvireo/security/advisories/new) or to
security@openvireo.com.

[Download OpenVireo]({{< baseurl >}}download)
