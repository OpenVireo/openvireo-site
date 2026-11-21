---
title: "Sharing passwords at home, without sharing everything"
author: "Bongani Mbigi"
date: 2026-11-14
category: "Features"
description: "How OpenVireo Families works: shared vaults for the Wi-Fi, streaming and bills, private vaults that stay private, and what each person in the family can see."
---

Every household has a handful of passwords everyone needs: the Wi-Fi, the streaming services, the energy account, the
kids' school portal. And every household has a lot more that belong to one person. OpenVireo Families is built around
that split: **shared vaults** for what the family uses together, and **private vaults** that stay private.

<!--more-->

## How it's organised

A family on OpenVireo is an **organization** with up to six people. Each person signs in with their own account and
their own master password.

- **Shared vaults** belong to the family. You decide who's in each one. A "Household" vault for everyone, a "Parents"
  vault for the two of you, a "Grandma" vault for the person who helps her with her accounts.
- **Private vaults** belong to each person. Nobody else in the family can see them, including whoever pays for the
  plan.

Most families end up with something like this:

| Vault | Who's in it |
|---|---|
| Household (Wi-Fi, streaming, utilities) | everyone |
| Parents (bank, insurance, taxes) | the two adults |
| Kids' school | parents, read only for the kids |
| Each person's own vault | just them |

## Who can do what

Each person in a shared vault has one of three levels of access:

- **Read only:** they can open the vault and fill or copy passwords, but not change them. Good for kids, or for a
  password you don't want accidentally edited.
- **Can edit:** they can also add and change entries.
- **Can manage:** they can also add or remove people.

In the organization itself, **owners and admins** invite people, create vaults and pick who's in each one. Other
members only see the vaults they've been added to.

## Private really means private

This is the part we're most careful about. Every vault is encrypted on your devices, and each shared vault's key is
sealed separately to each person in it. That's not a permission setting on our server: it's how the encryption
works. Someone who isn't in a vault doesn't have its key, so the app has nothing to show them, and neither do we.

Owners and admins manage who's in the family's shared vaults. They can't open anyone's private vault, and paying for
the plan doesn't change that.

## When someone leaves

If someone moves out, or you remove a person from a vault, OpenVireo gives that vault a **new key**, sealed only to the
people still in it. The person who left may still have the copy they last synced, but they can't open anything added
or changed after they left. Changing the most important passwords in that vault is still a good idea.

## What it costs

The Families plan is **$4 a month, or $40 a year**, for the whole family, with a 14-day free trial. It includes:

- up to **6 people**,
- **unlimited** shared vaults, with 1 GB of storage each,
- a **30-day** audit log of who joined, left, or was given access to what (it can't show what's inside the vaults:
  nobody but the family can read those),
- **unlimited** share links from family vaults, for the babysitter or a guest who needs the Wi-Fi password once.

You can also buy it in the [iPhone app]({{< baseurl >}}ios/), where Apple bills it at the App Store's price.

Two things worth knowing:

- **The plan covers the family's shared vaults.** Each person's private vaults are on their own plan. On Free, that's
  one private vault; anyone who wants more can add Premium for themselves.
- **Nothing is ever locked.** If you cancel, every vault keeps opening and syncing. You just can't add more people or
  vaults than the free organization plan allows (2 people, 2 shared vaults) until you upgrade or remove some.

Want to try it with two people first? An organization starts on the free plan. See [pricing]({{< baseurl >}}pricing/)
for everything side by side.

## Setting it up

1. Create a free account, if you haven't, on your computer, your iPhone or [the web](https://app.openvireo.com/).
2. Create an organization for your family, and choose the Families plan.
3. Invite each person by email. When they've accepted, you confirm them, and you check that the fingerprint you see
   matches the one on their screen. That makes sure the key you're sealing the family's vaults to is really theirs.
4. Create your shared vaults and add people to each one.

Then everyone sees the shared vaults next to their own, on every device, and fills passwords from them the same way.
