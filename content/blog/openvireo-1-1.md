---
title: "OpenVireo 1.1: a lighter look, editing in place, and high contrast"
author: "Bongani Mbigi"
date: 2026-11-28
category: "Announcements"
description: "OpenVireo 1.1 restyles the desktop app to match the web app, lets you edit entries where you read them, adds a high contrast theme, and removes KeeShare and the classic layout."
---

OpenVireo 1.1 is out for macOS, Windows and Linux. The desktop app looks closer to the web app and openvireo.com. You
edit entries in the same place you read them. There's a high contrast theme, and some older KeePassXC features are gone.

<!--more-->

If you already have 1.0, the app offers you the update itself. Otherwise, [download it]({{< baseurl >}}download/). As
always, the packages are signed, and you can [verify the download]({{< baseurl >}}verifying-signatures/).

## Edit an entry where you read it

Editing no longer opens a separate editor. Click the pencil and the details card turns into a form with the same layout,
so the fields stay where they were. New entries open in that card too. You can pick an entry type and add your own
fields with **Add field**.

{{< figure src="docs/user-guide/images/edit_entry.png" alt="Editing the GitHub entry in the details card, with Cancel and Save above it" figcaption="Editing happens in the details card, next to the entry list." >}}

The details card also shows an entry's additional attributes now, such as a security question, so you no longer have
to open the editor to see them.

## A lighter look

The vault window uses the lighter colours of the web app and the site, with a split sign-in and unlock screen. Its
dialogs now open as cards over the window instead of separate windows: the Emergency Kit, Shared Links, New vault,
deleting your account, the TOTP QR code, icons and keyboard shortcuts. Forms, tables and wizards use the same controls
everywhere, and the scroll bars are thin overlays.

There's less on screen, too. The status bar along the bottom is gone. Progress shows in a small activity chip next to
the bell, sync results show on the **Synced** pill, and other messages appear briefly in a snackbar instead of a bar
across the window.

Narrow the window and the layout reflows the way the web app does, down to 400 pixels wide. It's useful beside a browser
or on a small laptop screen.

## High contrast

The new High contrast theme has solid outlines and strong colours throughout the app. OpenVireo switches to it
automatically when Windows High Contrast, macOS **Increase contrast** or your Linux desktop's high contrast setting is
on. You can also pick it under Settings › General.

## Removed: the classic layout and KeeShare

OpenVireo 1.1 removes the classic theme and the classic window layout, with its toolbar, preview panel and database
tabs. If you used the Classic theme, OpenVireo now follows your system theme.

KeeShare is gone too. To share passwords with other people, [share a vault]({{< baseurl >}}docs/user-guide/openvireo-accounts/#_sharing_a_vault)
with their OpenVireo account, or send a single entry with a
[share link]({{< baseurl >}}blog/share-a-password-without-an-account/). Databases that used KeeShare in KeePassXC still
open normally and keep their share settings, but OpenVireo no longer imports or exports the shared containers.

## Under the hood

Accounts in the desktop app now run on the shared OpenVireo core. That's the same Rust code behind the iPhone app, the
web app and the SDK, so sign-in, sync and sharing work the same way everywhere. A fix in the core reaches every app at
once.

1.1 also fixes a few bugs:

- Account vaults no longer keep syncing forever after an edit.
- When one device moves an entry and another edits it, sync keeps the location of the copy that was moved last.
- A change made to a database file while OpenVireo is checking it is no longer missed.
- OpenVireo Browser from the [Chrome Web Store](https://chromewebstore.google.com/detail/ogecgkbokcjipobddojjhapbfcppghcf)
  can connect to the app.

The full list is in the [changelog](https://github.com/openvireo/openvireo/blob/develop/CHANGELOG.md).

## Tell us what you think

If something looks wrong in the new design or you miss something we removed, open an issue at
[github.com/openvireo/openvireo](https://github.com/openvireo/openvireo/issues), or write to
[admin@openvireo.com](mailto:admin@openvireo.com).
