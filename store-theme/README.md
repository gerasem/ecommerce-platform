# E-commerce Store Theme (Nuxt 4 Child Layer)

Demonstration of a branded child store theme extending `frontend-core` via **Nuxt 4 Layers**.

## How Inheritance Works

This store theme defines only store-specific customizations, while automatically inheriting all pages, components, GraphQL queries, and state management from `../frontend-core`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ['../frontend-core'],
  runtimeConfig: {
    public: {
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Aura Store',
      paymentProvider: process.env.NUXT_PUBLIC_PAYMENT_PROVIDER || 'kustom',
      pricingMode: 'natural',
      enabledLocales: ['de', 'en', 'fr']
    }
  }
})
```

## Customization Capabilities

1. **Branding & Assets:** Override logos, typography, color palettes, and global styles in `app/assets/css/`.
2. **Page Overrides:** Selectively override specific routes or components simply by creating a matching file in `app/pages/` or `app/components/`.
3. **Regional Settings:** Customize supported locales, currency strategies, and localized cookie banners.

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy environment configuration
cp .env.example .env

# 3. Start theme development server (port 3002)
npm run dev
```
