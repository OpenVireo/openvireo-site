---
title: "What our servers can't see"
author: "Bongani Mbigi"
date: 2026-11-08
category: "Security"
description: "How OpenVireo's accounts and sync work without our servers ever being able to read your passwords, and what they do know."
---

Every password manager with sync says your data is "encrypted". The useful question is: encrypted with a key held by
whom? For OpenVireo the answer is you, and only you. This post walks through what our servers store, what they can and
can't see, and what stops them from quietly getting it wrong.

<!--more-->

## Two servers, neither holds a key

An OpenVireo account uses two services:

- The **account server** handles sign-in, devices, sharing, organizations and billing.
- The **sync server** stores your vaults: each vault is one encrypted KDBX 4 file, the same format KeePass uses.

Your device does all encryption and decryption. The servers move and store ciphertext.

## Two secrets to unlock

Signing in takes two secrets:

- Your **master password**, which you remember. It's checked with **OPAQUE**, a password protocol in which the account
  server never learns your password, not even when you sign up. There's no password hash on our side to steal and
  crack.
- Your **Secret Key**, 128 random bits made on your device when you sign up and kept in your **Emergency Kit**. The
  server never sees it. Each device you trust keeps a copy, so you only type it once per device.

Together they make your **Account Unlock Key**: Argon2id over the password, then HKDF with the Secret Key. Even if
someone stole everything on our servers, they'd need every user's Secret Key before they could start guessing
passwords, and 128 random bits can't be guessed.

## How vaults are locked

Your account has a **keyset**: an X25519 key pair for encryption and an Ed25519 key pair for signing. The private half
is stored on the account server encrypted with your Account Unlock Key, and is only decrypted on your device, in
memory, while you're unlocked.

Each vault is opened with its own random 32-byte **vault key**. That key is **sealed** to the public key of everyone
who may open the vault, and the account server stores the sealed copies. Vault names are encrypted with the vault key
too, so we don't even know what you've called your vaults.

When you share a vault, OpenVireo checks the other person's signed public key and shows you their **fingerprint**, so
you can compare it with them in person or over a call. When someone is removed from a vault, its key is **rotated**: a
new key is sealed to everyone who stays, and the file is re-encrypted.

## What each server sees

|                                        | Account server                      | Sync server              |
|----------------------------------------|-------------------------------------|--------------------------|
| Master password                        | never (OPAQUE)                      | never                    |
| Secret Key                             | never                               | never                    |
| Your keyset                            | encrypted with your unlock key      | never                    |
| Vault keys                             | sealed to each member's public key  | never                    |
| Vault names                            | encrypted                           | never                    |
| Vault contents                         | never                               | encrypted `.kdbx` file   |
| Who may open which vault               | yes                                 | from the access token    |
| Email address, devices, organizations  | yes                                 | no                       |

We're upfront about the last two rows. To deliver vaults to the right people, the account server knows your email
address, your devices, which organizations you belong to and who has access to which vault. It doesn't know what's in
them.

## A server that can't read can still misbehave

Encryption keeps a server from reading your data. It doesn't stop a buggy or malicious server from losing an update or
serving an old copy. OpenVireo guards against both:

- **No lost updates.** Every upload says which version it changed (`If-Match` with the file's hash). If another device
  uploaded in the meantime, the server refuses with `412`, and your device downloads the newer version, merges, and
  tries again. The merge is three-way and matches the desktop app's, so edits made on two devices at once are
  combined, not overwritten.
- **No rollbacks.** Each vault carries a generation counter *inside* the encrypted file. A client refuses a server copy
  older than one it has already seen, so a server can't quietly hand you a stale vault with a password you've since
  changed.
- **History.** The sync server keeps a bounded history of previous versions, in case you need to go back.

The sync server never parses a vault beyond checking its file signature. It can't merge anything itself, because it
can't read anything.

## Run it yourself

The [sync server]({{< baseurl >}}docs/sync-server/) is open source, and you can run it on your own machine with no
account at all: one signed binary for Linux, macOS or Windows, with a token per device and your database's own
password. The guarantees above don't depend on trusting us; on your own server, you don't have to.

The clients are open source too: the [desktop app](https://github.com/openvireo/openvireo), the
[browser extension](https://github.com/openvireo/openvireo-browser) and the
[SDK](https://github.com/openvireo/openvireo-sdk) that the web app and command line tool are built on. The full
protocol is described in the [SDK docs]({{< baseurl >}}docs/sdk/).

## What this means for you

Because nobody but you holds your keys, nobody but you can open your vaults, including us. The flip side is that we
can't recover them for you if you lose both your master password and your Emergency Kit. We can recover your
*account*, and we explain exactly how in
[How account recovery works when we don't have your key]({{< baseurl >}}blog/account-recovery-without-your-key/).

Found a problem? Please report security issues through a
[GitHub security advisory](https://github.com/openvireo/openvireo/security/advisories/new) or to
admin@openvireo.com.
