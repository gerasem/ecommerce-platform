'use client'

import React, { useCallback } from 'react'
import { useField, useFormFields, TextInput, Button, useTranslation } from '@payloadcms/ui'
import { getTranslation } from '@payloadcms/translations'
import slugify from 'slugify'

const translations = {
  slugLabel: {
    en: 'Slug',
    ru: 'Ярлык (Slug)',
    de: 'Slug',
    fr: 'Slug'
  },
  generateBtn: {
    en: 'Generate',
    ru: 'Сгенерировать',
    de: 'Generieren',
    fr: 'Générer'
  }
}

const getDescription = (fieldToUse: string, lang: string) => {
  switch (lang) {
    case 'ru':
      return `Slug будет автоматически сформирован из поля "${fieldToUse}" или вы можете ввести его вручную.`
    case 'de':
      return `Slug wird automatisch aus "${fieldToUse}" generiert oder kann manuell eingegeben werden.`
    case 'fr':
      return `Le slug sera généré automatiquement à partir de "${fieldToUse}" ou vous pouvez le saisir manuellement.`
    default:
      return `Slug will be auto-generated from ${fieldToUse} or you can manually type it.`
  }
}

const SlugComponent: React.FC<{
  path?: string
  fieldToUse?: string
}> = ({ path, fieldToUse = 'title' }) => {
  const safePath = path || 'slug'
  const { i18n } = useTranslation()

  const { value, setValue } = useField<string>({ path: safePath })

  const targetFieldValue = useFormFields(([fields]) => {
    return fields[fieldToUse]?.value as string | undefined
  })

  const formatSlug = useCallback((val: string) => {
    return slugify(val, { lower: true, strict: true })
  }, [])

  const handleGenerate = useCallback(() => {
    if (targetFieldValue) {
      setValue(formatSlug(targetFieldValue))
    }
  }, [targetFieldValue, setValue, formatSlug])

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <TextInput
            path={safePath}
            label={getTranslation(translations.slugLabel, i18n)}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValue(formatSlug(e.target.value))
            }
          />
        </div>
        <Button onClick={handleGenerate} size="large" buttonStyle="secondary">
          {getTranslation(translations.generateBtn, i18n)}
        </Button>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--theme-elevation-400)', marginTop: '0.25rem' }}>
        {getDescription(fieldToUse, i18n?.language || 'en')}
      </div>
    </div>
  )
}

export default SlugComponent
