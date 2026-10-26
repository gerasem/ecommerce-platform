# Environment configuration

The deployment `.env` is the source of truth for technical capabilities. Payload
stores operational shop data such as shipping methods, contact details, category
order, banners and SEO settings in the database.

## Shared feature flags

Compose maps each server flag to the matching public Nuxt flag. Do not maintain
two independent values.

| Backend `.env` | Frontend runtime key | Default |
| --- | --- | --- |
| `ENABLE_STRIPE` | `NUXT_PUBLIC_ENABLE_STRIPE` | `false` |
| `ENABLE_COUPONS` | `NUXT_PUBLIC_ENABLE_COUPONS` | `false` |
| `ENABLE_REFERRALS` | `NUXT_PUBLIC_ENABLE_REFERRALS` | `false` |
| `ENABLE_NEWS` | `NUXT_PUBLIC_ENABLE_NEWS` | `false` |
| `ENABLE_RELATED_PRODUCTS` | `NUXT_PUBLIC_ENABLE_RELATED_PRODUCTS` | `true` |

Backend-only flags are `ENABLE_MULTI_CURRENCY`, `ENABLE_INVOICES`,
`ENABLE_INVENTORY` and `ENABLE_VARIANTS`.

Before the first deployment of this change, copy the current values from the old
Payload **Technical Settings** screen into `.env`. Missing flags are disabled,
except `ENABLE_RELATED_PRODUCTS`, which defaults to enabled. The old database
table is intentionally left in place for rollback safety, but it is no longer
registered in Payload or exposed through the API.

Changing a backend flag requires restarting the backend. Restart both application
containers when changing a shared flag:

```sh
docker compose up -d --force-recreate backend frontend
```

## Local development

Copy each repository's `.env.example` to `.env`. Use
`NUXT_PAYLOAD_URL=http://localhost:3000` and
`NUXT_PUBLIC_PAYLOAD_URL=http://localhost:3000` when both applications run on the
host. The child `store-theme` inherits runtime configuration from
`frontend-core` but keeps its own `.env`.

## Production

Copy `production.env.example` to the server as `.env` and use
`docker-compose.production.example.yml` as the deployment template. Restrict the
secret file to the deployment user:

```sh
chmod 600 .env
docker compose config
docker compose up -d
```

Use immutable image tags or digests, back up `pgdata` and uploaded media, and
rotate any secret that has been published outside the server.
