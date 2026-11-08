---
title: "Share a password with someone who doesn't use OpenVireo"
author: "Bongani Mbigi"
date: 2026-11-08
draft: true
category: "Features"
description: "Share links send a copy of an entry to anyone, with no account, no app and no sign-in, encrypted so that we can't read it."
---

Sooner or later you need to give a password to someone who doesn't use OpenVireo: the Wi-Fi password for a guest, a
login for the person house-sitting, an API key for a contractor. Pasting it into a chat leaves it there forever. Share
links are a better way.

<!--more-->

## What a share link is

A share link gives a copy of an entry, or some text, to someone who doesn't use OpenVireo. They open it in any browser,
with no account, no app and no sign-in. You decide what they see, how long the link lasts and how often it can be
opened.

## Making one

You make links from an entry in a vault in your account:

- **Web app:** select an entry and click the link button above it.
- **Desktop:** right-click an entry and choose **Share Link…**.
- **iPhone:** open an entry and tap the link button.
- **Command line:** `ov share ov://Vault/Entry`.

Then choose:

- **Which fields** to include. Share the username and password and leave the notes out.
- **When it expires**, from 1 hour to 30 days.
- **How often it can be opened**: once, 5 times, or any number of times.
- **A passcode**, if you want one, which you send separately.

To share text that isn't in a vault, use **Share text** under **Shared links**.

## What they see

A page that says something was shared with them, with a **Reveal** button. Nothing is shown until they press it. That
matters more than it sounds: chat apps and mail scanners open links to make previews, and without this step a preview
could use up a one-time link before your friend ever saw it.

After that they see the fields you chose, each with a copy button. If you shared a one-time code, they see the current
code.

## Why the link has a `#` in it

A share link looks something like `https://share.openvireo.com/<id>#<key>`. The part after the `#` is the key that decrypts
what you shared.

Browsers never send that part of a link to any server. Your device encrypts the copy with that key before it uploads
anything, and our servers keep only the encrypted copy. We can't read what you shared, and neither can anyone who
breaks into our servers.

That also means anyone who has the whole link can open it until it expires or reaches its limit, so send it the way
you'd send the secret itself. A passcode adds a second secret: the link alone, or the passcode alone, opens nothing,
and five wrong passcodes end the link.

## Things worth knowing

- **A link holds a copy.** Changing or deleting the entry later doesn't change what the link shows. If the secret
  matters, change it once the person no longer needs it.
- **Sharing a one-time code shares its secret.** The person can keep generating codes for that account even after the
  link ends.
- **You can see and revoke your links.** *Shared links* (web: Account; desktop: **Account › Shared Links…**; iPhone:
  Settings) lists each link, how often it was opened and when. Revoking a link stops it at once and deletes the
  encrypted copy.
- **Links end on their own** when they expire, reach their open limit, when you lose access to the vault, or when your
  organization turns share links off.

## For organizations

Owners and admins choose who can make links from the organization's vaults: everyone, only owners and admins, or
nobody. Links from organization vaults appear in the audit log, without the address of whoever opened them.

## On every plan

Every plan can make share links. On Free you can have 5 open links at a time, each lasting up to 7 days. Premium and
every organization plan have no limit on links, up to 30 days each. See [pricing]({{< baseurl >}}pricing), or read the
full [share links guide]({{< baseurl >}}share-links).
