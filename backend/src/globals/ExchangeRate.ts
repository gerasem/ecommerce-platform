import { GlobalConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'
import { features } from '@/lib/features'

export const ExchangeRate: GlobalConfig = {
  slug: 'exchange-rate',
  label: { en: 'Exchange Rate', ru: 'Курс валют', de: 'Wechselkurs', fr: 'Taux de change' },
  admin: {
    group: { en: 'Settings', ru: 'Настройки', de: 'Einstellungen', fr: 'Paramètres' },
    hidden: !features.multiCurrency
  },
  access: {
    read: () => true,
    update: adminOnly
  },
  fields: [
    {
      name: 'updateRateButton',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/ExchangeRateUpdater'
        }
      }
    },
    {
      name: 'rate',
      type: 'number',
      label: { en: '1 EUR to RUB', ru: '1 EUR в RUB', de: '1 EUR in RUB', fr: '1 EUR en RUB' },
      defaultValue: 83,
      required: true,
      admin: {
        description: {
          en: 'Set the current exchange rate. For example, if 1 EUR = 83 RUB, enter 83.',
          ru: 'Установите текущий курс. Например, если 1 EUR = 83 RUB, введите 83.',
          de: 'Geben Sie den aktuellen Wechselkurs an. Wenn beispielsweise 1 EUR = 83 RUB, geben Sie 83 ein.',
          fr: 'Définissez le taux de change. Par exemple, si 1 EUR = 83 RUB, entrez 83.'
        }
      }
    },
    {
      name: 'usdRate',
      type: 'number',
      label: { en: '1 USD to RUB', ru: '1 USD в RUB', de: '1 USD in RUB', fr: '1 USD en RUB' },
      defaultValue: 80,
      required: true,
      admin: {
        description: {
          en: 'Set the current exchange rate. For example, if 1 USD = 80 RUB, enter 80.',
          ru: 'Установите текущий курс. Например, если 1 USD = 80 RUB, введите 80.',
          de: 'Geben Sie den aktuellen Wechselkurs an. Wenn beispielsweise 1 USD = 80 RUB, geben Sie 80 ein.',
          fr: 'Définissez le taux de change. Par exemple, si 1 USD = 80 RUB, entrez 80.'
        }
      }
    },
    {
      name: 'logs',
      type: 'array',
      label: {
        en: 'Update Logs',
        ru: 'Журнал обновлений',
        de: 'Aktualisierungsprotokoll',
        fr: 'Historique des mises à jour'
      },
      admin: {
        readOnly: true,
        description: {
          en: 'History of exchange rate updates.',
          ru: 'История обновлений курса валют.',
          de: 'Verlauf der Wechselkursaktualisierungen.',
          fr: 'Historique des mises à jour des taux de change.'
        },
        components: {
          Field: '@/components/ExchangeRateLogsTable'
        }
      },
      fields: [
        {
          name: 'date',
          type: 'date'
        },
        {
          name: 'rate',
          type: 'number',
          label: 'EUR Rate'
        },
        {
          name: 'usdRate',
          type: 'number',
          label: 'USD Rate'
        },
        {
          name: 'status',
          type: 'text'
        }
      ]
    }
  ]
}
