import type { GlobalConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const ShippingSettings: GlobalConfig = {
  slug: 'shipping-settings',
  label: {
    en: 'Shipping Settings',
    ru: 'Настройки доставки',
    de: 'Versand-Einstellungen',
    fr: 'Paramètres de livraison'
  },
  admin: {
    group: { en: 'Settings', ru: 'Настройки', de: 'Einstellungen', fr: 'Paramètres' }
  },
  access: {
    read: () => true, // Publicly readable for the frontend
    update: adminOnly
  },
  fields: [
    {
      name: 'minimumOrderAmount',
      type: 'number',
      label: {
        en: 'Minimum Order Amount',
        ru: 'Минимальная сумма заказа',
        de: 'Mindestbestellwert',
        fr: 'Montant minimum de commande'
      },
      min: 0,
      admin: {
        description: {
          en: 'Minimum subtotal required to place an order. Use normal checkout-currency units. Set to 0 to disable this check.',
          ru: 'Минимальная сумма заказа для оформления. В единицах валюты заказа. 0 — отключить проверку.',
          de: 'Erforderlicher Mindestbestellwert. In Standard-Währungseinheiten. 0 eingeben, um zu deaktivieren.',
          fr: 'Sous-total minimum requis pour commander. En unités de devise standard. Mettez 0 pour désactiver.'
        },
        step: 0.01
      },
      defaultValue: 0,
      required: true
    },
    {
      name: 'freeShippingThreshold',
      type: 'number',
      label: {
        en: 'Minimum Order Amount for Free Shipping',
        ru: 'Порог бесплатной доставки',
        de: 'Schwellenwert für kostenlosen Versand',
        fr: 'Seuil pour livraison gratuite'
      },
      min: 0,
      admin: {
        description: {
          en: 'Subtotal at which shipping becomes free. Use normal checkout-currency units. Set to 0 to disable automatic free shipping.',
          ru: 'Сумма заказа, от которой доставка становится бесплатной. 0 — отключить.',
          de: 'Bestellwert, ab dem der Versand kostenlos ist. 0 eingeben, um zu deaktivieren.',
          fr: 'Sous-total à partir duquel la livraison est gratuite. Mettez 0 pour désactiver.'
        },
        step: 0.01
      },
      defaultValue: 0,
      required: true
    },
    {
      name: 'shippingMethods',
      type: 'array',
      label: {
        en: 'Shipping Methods',
        ru: 'Способы доставки',
        de: 'Versandarten',
        fr: 'Modes de livraison'
      },
      labels: {
        singular: {
          en: 'Shipping Method',
          ru: 'Способ доставки',
          de: 'Versandart',
          fr: 'Mode de livraison'
        },
        plural: {
          en: 'Shipping Methods',
          ru: 'Способы доставки',
          de: 'Versandarten',
          fr: 'Modes de livraison'
        }
      },
      minRows: 1,
      admin: {
        description: {
          en: 'Define the available shipping methods for the customer to choose from.',
          ru: 'Доступные покупателю способы доставки.',
          de: 'Verfügbare Versandmethoden für den Kunden.',
          fr: 'Modes de livraison disponibles pour le client.'
        }
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: {
                en: 'Method Name',
                ru: 'Название способа',
                de: 'Name der Versandart',
                fr: 'Nom du mode'
              },
              required: true
            },
            {
              name: 'price',
              type: 'number',
              label: {
                en: 'Shipping Price',
                ru: 'Стоимость доставки',
                de: 'Versandkosten',
                fr: 'Frais de livraison'
              },
              min: 0,
              hooks: {
                beforeValidate: [
                  ({ value }) => {
                    if (value === '' || Number.isNaN(value) || value === null) return undefined
                    return value
                  }
                ]
              },
              admin: {
                description: {
                  en: 'Use normal checkout-currency units: 500 means ₽500 for the no-Stripe RUB shop; 5 means €5 for a Stripe EUR shop.',
                  ru: 'В единицах валюты заказа: например, 500 для RUB или 5 для EUR.',
                  de: 'In Standard-Währungseinheiten: z. B. 500 für ₽500 oder 5 für €5.',
                  fr: 'En unités de devise standard: par exemple 500 pour ₽500 ou 5 pour €5.'
                },
                step: 0.01
              }
            },
            {
              name: 'isDefault',
              type: 'checkbox',
              label: {
                en: 'Default Method',
                ru: 'Способ по умолчанию',
                de: 'Standardmethode',
                fr: 'Mode par défaut'
              },
              defaultValue: false,
              admin: {
                description: {
                  en: 'Set this to true if this should be the pre-selected method in checkout.',
                  ru: 'Отметьте, если этот способ должен быть выбран по умолчанию при оформлении.',
                  de: 'Aktivieren, wenn diese Methode an der Kasse vorausgewählt sein soll.',
                  fr: 'Cochez si cette méthode doit être présélectionnée lors du paiement.'
                }
              }
            }
          ]
        },
        {
          name: 'description',
          type: 'text',
          label: {
            en: 'Description (optional)',
            ru: 'Описание (необязательно)',
            de: 'Beschreibung (optional)',
            fr: 'Description (optionnel)'
          },
          admin: {
            description: {
              en: 'A short explanation or estimated delivery time (e.g., "2-4 working days").',
              ru: 'Краткое пояснение или срок доставки (например, "2-4 рабочих дня").',
              de: 'Kurze Erklärung oder Lieferzeit (z. B. „2-4 Werktage“).',
              fr: 'Courte explication ou délai estimé (ex. "2-4 jours ouvrés").'
            }
          }
        }
      ]
    }
  ]
}
