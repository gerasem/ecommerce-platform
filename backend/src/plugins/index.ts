import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { Plugin, Field } from 'payload'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'

import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'

import { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { ProductsCollection } from '@/collections/Products'
import { adminOrCustomerOwner } from '@/access/adminOrCustomerOwner'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { publicAccess } from '@/access/publicAccess'
import { features } from '@/lib/features'
import { configureNaturalMoneyFields } from '@/fields/naturalMoneyField'
import { buildOrderCreatedEmail } from '@/emails/orderCreated'
import {
  applyPercentageDiscount,
  calculateShippingInCheckoutCurrency,
  isMinimumOrderAmountMet,
  roundMoney,
  toMinorUnits
} from '@/lib/money'

type ShippingMethod = { id?: string | null; price?: number | null }
const naturalPriceFieldNames = ['priceInEUR', 'priceInUSD'] as const

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || process.env.SITE_NAME || 'Aura Store'
  return doc?.title ? `${doc.title} | ${siteName}` : siteName
}

const sendOrderEmail = async ({ doc, operation, req, previousDoc }: any) => {
  const email = doc.customerEmail || (doc.customer && doc.customer.email)
  if (!email) return doc

  try {
    let adminEmail = null
    try {
      const shoppingSettings = await req.payload.findGlobal({ slug: 'shop-settings', depth: 0 })
      if (shoppingSettings?.email) {
        adminEmail = shoppingSettings.email
      }
    } catch (e) {
      req.payload.logger.error('Failed to get admin email from ShoppingSettings')
    }

    const attachments: any[] = []
    let invoiceMediaId = null

    try {
      if (features.generateInvoices && operation === 'create') {
        const { generateInvoice } = await import('@/utilities/generateInvoice')
        const pdfBuffer = await generateInvoice(doc)

        // Save to media
        const mediaDoc = await req.payload.create({
          collection: 'media',
          data: {
            alt: `Invoice for order #${doc.id}`
          },
          file: {
            data: pdfBuffer,
            mimetype: 'application/pdf',
            name: `invoice-${doc.id}.pdf`,
            size: pdfBuffer.length
          }
        })

        invoiceMediaId = mediaDoc.id

        attachments.push({
          filename: `invoice-${doc.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        })
      }
    } catch (pdfErr) {
      req.payload.logger.error({ err: pdfErr, msg: 'Error generating invoice PDF' })
    }

    if (operation === 'create') {
      let emailOrder = doc
      try {
        emailOrder = await req.payload.findByID({
          collection: 'orders',
          id: doc.id,
          depth: 2,
          req
        })
      } catch (e) {
        req.payload.logger.warn({
          err: e,
          msg: 'Failed to populate order relationships for the order email'
        })
      }

      const siteName =
        process.env.NEXT_PUBLIC_SITE_NAME ||
        process.env.SITE_NAME ||
        process.env.SMTP_FROM_NAME ||
        'Shop'
      const orderEmail = buildOrderCreatedEmail({
        locale: process.env.PAYLOAD_DEFAULT_LOCALE,
        order: emailOrder,
        siteName
      })

      // 1. Email to User
      await req.payload.sendEmail({
        to: email,
        subject: orderEmail.subject,
        html: orderEmail.html,
        text: orderEmail.text,
        attachments
      })

      // 2. Email to Admin
      if (adminEmail) {
        const adminOrderEmail = buildOrderCreatedEmail({
          locale: process.env.PAYLOAD_DEFAULT_LOCALE,
          order: emailOrder,
          recipient: 'admin',
          siteName
        })

        await req.payload.sendEmail({
          to: adminEmail,
          subject: adminOrderEmail.subject,
          html: adminOrderEmail.html,
          text: adminOrderEmail.text,
          attachments
        })
      }

      // Update doc with invoice reference
      if (invoiceMediaId) {
        try {
          await req.payload.update({
            collection: 'orders',
            id: doc.id,
            data: {
              invoice: invoiceMediaId
            }
          })
          doc.invoice = invoiceMediaId
        } catch (e) {
          req.payload.logger.error(e, 'Failed to update order with invoice ID')
        }
      }
    } else if (operation === 'update' && doc.status && doc.status !== previousDoc?.status) {
      const locale = (process.env.PAYLOAD_DEFAULT_LOCALE || 'en') as 'en' | 'de' | 'ru'
      const statusTranslations: Record<string, Record<string, string>> = {
        en: {
          pending: 'Pending',
          processing: 'Processing',
          shipped: 'Shipped',
          delivered: 'Delivered',
          cancelled: 'Cancelled'
        },
        de: {
          pending: 'Ausstehend',
          processing: 'In Bearbeitung',
          shipped: 'Versandt',
          delivered: 'Zugestellt',
          cancelled: 'Storniert'
        },
        ru: {
          pending: 'Ожидает',
          processing: 'В обработке',
          shipped: 'Отправлен',
          delivered: 'Доставлен',
          cancelled: 'Отменен'
        }
      }
      const translations = statusTranslations[locale] || statusTranslations.en
      const translatedStatus = translations[doc.status] || doc.status

      const subjects: Record<string, string> = {
        en: `Status update for order #${doc.id}`,
        de: `Statusaktualisierung für Ihre Bestellung #${doc.id}`,
        ru: `Статус вашего заказа #${doc.id} изменен`
      }
      const headings: Record<string, string> = {
        en: 'Order Status Update',
        de: 'Aktualisierung des Bestellstatus',
        ru: 'Обновление статуса заказа'
      }
      const texts: Record<string, string> = {
        en: `The status of your order #${doc.id} has changed to:`,
        de: `Der Status Ihrer Bestellung #${doc.id} wurde geändert auf:`,
        ru: `Статус вашего заказа #${doc.id} изменен на:`
      }

      await req.payload.sendEmail({
        to: email,
        subject: subjects[locale] || subjects.en,
        html: `<h1>${headings[locale] || headings.en}</h1><p>${texts[locale] || texts.en} <strong>${translatedStatus}</strong></p>`
      })
    }
  } catch (err: unknown) {
    req.payload.logger.error({ err, msg: 'Error sending order email' })
  }
  return doc
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

const addFieldsToItems = (fields: Field[]): Field[] => {
  return fields.map(field => {
    if ('name' in field && field.name === 'items' && field.type === 'array') {
      return {
        ...field,
        admin: {
          ...field.admin,
          readOnly: true,
          components: {
            ...field.admin?.components,
            Field: '@/components/OrderItemsTable'
          }
        },
        fields: [
          ...field.fields,
          {
            name: 'amount',
            type: 'number',
            label: {
              en: 'Amount',
              ru: 'Сумма',
              de: 'Betrag',
              fr: 'Montant'
            }
          },
          {
            name: 'currency',
            type: 'text',
            label: {
              en: 'Currency',
              ru: 'Валюта',
              de: 'Währung',
              fr: 'Devise'
            },
            defaultValue: 'EUR'
          }
        ]
      }
    }
    if ('fields' in field) {
      return { ...field, fields: addFieldsToItems(field.fields) }
    }
    if ('tabs' in field) {
      return {
        ...field,
        tabs: field.tabs.map(tab => ({ ...tab, fields: addFieldsToItems(tab.fields) }))
      }
    }
    return field
  })
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL
  }),
  formBuilderPlugin({
    fields: {
      payment: false
    },
    formSubmissionOverrides: {
      access: {
        create: adminOnly,
        delete: adminOnly,
        read: adminOnly,
        update: adminOnly
      },
      admin: {
        group: { en: 'Content', ru: 'Контент', de: 'Inhalt', fr: 'Contenu' },
        defaultColumns: ['form', 'createdAt', 'read'],
        components: {
          Description: '@/components/forms/UnreadDescription#UnreadDescription'
        }
      },
      fields: ({ defaultFields }) => {
        return [
          ...defaultFields.map(field => {
            if ('name' in field && field.name === 'submissionData') {
              return {
                ...field,
                admin: {
                  ...field.admin,
                  hidden: true, // Hide the original block-based view
                  readOnly: true,
                  components: {
                    Cell: '@/components/forms/SubmissionDataCell#SubmissionDataCell'
                  }
                }
              }
            }
            return field
          }),
          {
            name: 'submissionDataDisplay',
            type: 'ui',
            admin: {
              components: {
                Field: '@/components/forms/SubmissionDataField#SubmissionDataField'
              }
            }
          },
          {
            name: 'read',
            type: 'checkbox',
            label: { en: 'Read', ru: 'Прочитано', de: 'Gelesen', fr: 'Lu' },
            defaultValue: false,
            admin: {
              position: 'sidebar' as const
            }
          }
        ] as Field[]
      }
    },
    formOverrides: {
      access: {
        create: adminOnly,
        delete: adminOnly,
        read: publicAccess,
        update: adminOnly
      },
      admin: {
        group: { en: 'Content', ru: 'Контент', de: 'Inhalt', fr: 'Contenu' }
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map(field => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => {
                  const featuresWithoutHeading = defaultFeatures.filter(f => f.key !== 'heading')
                  return [
                    ...featuresWithoutHeading,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] })
                  ]
                }
              })
            }
          }
          return field
        })
      }
    }
  }),
  ecommercePlugin({
    access: {
      isAdmin: adminOnly,
      adminOnlyFieldAccess,
      isDocumentOwner: adminOrCustomerOwner,
      adminOrPublishedStatus,
      customerOnlyFieldAccess
    },
    customers: {
      slug: 'users'
    },
    carts: {
      allowGuestCarts: true,
      cartsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        // Cart subtotals use the same normal units as catalog prices.
        fields: configureNaturalMoneyFields(defaultCollection.fields, ['subtotal']),
        hooks: {
          ...defaultCollection.hooks,
          beforeValidate: [
            ...(defaultCollection.hooks?.beforeValidate || []),
            async ({ data, req }) => {
              // Server-side inventory validation
              if (data?.items && Array.isArray(data.items)) {
                for (const item of data.items) {
                  const productId =
                    typeof item.product === 'object' ? item.product.id : item.product
                  const variantId =
                    typeof item.variant === 'object' ? item.variant?.id : item.variant

                  if (!productId) continue

                  try {
                    const products = await req.payload.find({
                      collection: 'products',
                      where: { id: { equals: productId } },
                      depth: 0
                    })

                    const product = products.docs[0]
                    if (!product) continue

                    let inventory = product.inventory
                    if (product.enableVariants && variantId) {
                      const variants = await req.payload.find({
                        collection: 'variants',
                        where: { id: { equals: variantId } },
                        depth: 0
                      })
                      const variant = variants.docs[0]
                      if (variant && typeof variant.inventory === 'number') {
                        inventory = variant.inventory
                      }
                    }

                    if (typeof inventory === 'number' && item.quantity > inventory) {
                      // Cap the quantity at the maximum available inventory to prevent exploits
                      item.quantity = Math.max(0, inventory)
                    }
                  } catch (e) {
                    req.payload.logger.error(e, 'Error checking inventory during cart update')
                  }
                }
              }
              return data
            }
          ]
        }
      })
    },
    ...(process.env.STRIPE_SECRET_KEY && features.enableStripe
      ? {
          payments: {
            paymentMethods: [
              (() => {
                const baseAdapter = stripeAdapter({
                  secretKey: process.env.STRIPE_SECRET_KEY,
                  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
                  webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET ?? ''
                })

                return {
                  ...baseAdapter,
                  initiatePayment: async (
                    args: Parameters<typeof baseAdapter.initiatePayment>[0]
                  ) => {
                    const { req, data } = args

                    try {
                      const requestData = req.data as Record<string, unknown> | undefined
                      const paymentData = data as typeof data & Record<string, unknown>
                      const shippingMethodId =
                        paymentData.shippingMethodId ?? requestData?.shippingMethodId
                      const couponCode = paymentData.couponCode ?? requestData?.couponCode
                      const originalSubtotal = data.cart?.subtotal
                      const rawCurrency = String(
                        data.currency || data.cart?.currency || ''
                      ).toUpperCase()

                      if (rawCurrency !== 'EUR' && rawCurrency !== 'USD' && rawCurrency !== 'RUB') {
                        throw new Error(`Unsupported cart currency: ${rawCurrency || 'missing'}`)
                      }

                      if (
                        typeof originalSubtotal !== 'number' ||
                        !Number.isFinite(originalSubtotal) ||
                        originalSubtotal <= 0
                      ) {
                        throw new Error(
                          'Cart subtotal must be a positive amount in normal currency units'
                        )
                      }

                      let totalNatural = roundMoney(originalSubtotal)
                      const shippingSettings = await req.payload.findGlobal({
                        slug: 'shipping-settings',
                        depth: 0
                      })

                      if (
                        !isMinimumOrderAmountMet({
                          minimumOrderAmount: shippingSettings?.minimumOrderAmount,
                          subtotal: originalSubtotal
                        })
                      ) {
                        throw new Error(
                          `Order subtotal is below the minimum order amount of ${shippingSettings.minimumOrderAmount} ${rawCurrency}`
                        )
                      }

                      // Coupons operate on normal currency units.
                      if (typeof couponCode === 'string' && couponCode && features.coupons) {
                        const coupons = await req.payload.find({
                          collection: 'coupons',
                          where: {
                            code: {
                              equals: couponCode.toUpperCase()
                            }
                          },
                          depth: 0
                        })
                        const coupon = coupons.docs[0]
                        const isExpired =
                          coupon?.expirationDate && new Date(coupon.expirationDate) < new Date()

                        if (coupon && !isExpired && typeof coupon.discountPercentage === 'number') {
                          totalNatural = applyPercentageDiscount(
                            totalNatural,
                            coupon.discountPercentage
                          )
                        }
                      }

                      // In a Stripe deployment, shipping settings use the same
                      // normal currency units as the cart (EUR in our deployments).
                      if (typeof shippingMethodId === 'string' && shippingMethodId) {
                        const method = (shippingSettings?.shippingMethods || []).find(
                          (item: ShippingMethod) => item.id === shippingMethodId
                        )

                        if (method) {
                          const shipping = calculateShippingInCheckoutCurrency({
                            freeShippingThreshold: shippingSettings?.freeShippingThreshold,
                            shippingPrice: method.price,
                            // The threshold is intentionally checked before the coupon.
                            subtotal: originalSubtotal
                          })

                          totalNatural = roundMoney(totalNatural + shipping.shippingCost)
                        }
                      }

                      // Stripe and the ecommerce transaction/order amount fields
                      // require minor units. This is the only conversion boundary.
                      data.cart.subtotal = toMinorUnits(totalNatural)

                      if (args.data?.cart?.items) {
                        args.data.cart.items = args.data.cart.items.map((item: any) => {
                          const { id, ...rest } = item
                          return rest
                        })
                      }

                      return await baseAdapter.initiatePayment(args)
                    } catch (err) {
                      req.payload.logger.error(
                        err,
                        'Error calculating natural-unit checkout total for Stripe'
                      )
                      throw err
                    }
                  },

                  confirmOrder: async (args: Parameters<typeof baseAdapter.confirmOrder>[0]) => {
                    const result = await baseAdapter.confirmOrder(args)

                    // Attach referral code to the created order (if valid)
                    const referralCode = args.data?.referralCode
                    if (referralCode && result.orderID && features.referrals) {
                      try {
                        // Validate referral exists in the referrals collection
                        const referrals = await args.req.payload.find({
                          collection: 'referrals',
                          where: { name: { equals: referralCode } },
                          depth: 0
                        })
                        if (referrals.docs.length > 0) {
                          await args.req.payload.update({
                            id: result.orderID,
                            collection: 'orders',
                            data: { referralCode }
                          })
                        }
                      } catch (err) {
                        args.req.payload.logger.error(err, 'Error attaching referral code to order')
                      }
                    }

                    return result
                  }
                }
              })()
            ]
          }
        }
      : {}),
    products: {
      productsCollectionOverride: ProductsCollection,
      variants: {
        variantsCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          fields: configureNaturalMoneyFields(defaultCollection.fields, naturalPriceFieldNames)
        })
      }
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        labels: {
          singular: { en: 'Order', ru: 'Заказ', de: 'Bestellung', fr: 'Commande' },
          plural: { en: 'Orders', ru: 'Заказы', de: 'Bestellungen', fr: 'Commandes' }
        },
        admin: {
          ...defaultCollection.admin,
          group: { en: 'eCommerce', ru: 'Коммерция', de: 'E-Commerce', fr: 'E-commerce' }
        },
        hooks: {
          ...defaultCollection.hooks,
          afterChange: [...(defaultCollection.hooks?.afterChange || []), sendOrderEmail]
        },
        fields: addFieldsToItems([
          ...defaultCollection.fields,
          {
            name: 'subtotal',
            type: 'number',
            label: {
              en: 'Subtotal',
              ru: 'Подытог',
              de: 'Zwischensumme',
              fr: 'Sous-total'
            },
            admin: {
              position: 'sidebar',
              readOnly: true
            }
          },
          {
            name: 'sourceCart',
            type: 'relationship',
            relationTo: 'carts',
            label: {
              en: 'Source Cart',
              ru: 'Исходная корзина',
              de: 'Ursprungswarenkorb',
              fr: 'Panier source'
            },
            unique: true,
            admin: {
              position: 'sidebar',
              readOnly: true
            }
          },
          {
            name: 'invoice',
            type: 'upload',
            relationTo: 'media',
            label: {
              en: 'Invoice (PDF)',
              ru: 'Счет (PDF)',
              de: 'Rechnung (PDF)',
              fr: 'Facture (PDF)'
            },
            admin: {
              position: 'sidebar',
              readOnly: true
            }
          },
          {
            name: 'company',
            type: 'text',
            label: {
              en: 'Company',
              ru: 'Компания',
              de: 'Unternehmen',
              fr: 'Société'
            },
            admin: {
              position: 'sidebar',
              readOnly: true
            }
          },
          {
            name: 'referralCode',
            type: 'text',
            label: {
              en: 'Referral',
              ru: 'Реферал',
              de: 'Empfehlung',
              fr: 'Parrainage'
            },
            admin: {
              position: 'sidebar',
              readOnly: true
            }
          },
          {
            name: 'shippingMethodName',
            type: 'text',
            label: {
              en: 'Shipping Method',
              ru: 'Способ доставки',
              de: 'Versandart',
              fr: 'Mode de livraison'
            },
            admin: {
              position: 'sidebar',
              readOnly: true
            }
          },
          {
            name: 'shippingCost',
            type: 'number',
            label: {
              en: 'Shipping Cost',
              ru: 'Стоимость доставки',
              de: 'Versandkosten',
              fr: 'Frais de livraison'
            },
            admin: {
              position: 'sidebar',
              readOnly: true
            }
          }
        ])
      })
    },
    currencies: {
      supportedCurrencies: [
        {
          code: 'EUR',
          decimals: 2,
          label: 'Euro',
          symbol: '€'
        },
        {
          code: 'USD',
          decimals: 2,
          label: 'US Dollar',
          symbol: '$'
        },
        {
          code: 'RUB',
          decimals: 2,
          label: 'Rubles',
          symbol: '₽'
        }
      ],
      defaultCurrency: 'EUR'
    }
  })
]
