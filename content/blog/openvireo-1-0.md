---
title: "OpenVireo 1.0, and OpenVireo for iPhone"
author: "Bongani Mbigi"
date: 2026-11-11
category: "Announcements"
description: "OpenVireo 1.0 is out for macOS, Windows and Linux, it's no longer a beta, and the iPhone app is on the App Store."
---

OpenVireo 1.0 is out. It's the first stable release for macOS, Windows and Linux, and the
[iPhone app]({{< baseurl >}}ios/) is on the App Store from today.

<!--more-->

## No longer a beta

Since 0.9.0, the first public beta, OpenVireo's own features have been used and fixed. 1.0 drops the beta label. If
you have 0.9.0, the app offers you the update itself; otherwise, [download it]({{< baseurl >}}download/). Like every
release, it's signed and notarized, and you can [verify the download]({{< baseurl >}}verifying-signatures/).

## OpenVireo for iPhone

The iPhone app opens the same KeePass files as OpenVireo on your computer and the same encrypted vaults as the web app.
It fills passwords and passkeys in Safari and your other apps, unlocks with Face ID, and keeps working with no signal.
You don't need an account to use it. If you want sync, you can create a free account right in the app.
[Take a first look]({{< baseurl >}}blog/openvireo-for-iphone/), or get it from the [iPhone page]({{< baseurl >}}ios/).

## The browser extension, in the stores

OpenVireo Browser 1.0 is coming to [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/openvireo/) and the
[Chrome Web Store](https://chromewebstore.google.com/detail/ogecgkbokcjipobddojjhapbfcppghcf), which also covers Edge,
Brave and Vivaldi. The stores are still reviewing it; until it's listed, every release is
[on GitHub](https://github.com/openvireo/openvireo-browser/releases).

## New since 0.9.0

- **Import a KeePass file** into an open database, as copies, or as a new vault.
  [How import works]({{< baseurl >}}blog/import-your-keepass-database/).
- **Lock screen for your account**, which unlocks offline from the keys you last synced.
- **Remember accounts** and switch between them without signing in again.
- **Share links** to send an entry to someone without an account. Organization owners choose who can make them.
  [More on share links]({{< baseurl >}}blog/share-a-password-without-an-account/).
- **Deleted entries and the Recycle Bin sync** between devices, and OpenVireo warns you when your computer's clock is
  off.
- **Your Secret Key** is shown again under Account › Emergency Kit.
- **Delete your account** from the Account menu, with a 30-day grace period.
- **A redesigned Organization window**, and accounts only connect to servers over https.

The full list is in the [changelog](https://github.com/openvireo/openvireo/blob/develop/CHANGELOG.md).

## Thank you

Thank you to everyone who tried the beta and reported problems. Please keep doing it: open an issue at
[github.com/openvireo/openvireo](https://github.com/openvireo/openvireo/issues), or write to
[admin@openvireo.com](mailto:admin@openvireo.com).
