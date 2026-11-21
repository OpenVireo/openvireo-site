---
title: "Your Secret Key, explained"
author: "Bongani Mbigi"
date: 2026-11-12
category: "Security"
description: "What the Secret Key in your OpenVireo Emergency Kit is, why your account needs it as well as your master password, when you'll be asked for it, and where to find it again."
---

When you create an OpenVireo account, you get an **Emergency Kit** with a code on it that looks like
`K1-7GQ2XM-…`. That's your **Secret Key**. Most of the time you'll never type it. But it does a lot of quiet work to
keep your passwords safe, and it's worth knowing what it's for.

<!--more-->

## What it is

Your Secret Key is 128 random bits, made **on your device** when you sign up. It's shown as `K1-` followed by 26
letters and digits in groups, so it's easy to read out and copy:

```text
K1-XXXXXX-XXXXX-XXXXX-XXXXX-XXXXX
```

The letters skip the ones that are easy to confuse, like `I`, `L` and `O`, so a key written on paper can be typed back
correctly.

It never leaves your devices. Our servers have never seen it, and couldn't send it to you if you asked.

## Why you need it as well as your password

Your vaults are encrypted with keys that are protected by your **Account Unlock Key**. That key is made from two
things together:

1. your **master password**, stretched with Argon2id, a deliberately slow function, and
2. your **Secret Key**.

Neither one alone is enough.

Here's why that matters. Imagine someone broke into our servers and copied everything. All they'd get is encrypted
files. With a password-only design, they could start guessing passwords offline at full speed, and weak or reused
passwords would fall eventually.

With a Secret Key in the mix, guessing your password is useless without your Secret Key too, and that's 128 random
bits that were never on our servers. Even a short password can't be brute-forced from our data alone. The Secret Key
protects you from **us** being the weak link.

The full picture of what we store and what we can't see is in
[what our servers can't see]({{< baseurl >}}blog/what-our-servers-cant-see/).

## When you'll be asked for it

Almost never. Each of your devices keeps your Secret Key in the system's secure storage: the Keychain on iPhone and
Mac, Windows' credential store, the Secret Service on Linux. After that, your master password (or Face ID) is all you
type.

You'll need it:

- **When you sign in on a new device**, or in a browser where you haven't signed in before.
- **After you sign out with "forget" on a device**, such as a shared computer.
- **To restore a deleted account** from a device that no longer has it.

## Where to find it again

If you didn't save your Emergency Kit, or you've lost it, any device that's still signed in can show it again:

- **iPhone and iPad:** Settings › Account › Emergency Kit
- **Web:** Account › Show Secret Key
- **Desktop:** Account › Emergency Kit…

Each one lets you copy the key or save the kit again.

## How to keep it safe

- **Save the Emergency Kit** when you sign up, and put it somewhere you'd look in a year: printed in a drawer with your
  important papers, or in a safe place you already use.
- **Don't keep it only in OpenVireo.** If the only copy of your Secret Key is inside the vault it unlocks, it can't help
  you get in.
- **Treat it like a house key, not like a password.** Someone with only your Secret Key still needs your master
  password. But keep them apart: don't store them on the same note.

## What if I lose it, and every device?

As long as one device is still signed in, you're fine: open the Emergency Kit there.

If every device is gone and the kit is lost too, we can't recover your vaults, because we never had the key.
What we can do is help you **get your account back** after a person on our team checks it's really you: a reset gives
you a new master password, a new Secret Key and a new Emergency Kit. Your old vaults are put away for 30 days, and if
you find the old kit in that time, you can bring them back. That process is explained in
[account recovery without your key]({{< baseurl >}}blog/account-recovery-without-your-key/).

It's the trade-off every end-to-end encrypted service makes: if we could recover your passwords without your keys, so
could anyone who broke into our servers. Your Secret Key is what makes that impossible.
