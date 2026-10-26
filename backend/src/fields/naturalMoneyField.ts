import type { Field, NumberField } from 'payload'

const useNaturalMoneyInput = (field: NumberField): NumberField => {
  // Payload Ecommerce's PriceInput converts values to minor units. Removing its
  // custom Field and Cell components keeps the stored value in normal units.
  const { components: _minorUnitComponents, ...admin } = field.admin || {}

  return {
    ...field,
    admin: {
      ...admin,
      step: 0.01
    }
  }
}

export const configureNaturalMoneyFields = (
  fields: Field[],
  fieldNames: readonly string[]
): Field[] => {
  const names = new Set(fieldNames)

  return fields.map(field => {
    if (field.type === 'number' && names.has(field.name)) {
      return useNaturalMoneyInput(field)
    }

    if ('fields' in field) {
      return {
        ...field,
        fields: configureNaturalMoneyFields(field.fields, fieldNames)
      }
    }

    if ('tabs' in field) {
      return {
        ...field,
        tabs: field.tabs.map(tab => ({
          ...tab,
          fields: configureNaturalMoneyFields(tab.fields, fieldNames)
        }))
      }
    }

    return field
  })
}
