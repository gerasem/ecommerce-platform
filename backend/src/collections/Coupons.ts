import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'
import { featureEnabled } from '@/access/featureEnabled'
import { features } from '@/lib/features'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  labels: {
    singular: { en: 'Coupon', ru: 'Купон', de: 'Gutschein', fr: 'Coupon' },
    plural: { en: 'Coupons', ru: 'Купоны', de: 'Gutscheine', fr: 'Coupons' }
  },
  admin: {
    group: { en: 'eCommerce', ru: 'Коммерция', de: 'E-Commerce', fr: 'E-commerce' },
    hidden: !features.coupons,
    useAsTitle: 'code'
  },
  access: {
    read: featureEnabled('coupons', adminOnly),
    create: featureEnabled('coupons', adminOnly),
    update: featureEnabled('coupons', adminOnly),
    delete: featureEnabled('coupons', adminOnly)
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      label: { en: 'Coupon Code', ru: 'Промокод', de: 'Gutscheincode', fr: 'Code coupon' },
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'The coupon code (e.g. 2OFF, SUMMER20). Will be saved as uppercase.',
          ru: 'Код купона (например, 2OFF, SUMMER20). Сохраняется в верхнем регистре.',
          de: 'Der Gutscheincode (z. B. 2OFF, SUMMER20). Wird in Großbuchstaben gespeichert.',
          fr: 'Le code du coupon (ex. 2OFF, SUMMER20). Sera enregistré en majuscules.'
        }
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (typeof value === 'string') {
              return value.toUpperCase()
            }
            return value
          }
        ]
      }
    },
    {
      name: 'discountPercentage',
      type: 'number',
      label: {
        en: 'Discount Percentage',
        ru: 'Процент скидки',
        de: 'Rabatt in Prozent',
        fr: 'Pourcentage de réduction'
      },
      required: true,
      min: 1,
      max: 100,
      admin: {
        description: {
          en: 'Discount percentage (1-100).',
          ru: 'Процент скидки (1-100).',
          de: 'Rabattprozentsatz (1-100).',
          fr: 'Pourcentage de réduction (1-100).'
        }
      }
    },
    {
      name: 'expirationDate',
      type: 'date',
      label: {
        en: 'Expiration Date',
        ru: 'Срок действия',
        de: 'Ablaufdatum',
        fr: "Date d'expiration"
      },
      admin: {
        description: {
          en: 'Optional expiration date. If empty, the coupon never expires.',
          ru: 'Необязательная дата окончания. Если не указана, купон бессрочный.',
          de: 'Optionales Ablaufdatum. Wenn leer, läuft der Gutschein nie ab.',
          fr: "Date d'expiration optionnelle. Si vide, le coupon n'expire jamais."
        }
      }
    }
  ]
}
