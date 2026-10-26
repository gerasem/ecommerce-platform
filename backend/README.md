# Multi-Tenant Headless E-commerce Backend (Payload CMS 3)

Core backend template providing API and CMS functionality for multi-tenant e-commerce deployments. Built with **Payload CMS 3**, **Next.js**, and **PostgreSQL**.

## Architecture & Key Principles

1. **Clean Decoupling:** Reusable core logic serving multiple localized storefronts through headless REST & GraphQL APIs.
2. **Dynamic Content Engine:** Lexical-powered Rich Text, modular layout blocks (hero, media showcase, content blocks, conversion sections).
3. **Multi-Currency & Internationalization:** Native support for multiple locales (`en`, `de`, `ru`, `fr`) and dynamic exchange rates.
4. **Flexible E-commerce Capabilities:**
   - Products with multi-level categorization, variant matrix, inventory tracking, and related items.
   - Dynamic cart, order management, automatic PDF/HTML invoice & email generation.
   - Modular payment gateway support (Stripe, custom payment integrations).
   - Configurable feature toggles (`ENABLE_STRIPE`, `ENABLE_COUPONS`, `ENABLE_NEWS`, `ENABLE_REFERRALS`).

## Getting Started

### 1. Configure Environment
```bash
cp .env.example .env
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database & Seeding
Start PostgreSQL (via root `docker-compose.yml`) and seed baseline data:
```bash
# Seed standard system pages and initial configuration
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```

- Admin dashboard: **http://localhost:3000/admin**
- GraphQL API: **http://localhost:3000/api/graphql**
- REST API: **http://localhost:3000/api**

## Testing & Quality Assurance

```bash
# Run unit test suite
npm test

# Linting & code formatting verification
npm run check
```
