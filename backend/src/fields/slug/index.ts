import type { TextField } from 'payload'
import { formatSlug } from './formatSlug'

type SlugFieldConfig = {
  fieldToUse?: string
  overrides?: Partial<TextField>
}

export const slugField = ({
  fieldToUse = 'title',
  overrides = {}
}: SlugFieldConfig = {}): TextField => {
  return {
    name: 'slug',
    type: 'text',
    index: true,
    required: true,
    unique: true,
    admin: {
      position: 'sidebar' as const,
      components: {
        Field: {
          path: '@/fields/slug/SlugComponent',
          clientProps: {
            fieldToUse
          }
        }
      },
      ...overrides.admin
    },
    hooks: {
      beforeValidate: [formatSlug(fieldToUse)]
    },
    ...overrides
  } as TextField
}
