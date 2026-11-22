---
title: "Secrets for scripts and CI with the ov CLI"
author: "Bongani Mbigi"
date: 2026-11-15
category: "Features"
description: "Keep API keys and database passwords in an OpenVireo vault and use them from scripts, CI jobs and servers with the ov CLI and a service account, with every value masked in the output."
---

Most teams keep their deployment secrets in three places at once: a password manager for people, CI secrets for
pipelines, and a `.env` file someone copied around in 2023. OpenVireo lets scripts and CI read the same vault people
use, with a CLI called `ov`. Change a password in the vault, and the next deploy picks it up.

<!--more-->

## Service accounts: access without anyone's password

Scripts shouldn't sign in as you. An OpenVireo **service account** belongs to an organization, gets access to specific
vaults (read only, or read and write), and signs in with a token that starts with `ov_sa_`.

An owner or admin creates one in the desktop app, in the organization window, and picks its vaults. The token is shown
once: store it as a CI secret or on the server. A service account can have several tokens, each with its own name and
expiry, so you can replace one without breaking the others.

Like every OpenVireo client, `ov` downloads the vault and decrypts it locally. The service account's keys are sealed
to it the same way a person's are; our servers still only see encrypted files.

## Install

`ov` is a single binary for Linux, macOS and Windows, with nothing else to install. Every
[release](https://github.com/OpenVireo/openvireo-sdk/releases) has a `SHA256SUMS` file signed with the OpenVireo
release key; macOS builds are notarized, and Windows builds are signed. On Linux:

```sh
v=0.11.0 p=linux-x64      # or linux-arm64, darwin-arm64, darwin-x64
for f in "ov-$v-$p.tar.gz" SHA256SUMS SHA256SUMS.asc; do
  curl -fLO "https://github.com/OpenVireo/openvireo-sdk/releases/download/v$v/$f"
done
gpg --verify SHA256SUMS.asc SHA256SUMS
sha256sum --ignore-missing -c SHA256SUMS
tar -xzf "ov-$v-$p.tar.gz" && sudo install "ov-$v-$p/ov" /usr/local/bin/
```

## Referring to a secret

Every secret has an address:

```text
ov://<vault>/<group>/<entry>/<field>
```

For example, `ov://Team%20Infra/Deploy/Database/password` is the password of the *Database* entry in the *Deploy*
group of the *Team Infra* vault. Spaces are percent-encoded. Fields are the usual ones (`username`, `password`, `url`,
`notes`) or any custom field, like `api_key`.

## Read one secret

```sh
export OPENVIREO_SERVICE_ACCOUNT_TOKEN=ov_sa_…
ov read ov://Team%20Infra/GitHub/password
```

## Fill in a config file

`ov inject` replaces references in a template. Use `{{ … }}` when other text follows the reference:

```sh
echo 'dsn: postgres://app:{{ ov://Team%20Infra/Deploy/Database/password }}@db/app' | ov inject
ov inject -i config.yml.tpl -o config.yml       # the output file is created with mode 0600
```

## Run a command with secrets in its environment

This is the one most people end up using. Write a `.env` template with references instead of values, and commit it:

```sh
# .env.tpl
DB_USER=ov://Team%20Infra/Deploy/Database/username
DB_PASSWORD=ov://Team%20Infra/Deploy/Database/password
```

Then:

```sh
ov run --env-file .env.tpl -- ./migrate.sh
```

`ov run` resolves the references, starts the command with them in its environment, and **masks every secret in its
output**. If the script prints `$DB_PASSWORD`, the log shows `<concealed by openvireo>`. Masking works even when a
value is split across two writes, and for each line of a multi-line secret like a private key. The command never sees
your service account token, and `ov run` exits with the command's own exit code.

## Rotate a password

```sh
ov rotate ov://Team%20Infra/Deploy/Database/password --generate --length 40
```

The old value goes into the entry's history, so you can always get it back. If someone edits the same vault at the
same time, the change is merged, not overwritten. A service account with read-only access is refused before anything is
uploaded.

## In GitHub Actions

There's an action that does the same thing for a workflow:

```yaml
- name: Load secrets
  uses: openvireo/openvireo-sdk/packages/github-action@v0.11.0
  with:
    service-account-token: ${{ secrets.OPENVIREO_SERVICE_ACCOUNT_TOKEN }}
  env:
    DB_PASSWORD: ov://Team%20Infra/Deploy/Database/password
    DATABASE_URL: postgres://app:{{ ov://Team%20Infra/Deploy/Database/password }}@db/app

- run: ./deploy.sh      # $DB_PASSWORD and $DATABASE_URL are set; printing them shows ***
```

Every resolved value is masked in the logs before anything is exported, and the step fails if any reference can't be
resolved, so a job never runs with a missing secret.

## Signed in as yourself

For your own scripts on your own computer, you can use `ov` with your account instead of a service account:

```sh
ov login --email you@example.com
ov read ov://Private/Bank/password
ov share ov://Private/Wi-Fi --expires 1d       # a share link, from the terminal
```

It asks for your master password each time, and never stores it. For anything that runs unattended, use a service
account.

## Plans

Service accounts belong to organizations. The free organization plan includes one, Families one, Teams ten, and
Business unlimited. See [pricing]({{< baseurl >}}pricing/).

Everything else, including `ov connect` (a local REST server for Kubernetes and other tools) and the SDK for your own
code, is in the [SDK docs](https://developer.openvireo.com/sdk/).
