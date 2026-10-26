import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const translations = {
  noItems: {
    en: 'No items in order.',
    ru: 'Нет товаров в заказе.',
    de: 'Keine Artikel in der Bestellung.',
    fr: 'Aucun article dans la commande.'
  },
  unknownProduct: {
    en: 'Unknown product',
    ru: 'Неизвестный товар',
    de: 'Unbekanntes Produkt',
    fr: 'Produit inconnu'
  },
  heading: {
    en: 'Products',
    ru: 'Товары',
    de: 'Produkte',
    fr: 'Produits'
  },
  colProduct: {
    en: 'Product',
    ru: 'Товар',
    de: 'Produkt',
    fr: 'Produit'
  },
  colQuantity: {
    en: 'Quantity',
    ru: 'Количество',
    de: 'Menge',
    fr: 'Quantité'
  },
  colPrice: {
    en: 'Price',
    ru: 'Цена',
    de: 'Preis',
    fr: 'Prix'
  },
  colTotal: {
    en: 'Total',
    ru: 'Сумма',
    de: 'Summe',
    fr: 'Total'
  }
}

export default async function OrderItemsTable({
  data,
  i18n
}: {
  data?: any
  i18n?: { language?: string }
}) {
  const items = data?.items || []
  const rawLang = i18n?.language
  const lang = (rawLang && rawLang in translations.noItems ? rawLang : 'en') as
    | 'en'
    | 'ru'
    | 'de'
    | 'fr'
  const t = (dict: Record<string, string>) => dict[lang] || dict['en']

  if (!items || items.length === 0) {
    return <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>{t(translations.noItems)}</div>
  }

  const payload = await getPayload({ config: configPromise })

  // Fetch products in parallel to get their titles
  const populatedItems = await Promise.all(
    items.map(async (item: any) => {
      let productName = t(translations.unknownProduct)

      if (typeof item.product === 'object' && item.product?.title) {
        productName = item.product.title
      } else if (item.product) {
        try {
          const product = await payload.findByID({
            collection: 'products',
            id: typeof item.product === 'object' ? item.product.id : item.product,
            depth: 0
          })
          if (product?.title) {
            productName = product.title
          }
        } catch (e) {
          // ignore, product might be deleted
        }
      }
      return { ...item, productName }
    })
  )

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <h4 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>{t(translations.heading)}</h4>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--theme-elevation-200, #eaeaea)' }}>
              <th
                style={{
                  padding: '0.75rem 1rem 0.75rem 0',
                  color: 'var(--theme-elevation-500, #666)'
                }}
              >
                {t(translations.colProduct)}
              </th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--theme-elevation-500, #666)' }}>
                {t(translations.colQuantity)}
              </th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--theme-elevation-500, #666)' }}>
                {t(translations.colPrice)}
              </th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--theme-elevation-500, #666)' }}>
                {t(translations.colTotal)}
              </th>
            </tr>
          </thead>
          <tbody>
            {populatedItems.map((item: any, index: number) => {
              const currency = item.currency || 'RUB'

              // item.amount actually stores the unit price at the time of purchase
              const unitPrice = item.amount || 0
              const totalAmount = unitPrice * (item.quantity || 1)

              return (
                <tr
                  key={index}
                  style={{ borderBottom: '1px solid var(--theme-elevation-100, #f5f5f5)' }}
                >
                  <td style={{ padding: '0.75rem 1rem 0.75rem 0' }}>{item.productName}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {unitPrice} {currency}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {totalAmount} {currency}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
