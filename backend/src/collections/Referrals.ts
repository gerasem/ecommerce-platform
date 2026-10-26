import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'
import { featureEnabled } from '@/access/featureEnabled'
import { features } from '@/lib/features'

export const Referrals: CollectionConfig = {
  slug: 'referrals',
  labels: {
    singular: { en: 'Referral', ru: 'Реферал', de: 'Empfehlung', fr: 'Parrainage' },
    plural: { en: 'Referrals', ru: 'Рефералы', de: 'Empfehlungen', fr: 'Parrainages' }
  },
  admin: {
    group: { en: 'eCommerce', ru: 'Коммерция', de: 'E-Commerce', fr: 'E-commerce' },
    hidden: !features.referrals,
    useAsTitle: 'name'
  },
  access: {
    read: featureEnabled('referrals', () => true),
    create: featureEnabled('referrals', adminOnly),
    update: featureEnabled('referrals', adminOnly),
    delete: featureEnabled('referrals', adminOnly)
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: { en: 'Name / Code', ru: 'Название / Код', de: 'Name / Code', fr: 'Nom / Code' },
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'The referral identifier (e.g. partner name or code).',
          ru: 'Идентификатор реферала (например, имя партнера или код).',
          de: 'Die Empfehlungskennung (z. B. Partnername oder Code).',
          fr: 'Identifiant de parrainage (ex. nom du partenaire ou code).'
        }
      }
    }
  ]
}
