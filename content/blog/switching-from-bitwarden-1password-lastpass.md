---
title: "Switching from Bitwarden, 1Password, LastPass or Proton Pass"
author: "Bongani Mbigi"
date: 2026-11-18
category: "Features"
description: "How to export your passwords from Bitwarden, 1Password, LastPass or Proton Pass and import them into OpenVireo, straight into a vault that syncs to your iPhone and the web."
---

Moving password managers sounds like a weekend project. With OpenVireo it's about ten minutes: export from your old
app, import in OpenVireo on your computer, and your passwords are in a vault that syncs to your iPhone and the web.
This guide covers Bitwarden, 1Password, LastPass and Proton Pass.

<!--more-->

## Before you start

- **Use OpenVireo on your computer** (Windows, macOS or Linux) for the import. [Download it]({{< baseurl >}}download/)
  if you haven't. The import reads the export file locally; nothing is uploaded until it's encrypted.
- **Sign in to your OpenVireo account** if you want the passwords to sync. You can also import into a local KeePass
  file and decide later.
- **Most export files aren't encrypted.** They hold every password in plain text. Export, import, check, then delete
  the file (and empty the trash). Don't email it to yourself or leave it in Downloads.

## 1. Export from your old app

### Bitwarden

In the Bitwarden web vault or desktop app, go to **Tools › Export vault** (on the web: **Tools › Export**) and choose
**.json**. You can choose a password-protected export instead; OpenVireo asks for that password when you import.

Choose JSON rather than CSV: it keeps your folders, custom fields, TOTP secrets and notes.

### 1Password

In 1Password 8 on your computer, go to **File › Export** and pick your account. Choose the **1PUX** format. It's a
zip file with everything in it.

If you're on 1Password 7, you can use an **OPVault** folder instead: save your vault locally and import the
`.opvault` folder. It stays encrypted, and OpenVireo asks for your 1Password password to open it.

### LastPass

LastPass exports a CSV file. In the LastPass browser extension or web vault, go to **Advanced options › Export**
(sometimes under **Account options**), confirm with your master password, and save the file as `lastpass.csv`.

### Proton Pass

In Proton Pass, go to **Settings › Export** and choose the **JSON** format (not the encrypted PGP export).

## 2. Import into OpenVireo

In OpenVireo on your computer:

1. Choose **Database › Import…**.
2. Pick the format: **Bitwarden (.json)**, **1Password Export (.1pux)**, **1Password Vault (.opvault)**,
   **Proton Pass (.json)** or **Comma Separated Values (.csv)** for LastPass, and select the file.
3. Choose where the passwords go:
   - **New vault in my account** puts them in a vault that syncs, either a personal vault or one in your organization
     if you're an owner or admin.
   - **New database** creates a local KeePass file.
   - **Existing database** adds them under a group you choose in a database or vault you already have open.
4. Review the preview and click **Done**.

For LastPass's CSV, OpenVireo shows a column-mapping screen first. It usually guesses right, but check that the
username, password, URL and notes columns line up in the preview before you finish.

## 3. Check it

Open a few entries you use often and compare them with the old app: logins, notes, two-factor codes, attachments. Then
try filling one in your browser with the [OpenVireo Browser extension]({{< baseurl >}}blog/openvireo-in-your-browser/),
and on your iPhone with AutoFill.

What comes across depends on what the export file contains. Logins, notes, URLs, custom fields and TOTP secrets
usually do. Passkeys generally don't: they're tied to the app that created them, so plan to add a new passkey on the
sites that use them.

## 4. Clean up

- **Delete the export file** and empty the trash.
- **Install OpenVireo on your other devices.** Sign in on your [iPhone]({{< baseurl >}}ios/) and in OpenVireo Web, and
  the new vault is already there.
- **Turn off the old app's autofill** in your browser and phone, so two password managers don't fight over every form.
- **Keep the old account for a little while**, until you're sure everything you need came across. Then cancel it.

## Why it's a one-way street for your old app, but not for OpenVireo

Most password managers make it easy to come in and harder to leave. OpenVireo stores every vault as a KeePass
(`.kdbx`) file, an open format that dozens of apps can read. If you ever want to leave, export the vault and open it in
KeePassXC, KeePassium, Strongbox or KeePassDX. No conversion and no CSV full of plain-text passwords.

If you're still deciding, the [comparisons]({{< baseurl >}}compare/) go through OpenVireo next to
[Bitwarden]({{< baseurl >}}compare/bitwarden/) and [1Password]({{< baseurl >}}compare/1password/).
