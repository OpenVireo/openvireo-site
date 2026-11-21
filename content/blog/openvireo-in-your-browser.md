---
title: "OpenVireo in your browser"
author: "Bongani Mbigi"
date: 2026-11-16
category: "Features"
description: "How the OpenVireo Browser extension fills logins, passkeys and one-time codes from the OpenVireo app on your computer, which browsers it works in, and how to set it up in a couple of minutes."
---

Most of the time you need a password, you're in a browser. The OpenVireo Browser extension fills your logins,
passkeys and one-time codes straight from OpenVireo on your computer, so you never have to copy and paste. This
guide covers what it does, how it works, and how to connect it.

<!--more-->

## What it does

- **Fills logins.** An OpenVireo icon appears in username fields. Click it, or pick from a list when you have more
  than one account for a site. The extension's icon shows a number when it has found logins for the page.
- **Passkeys.** Sign in with passkeys stored in OpenVireo, and save new ones there when a site offers to create one.
- **One-time codes.** If an entry has a two-factor (TOTP) secret, the extension fills the current code too.
- **Generates passwords.** A password generator sits next to new-password fields, using your generator settings from
  the app.
- **HTTP Basic Auth.** Those old-style browser login pop-ups get filled as well.

If you've used KeePassXC-Browser, this will all look familiar: OpenVireo Browser is a fork of it, the same way
OpenVireo is a [fork of KeePassXC]({{< baseurl >}}compare/keepassxc/).

## How it works

The extension doesn't keep any passwords itself. It talks to the OpenVireo app on your computer through the browser's
*native messaging*, via a small helper called `openvireo-proxy` that comes with the app. You don't install anything
extra.

That means it fills from whatever you have unlocked in OpenVireo: your local KeePass databases and the vaults in your
account. Lock the app and the extension has nothing to fill.

It also means your passwords take the shortest possible route: from the app on your computer to the page in your
browser. They never pass through our servers on the way. The extension's own settings stay in your browser and are
never synced.

## Which browsers

- **Firefox and Tor Browser:** from [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/openvireo/).
- **Chrome, Chromium, Vivaldi, Brave and Microsoft Edge:** from the
  [Chrome Web Store](https://chromewebstore.google.com/detail/ogecgkbokcjipobddojjhapbfcppghcf).
- **Safari on macOS:** no extension needed. OpenVireo fills passwords, passkeys and one-time codes through macOS
  AutoFill instead.
- **iPhone and iPad:** the [OpenVireo app]({{< baseurl >}}ios/) fills in Safari and other apps through AutoFill.

One caveat on Linux: browsers installed as Flatpak or Snap packages generally can't talk to apps outside their sandbox,
so the extension can't reach OpenVireo. Ubuntu's Firefox Snap is the one known exception. A browser from your
distribution's normal packages works.

## Setting it up

1. **Install the extension** from your browser's store, using the links above.
2. **Turn on browser integration in OpenVireo.** Go to **Tools › Settings › Browser Integration**, check **Enable
   browser integration**, select the browsers you use, and click **OK**.
3. **Unlock a database or your account**, then open (or restart) your browser.
4. **Connect.** Click the OpenVireo icon in your browser's toolbar and click **Connect**.
5. **Name the connection**, for example `firefox-laptop`, and click **Save and allow access**.

Use a different name for each browser. Reusing a name replaces the earlier connection, and that browser loses access.

## Reading the icon

The toolbar icon tells you what state things are in:

- **Not running or disconnected:** OpenVireo isn't open, or the extension can't reach it.
- **Not connected to this database:** OpenVireo is running, but this browser hasn't been connected to the database
  you have open. Click **Connect**.
- **Locked:** connected, but the database is locked. Unlock it in the app.
- **Ready:** connected and unlocked. A number on the icon is how many logins it found for the current site.

If it gets stuck, click the icon and choose **Reload**.

## The first time a site asks

The first time a site asks for a login, OpenVireo may show a **Confirm Access** dialog listing the matching entries.
Check the ones you want this site to use, tick **Remember** if you don't want to be asked again, and click **Allow
Selected**. That way a site only ever gets the entries you've said it can have.

## Coming from KeePassXC-Browser?

OpenVireo is a separate app with its own settings, so connect OpenVireo Browser to it once, as above. Your databases
are the same files, and the entries you'd already allowed for sites carry over with them. You can keep both extensions
installed while you switch, but turn one off once you're settled, so two icons don't compete in every login field.

## More help

The [browser integration guide]({{< baseurl >}}docs/getting-started/browser-integration/) has screenshots of each
step. For troubleshooting, the upstream KeePassXC-Browser troubleshooting guide applies to OpenVireo Browser too.
