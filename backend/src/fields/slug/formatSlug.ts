import type { FieldHook } from 'payload'
import slugify from 'slugify'

export const formatSlug =
  (fallback: string): FieldHook =>
  ({ value, originalDoc, data }) => {
    if (typeof value === 'string' && value.length > 0) {
      return slugify(value, { lower: true, strict: true })
    }

    // If there is no value, use the fallback field
    const fallbackData = data?.[fallback] || originalDoc?.[fallback]

    if (fallbackData && typeof fallbackData === 'string') {
      return slugify(fallbackData, { lower: true, strict: true })
    }

    return value
  }
