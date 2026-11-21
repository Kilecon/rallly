<div align="center">

<img src="./assets/images/app-icon.svg" width="96" height="96" alt="" />

# Rallly

**Schedule group meetings, without the back-and-forth**

[**Website**](https://rallly.co) · [**Documentation**](https://support.rallly.co) · [**Discord**](https://discord.gg/uzg4ZcHbuM)

[![Actions Status](https://github.com/lukevella/rallly/actions/workflows/ci.yml/badge.svg)](https://github.com/lukevella/rallly/actions)
[![Crowdin](https://badges.crowdin.net/rallly/localized.svg)](https://crowdin.com/project/rallly)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-orange.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Discord](https://img.shields.io/badge/-Join%20Chat-7289DA?logo=discord&logoColor=white)](https://discord.gg/uzg4ZcHbuM)
[![Donate](https://img.shields.io/badge/-Donate%20with%20Paypal-blue?logo=paypal)](https://www.paypal.com/donate/?hosted_button_id=7QXP2CUBLY88E)

</div>

<img src="./assets/images/screenshot.png" alt="A Rallly poll showing participants' availability across four time slots" />

Rallly is an open-source scheduling tool that helps you find the best date and time to meet. Create a poll with a few options, share the link, and let your participants vote on when they're available. No more back-and-forth emails.

## Quick start

**Prerequisites:** Docker with Compose; locally, Node.js 24, pnpm 12 and OpenSSL. On the VPS, Nginx must be connected to the external Docker network `proxy-network`, and the private registry must be accessible.

**Local:** Copy `.env.example` to `.env`, `apps/web/.env.sample` to `apps/web/.env`, and `packages/database/.env.sample` to `packages/database/.env`. Fill in the secrets and connection settings as described in the [development guide](CONTRIBUTING.md).

```bash
pnpm install
pnpm db:generate
pnpm docker:up
pnpm db:deploy
pnpm dev
```

Open [https://web.rallly.localhost](https://web.rallly.localhost), or the URL printed by portless if you use a worktree.

**VPS:** Fill in `.env` using [.env.example](.env.example), log in to the private registry, and configure Nginx to proxy to `rally:3000`. Then run:

```bash
docker compose -f docker-compose.vps.yml up -d rally rallly_db redis serverless-redis-http garage mailpit garage_init
```

Open the public Nginx URL configured in `NEXT_PUBLIC_BASE_URL`. See [Private registry deployment](#private-registry-deployment) for details.

**Docker image build: TO BE ADDED TO MAIN AFTER THE HOTFIX CI.**

## ✨ Features

- 📅 **Date & time polls** — Propose multiple options and find what works for everyone
- 🗳️ **No account needed to vote** — Participants just open the link and respond
- 📊 **Availability grid** — See everyone's responses at a glance
- 💬 **Comments** — Discuss the details right on the poll
- 🔔 **Notifications** — Get notified when participants respond
- ✅ **Finalize a date** — Pick the winning option and notify everyone
- 🌍 **10+ languages** — Community-translated via [Crowdin](https://crowdin.com/project/rallly)
- 🔒 **Open source & self-hostable** — Own your data

## ☁️ Cloud version

The quickest way to get started is the hosted version. Create your first poll in seconds, no installation required.

**[Try Rallly free →](https://rallly.co)**

## 🐳 Self-hosting

Prefer to run your own instance? Rallly ships as a Docker image and can be self-hosted in minutes.

See the [self-hosting docs](https://support.rallly.co/self-hosting) for installation and [configuration options](https://support.rallly.co/self-hosting/configuration-options).

### Private registry deployment

The [deployment workflow](.github/workflows/deploy.yml) builds from the repository root using [the web Dockerfile](apps/web/Dockerfile). On the VPS, `VPS_APP_PATH` must contain an up-to-date [docker-compose.vps.yml](docker-compose.vps.yml), with the `rally` service configured for your instance (database, application environment and proxy network). Docker Compose must support `up --wait --wait-timeout`.

Use [.env.example](.env.example) as a template for the untracked VPS `.env`. Set `GARAGE_RPC_SECRET` to a 64-character hexadecimal secret (`openssl rand -hex 32`), use matching `SRH_TOKEN` and `KV_REST_API_TOKEN` values, and configure the Garage initialization `AWS_*` credentials for the same bucket. These credentials and the database URL must match the existing services: changing environment variables alone does not rotate persisted Postgres passwords or Garage keys. Coordinate any rotation with the services and their clients, without deleting their volumes. Keep the existing Garage RPC secret during migration, and coordinate its rotation across all Garage nodes if applicable.

The VPS Compose services publish no host ports. Nginx must be connected to the external `proxy-network` and proxy the application URL to `rally:3000`. Do not proxy the database, Redis, Garage or Mailpit to the public internet. Configure the application's VPS `.env` to use Docker service addresses: `rallly_db:5432` for Postgres, `http://garage:3900` for `S3_ENDPOINT`, `http://serverless-redis-http:80` for `KV_REST_API_URL`, and `mailpit:1025` for SMTP if Mailpit is used. The Redis HTTP adapter's `SRH_CONNECTION_STRING` must use `redis:6379`. For self-hosted uploads, the application proxies storage through its own URL.

After updating the Compose file and environment on the VPS, run `docker compose -f docker-compose.vps.yml up -d rally rallly_db redis serverless-redis-http garage mailpit garage_init` to recreate the affected services and remove their old published ports. The deployment workflow restarts only `rally`, so deploying a new app image alone does not close ports on existing service containers. Verify the public Nginx URL and the published ports after recreation. Nginx configuration and firewall rules are managed outside this repository.

The same file can run [Authentik](https://goauthentik.io) as the OIDC provider (`authentik_db`, `authentik_server`, `authentik_worker`). If Authentik runs on a separate VPS, configure Rallly to use that provider instead; its proxy and ports are managed there. For the bundled provider, set `AUTHENTIK_PG_PASS` and `AUTHENTIK_SECRET_KEY` in the VPS `.env` (generate them with `openssl rand -base64 36`; never change the secret key afterwards), start it with `docker compose -f docker-compose.vps.yml up -d authentik_server authentik_worker`, and point your reverse proxy at `authentik_server:9000` on `proxy-network`. No port is published on the host.

The workflow sets `RALLLY_IMAGE` to the published version tag, pulls only `rally`, and waits up to five minutes for its health check before reporting success. Database migrations run at container startup, except when `MAINTENANCE_MODE=true`; check the container logs if startup fails. Without `RALLLY_IMAGE`, Compose defaults to `latest`.

Configure the registry secrets (`REGISTRY_URL`, `REGISTRY_USER`, `REGISTRY_PASSWORD`), SSH secrets (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PORT`, `VPS_APP_PATH`) and `DISCORD_WEBHOOK_URL` in GitHub Actions. Discord receives failures from either job, and an HTTP error from Discord fails the notification step.

## 🛠️ Built with

[Next.js](https://github.com/vercel/next.js/) · [Prisma](https://github.com/prisma/prisma) · [tRPC](https://github.com/trpc/trpc) · [TailwindCSS](https://github.com/tailwindlabs/tailwindcss)

## 🤝 Contributing

Contributions are welcome! Have a look at the [contributing guide](CONTRIBUTING.md) to get started with local development and find out how you can help.

- 🌐 **Translators** — Help [translate Rallly](https://support.rallly.co/contribute/translations) into your language
- 🔐 **Security** — Found a vulnerability? See our [security policy](SECURITY.md)
- 🤝 **Community** — Please read our [Code of Conduct](CODE_OF_CONDUCT.md)

## 📜 License

Rallly is open-source under the GNU Affero General Public License Version 3 (AGPLv3) or any later version. See [LICENSE](LICENSE) for more detail.

## 💚 Sponsors

Thank you to our sponsors for making this project possible.

[Become a sponsor &rarr;](https://github.com/sponsors/lukevella)

<br />

<a href="https://vercel.com/open-source-program">
  <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge-2026.svg" height="40" />
</a>
