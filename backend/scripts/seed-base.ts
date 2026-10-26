import dotenv from 'dotenv'
dotenv.config()

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

const SYSTEM_PAGES = [
  {
    slug: 'home',
    systemRole: 'home' as const,
    title: { de: 'Startseite', ru: 'Главная', en: 'Home', fr: 'Accueil' }
  },
  {
    slug: 'all-items',
    systemRole: 'all_items' as const,
    title: { de: 'Alle Artikel', ru: 'Все товары', en: 'All Items', fr: 'Tous les articles' }
  },
  {
    slug: 'cart',
    systemRole: 'cart' as const,
    title: { de: 'Warenkorb', ru: 'Корзина', en: 'Cart', fr: 'Panier' }
  },
  {
    slug: 'checkout',
    systemRole: 'checkout' as const,
    title: { de: 'Kasse', ru: 'Оформление заказа', en: 'Checkout', fr: 'Paiement' }
  },
  {
    slug: 'favorites',
    systemRole: 'favorites' as const,
    title: { de: 'Favoriten', ru: 'Избранное', en: 'Favorites', fr: 'Favoris' }
  },
  {
    slug: 'delivery',
    systemRole: 'delivery' as const,
    title: { de: 'Lieferung & Versand', ru: 'Доставка и оплата', en: 'Delivery & Shipping', fr: 'Livraison' }
  },
  {
    slug: 'privacy-policy',
    systemRole: 'privacy_policy' as const,
    title: { de: 'Datenschutzerklärung', ru: 'Политика конфиденциальности', en: 'Privacy Policy', fr: 'Politique de confidentialité' }
  },
  {
    slug: 'imprint',
    systemRole: 'imprint' as const,
    title: { de: 'Impressum', ru: 'Выходные данные', en: 'Imprint', fr: 'Mentions légales' }
  }
]

async function seed() {
  console.log('\n======================================================')
  console.log('SEEDING BASE STORE CONFIGURATION & SYSTEM PAGES')
  console.log('======================================================')

  const payload = await getPayload({ config: configPromise })
  const defaultLocale = (process.env.PAYLOAD_DEFAULT_LOCALE || 'en') as 'de' | 'ru' | 'en' | 'fr'
  const locales = (process.env.PAYLOAD_LOCALES ? process.env.PAYLOAD_LOCALES.split(',') : [defaultLocale]) as Array<'de' | 'ru' | 'en' | 'fr'>

  console.log(`Active Store:    ${process.env.SITE_NAME || 'Default'}`)
  console.log(`Default Locale:  ${defaultLocale}`)
  console.log(`Locales:         ${locales.join(', ')}\n`)

  const createdPageDocs: Record<string, any> = {}

  for (const pageDef of SYSTEM_PAGES) {
    const existing = await payload.find({
      collection: 'pages',
      where: {
        or: [
          { systemRole: { equals: pageDef.systemRole } },
          { slug: { equals: pageDef.slug } }
        ]
      },
      limit: 1
    })

    if (existing.docs.length > 0) {
      console.log(`  [SKIP] Page "${pageDef.slug}" already exists (id: ${existing.docs[0].id})`)
      createdPageDocs[pageDef.systemRole] = existing.docs[0]
      continue
    }

    const primaryTitle = pageDef.title[defaultLocale] || pageDef.title.en || pageDef.title.de

    const doc = await payload.create({
      collection: 'pages',
      locale: defaultLocale,
      data: {
        title: primaryTitle,
        slug: pageDef.slug,
        systemRole: pageDef.systemRole,
        _status: 'published',
        layout: [
          {
            blockType: 'content'
          }
        ]
      },
      context: { disableRevalidate: true }
    })

    // Update remaining locales
    for (const loc of locales) {
      if (loc !== defaultLocale && pageDef.title[loc]) {
        await payload.update({
          collection: 'pages',
          id: doc.id,
          locale: loc,
          data: {
            title: pageDef.title[loc]
          },
          context: { disableRevalidate: true }
        })
      }
    }

    console.log(`  [OK] Created page: ${pageDef.slug} -> "${primaryTitle}" (role: ${pageDef.systemRole})`)
    createdPageDocs[pageDef.systemRole] = doc
  }

  // Configure Header Top Navigation
  try {
    const headerPagesIds: number[] = []
    if (createdPageDocs.delivery?.id) headerPagesIds.push(createdPageDocs.delivery.id)

    if (headerPagesIds.length > 0) {
      await payload.updateGlobal({
        slug: 'header',
        data: {
          headerPages: headerPagesIds as any
        }
      })
      console.log('\n  [OK] Initialized Header navigation')
    }
  } catch (err: any) {
    console.log(`  [WARN] Header initialization skipped: ${err.message}`)
  }

  // Configure Footer navigation links
  try {
    const footerNavItems: any[] = []
    const footerPages = [
      createdPageDocs.delivery,
      createdPageDocs.privacy_policy,
      createdPageDocs.imprint
    ].filter(Boolean)

    for (const p of footerPages) {
      footerNavItems.push({
        link: {
          type: 'reference',
          reference: {
            relationTo: 'pages',
            value: p.id
          },
          label: p.title || p.slug
        }
      })
    }

    if (footerNavItems.length > 0) {
      await payload.updateGlobal({
        slug: 'footer',
        data: {
          navItems: footerNavItems
        }
      })
      console.log('  [OK] Initialized Footer navigation links')
    }
  } catch (err: any) {
    console.log(`  [WARN] Footer initialization skipped: ${err.message}`)
  }

  // Configure ShippingSettings with a default delivery method if empty
  try {
    const shipping = await payload.findGlobal({ slug: 'shipping-settings' })
    if (!shipping?.shippingMethods || shipping.shippingMethods.length === 0) {
      await payload.updateGlobal({
        slug: 'shipping-settings',
        data: {
          minimumOrderAmount: 0,
          freeShippingThreshold: 50,
          shippingMethods: [
            {
              name: defaultLocale === 'de' ? 'Standardversand' : 'Standard Delivery',
              price: 4.90,
              provider: 'none'
            }
          ] as any
        }
      })
      console.log('  [OK] Initialized ShippingSettings (Standard shipping)')
    }
  } catch (err: any) {
    console.log(`  [WARN] ShippingSettings skipped: ${err.message}`)
  }

  // Configure ShopSettings
  try {
    await payload.updateGlobal({
      slug: 'shop-settings',
      data: {
        isSearchable: true,
        showHighlightedProducts: true
      }
    })
    console.log('  [OK] Initialized ShopSettings')
  } catch (err: any) {
    console.log(`  [WARN] ShopSettings skipped: ${err.message}`)
  }

  console.log('\n======================================================')
  console.log('SEED COMPLETED SUCCESSFULLY!')
  console.log('======================================================\n')
  process.exit(0)
}

seed().catch(err => {
  console.error('\nSeed failed:', err)
  process.exit(1)
})
