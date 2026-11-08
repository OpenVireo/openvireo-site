---
title: "Your passwords, with or without a connection"
author: "Bongani Mbigi"
date: 2026-11-08
draft: true
category: "Security"
description: "How OpenVireo opens your synced vaults offline on desktop, iPhone and the web, what it keeps on your device, and the trade-offs."
---

A synced password manager has a quiet failure mode: the moment you need a password is often the moment you don't have
a good connection. A plane, a lift, a captive Wi-Fi portal that wants you to sign in, or our own servers having a bad
day. OpenVireo is built so that once a device has unlocked your account online, it can always open your vaults.

<!--more-->

## The rule: unlock from the device, then talk to the server

Every OpenVireo client keeps an encrypted copy of what it needs to open your vaults:

- your **keyset**, still encrypted with your Account Unlock Key, plus the settings needed to derive that key;
- the **vault list** exactly as the server sent it, with names still encrypted and vault keys still sealed;
- the **vault copies** themselves, and any edits not uploaded yet.

None of it is stored in clear. Opening it still takes your master password (or Face ID on iPhone) *and* the Secret Key
held in your device's keychain.

Clients use that copy **only when the server can't be reached**: no connection, a timeout, or the server returning an
error like 502 or 503. If the server answers and says no, for example because the device was removed from your account,
the client believes it.

## On iPhone

On the phone, the network is at its least reliable, so this is where we've been most careful:

- **Unlocking doesn't wait for the network.** Face ID or your password gets you to your vaults in about three seconds
  plus the time to derive your key, in airplane mode, on Wi-Fi with no internet, on one bar of signal, or with our
  servers down.
- **The server still gets a say.** When you unlock, the app gives the server up to three seconds to answer. On a good
  connection that changes nothing. On a bad one it costs three seconds, and then the app opens from the device and
  catches up in the background.
- **Nothing about the network can sign you out** or delete the copies on your device. Edits you make offline are
  kept, survive the app being closed, and upload when the server is back.
- **AutoFill works offline too**, from the same copies.

Signing in for the very first time on a device still needs the server, because nothing is on the device yet.

## On desktop

Locking your account on desktop shows a lock screen in the main window, and unlocking it works with or without a
connection. If you'd rather every unlock be checked by the server, turn off **Settings › Security › Allow unlocking
without a connection**. Turning it off also deletes the offline copy of your keyset.

## On the web

The web app has a different problem: browsers reload. OpenVireo Web now stays unlocked when you reload the page, so a
refresh doesn't make you type your master password again, while still locking when it should:

- after **5 minutes** of inactivity by default (you can change this in Settings);
- in **every tab at once** when you lock one;
- always when you **close the tab or the browser**.

To survive a reload, the web app keeps your unlocked state encrypted in the tab's session storage, under a key the
browser marks as non-extractable, so page scripts can use it but can't read it out.

## The trade-offs, plainly

Offline access is a security trade-off, and we'd rather you hear it from us:

- **A stolen disk alone isn't enough.** The offline copy needs both your master password and your 128-bit Secret Key,
  and the Secret Key lives in the operating system's keychain, not next to the copy. Someone with only a copy of your
  disk can't start guessing your password.
- **A stolen disk *and* keychain is.** Someone with both can try to guess your master password offline, without the
  rate limits our servers apply to online sign-in. This is the usual cost of offline unlock in any password manager,
  and why a strong master password still matters.
- **Removing a device takes effect when it reconnects.** Until then, a device you've removed can still open what it
  already had. That's no different from the vault copies every synced device keeps anyway, and it's why you should
  change any important passwords after losing a device.
- **Blocking the network isn't a way in.** Someone who cuts your connection can force the offline path, but they still
  need your password or Face ID, and they only get what the device already holds.

If those trade-offs don't suit you, turn offline unlock off on desktop, or use local `.kdbx` files, which have always
worked without any network at all.

[Download OpenVireo]({{< baseurl >}}download), or read more in the
[user guide]({{< baseurl >}}docs/user-guide/openvireo-accounts/).
