# E-commerce Frontend Core (Nuxt 4 Layer)

Base architectural layer and UI component library for multi-tenant e-commerce storefronts. Built with **Nuxt 4**, **Vue 3**, **Pinia**, and **Nuxt UI**.

## Architectural Highlights

- **Nuxt Layer Foundation:** Serves as the upstream layer (`extends`) for all store themes. Shared components, composables, stores, and layouts remain centralized.
- **Type-Safe GraphQL Integration:** Integrated with GraphQL Code Generator (`graphql-codegen`) for end-to-end typed queries and mutations against Payload CMS.
- **Reactive State Management:** Pinia stores for Cart (`useCartStore`), Checkout (`useCheckoutStore`), Favorites (`useFavoritesStore`), and Authentication (`useUserStore`).
- **Dynamic Content & Lexical Renderers:** Dynamic block builders (`FormBlock`, `RawHtmlBlock`, `RichText`, `ConversionBoxes`) reflecting CMS layout configurations.
- **Internationalization (i18n):** Multi-language setup (`en`, `de`, `ru`, `fr`) with locale-aware routing and currency formatting.
- **SEO & Structured Data:** Automatic Schema.org / JSON-LD structured metadata generation for products, breadcrumbs, and organization.

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env

# 3. Generate GraphQL types (optional, pre-generated included)
npm run gql:gen

# 4. Start development server (runs on http://localhost:3001)
npm run dev
```

## Quality Assurance

```bash
npm run check    # runs prettier check, eslint, typecheck and vitest tests
```
