import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrSelf } from '@/access/adminOrSelf'
import { checkRole } from '@/access/utilities'

import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin'

const sendWelcomeEmail: any = async ({ doc, operation, req }: any) => {
  if (operation === 'create' && doc.email) {
    try {
      await req.payload.sendEmail({
        to: doc.email,
        subject: 'Welcome to our shop!',
        html: `<h1>Welcome!</h1><p>Thank you for registering an account with us.</p>`
      })
    } catch (err: unknown) {
      req.payload.logger.error({ err, msg: 'Error sending welcome email' })
    }
  }
  return doc
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { en: 'User', ru: 'Пользователь', de: 'Benutzer', fr: 'Utilisateur' },
    plural: { en: 'Users', ru: 'Пользователи', de: 'Benutzer', fr: 'Utilisateurs' }
  },
  access: {
    admin: ({ req: { user } }) => checkRole(['admin'], user),
    create: adminOnly,
    delete: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf
  },
  admin: {
    group: { en: 'Settings', ru: 'Настройки', de: 'Einstellungen', fr: 'Paramètres' },
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name'
  },
  hooks: {
    afterChange: [sendWelcomeEmail]
  },
  auth: {
    tokenExpiration: 1209600,
    useAPIKey: true,
    cookies: {
      secure:
        process.env.PAYLOAD_PUBLIC_SERVER_URL?.startsWith('https') ||
        process.env.NEXT_PUBLIC_SERVER_URL?.startsWith('https') ||
        false,
      sameSite: 'Lax'
    },
    // Brute-force protection: lock account after 5 failed login attempts for 10 minutes
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 minutes in ms
    // Temporarily disabled since no email provider is configured
    verify: false
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: { en: 'Name', ru: 'Имя', de: 'Name', fr: 'Nom' },
      required: false // Changed to false to fix migration error
    },
    {
      name: 'roles',
      type: 'select',
      label: { en: 'Roles', ru: 'Роли', de: 'Rollen', fr: 'Rôles' },
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess
      },
      defaultValue: ['customer'],
      hasMany: true,
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin]
      },
      options: [
        {
          label: {
            en: 'Admin',
            ru: 'Администратор',
            de: 'Administrator',
            fr: 'Administrateur'
          },
          value: 'admin'
        },
        {
          label: { en: 'Customer', ru: 'Покупатель', de: 'Kunde', fr: 'Client' },
          value: 'customer'
        }
      ]
    },
    {
      name: 'orders',
      type: 'join',
      label: { en: 'Orders', ru: 'Заказы', de: 'Bestellungen', fr: 'Commandes' },
      collection: 'orders',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items']
      }
    },
    {
      name: 'cart',
      type: 'join',
      label: { en: 'Cart', ru: 'Корзина', de: 'Warenkorb', fr: 'Panier' },
      collection: 'carts',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items']
      }
    },
    {
      name: 'addresses',
      type: 'join',
      label: { en: 'Addresses', ru: 'Адреса', de: 'Adressen', fr: 'Adresses' },
      collection: 'addresses',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id']
      }
    }
  ]
}
