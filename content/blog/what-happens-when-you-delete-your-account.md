---
title: "What happens when you delete your account"
author: "Bongani Mbigi"
date: 2026-11-13
category: "Security"
description: "Deleting an OpenVireo account locks it at once and erases it after 30 days. What's deleted, what happens to shared vaults and organizations, and how to change your mind."
---

You can delete your OpenVireo account yourself, from any of our apps, without emailing anyone. We wanted that to be
easy, but not so easy that a mis-tap, a stolen phone or a bad day can wipe out your passwords for good. So deleting
works in two steps: your account is **locked at once**, and **erased after 30 days**. This post explains exactly what
happens in between.

<!--more-->

## Where to find it

- **iPhone and iPad:** Settings › Account › Delete Account
- **Web:** Account › Delete account
- **Desktop:** Account › Delete Account…
- **Command line:** `ov account delete`

You need to be online, and you confirm by typing your account email and your master password.

## You see what will happen first

Before anything changes, the app lists what will happen to each of your vaults, organizations, your plan and your
share links. Nothing is decided for you behind the scenes. For example:

- *Personal* will be deleted.
- *Home*, shared with Sam, will be deleted. Sam keeps access until the account is erased.
- You'll leave *Acme Corp*. It keeps running.
- Your Premium plan stops renewing.

## The moment you delete

As soon as you confirm:

- **You're signed out everywhere.** Every device is removed from your account. Copies of your vaults stored on your
  devices for offline use are deleted.
- **Your share links stop working.** Anyone who opens one sees that it's no longer available.
- **Your plan stops renewing.** There's no refund for the time left, and nothing is charged again.
- **We email you** with the date your account will be erased, and how to restore it.

Your vaults, keys and memberships are still there, locked. You can sign in, but the only choices are **Restore
account** and **Sign out**. Our sync server won't serve your vaults to anyone signing in as you, including you, until
you restore.

## The 30 days

The grace period exists for two reasons.

**You might change your mind.** Sign in within 30 days with your master password (and your Secret Key, on a new device)
and choose **Restore account**. Everything comes back, except share links. A plan that hasn't reached the end of its
billing period starts renewing again.

**The people you share with need time.** If you shared a vault with someone, they keep access until the end of the 30
days, so they can copy what they need. Better still, before you delete, you can **give a shared vault to one of the
people in it**. It becomes theirs, it's never deleted, and nobody loses anything.

We email you again 3 days before the account is erased.

## Organizations

What happens depends on your role:

- **Member, admin, or one of several owners:** you leave the organization when your account is erased. It keeps
  running, and the vaults you could open are flagged for a new key, so their managers can make sure the copies you had
  can't open future versions.
- **The only person in it:** the organization is deleted with your account, together with its vaults.
- **The only owner, with other people in it:** you can't delete yet. First make someone else an owner (an admin is
  easiest), or delete the organization. **We never choose a new owner for you.** Handing an organization's passwords
  to someone you didn't pick isn't a decision a server should make.

## When the 30 days are up

Your account is erased:

- your personal vaults, with every copy and earlier version we stored;
- your encrypted keys and sign-in details, your two-step verification and your email address;
- your access to vaults others shared with you, and your memberships;
- your payment customer record.

We keep one line in the audit log saying an account was deleted, without your email address. Nothing else. After that,
you can sign up again with the same email, as a new account.

## A few honest details

- **We can't decrypt anything on the way out**, the same as always. Deleting removes encrypted files we never could
  open. If you want a copy of your passwords, export them before you delete.
- **iPhone subscriptions are billed by Apple.** We can't cancel those for you. The app tells you, and opens the
  subscription settings so you can cancel it there first.
- **Receipts stay with the payment provider.** Plans bought on our website are sold through Stripe's Link, so your
  order history lives on link.com. To delete that data as well, ask Link.
- **Your local files aren't touched.** KeePass files on your computer that were never in your account stay exactly
  where they are.

The short version is on the [delete your account]({{< baseurl >}}delete-account/) page. If you run into trouble,
write to [admin@openvireo.com](mailto:admin@openvireo.com).
