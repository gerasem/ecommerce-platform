'use client'

import React, { useState } from 'react'
import { Button, useTranslation } from '@payloadcms/ui'
import { getTranslation } from '@payloadcms/translations'
import { useRouter } from 'next/navigation'

const translations = {
  updating: {
    en: 'Updating...',
    ru: 'Обновление...',
    de: 'Wird aktualisiert...',
    fr: 'Mise à jour...'
  },
  updateBtn: {
    en: 'Update current rate (CBRF)',
    ru: 'Обновить актуальный курс (ЦБ РФ)',
    de: 'Aktuellen Kurs aktualisieren (CBRF)',
    fr: 'Mettre à jour le taux (CBRF)'
  }
}

export default function ExchangeRateUpdater() {
  const { i18n } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleUpdate = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/exchange-rate/update', {
        method: 'POST'
      })
      const data = await res.json()
      if (res.ok) {
        const lang = i18n?.language || 'en'
        const successPrefix =
          lang === 'ru'
            ? 'Успешно! Курс обновлен:'
            : lang === 'de'
              ? 'Erfolg! Kurs aktualisiert auf:'
              : lang === 'fr'
                ? 'Succès ! Taux mis à jour à :'
                : 'Success! Rate updated to:'
        setMessage(`${successPrefix} ${data.rate}`)
        // Force refresh to show the new logs and rate
        router.refresh()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <Button onClick={handleUpdate} disabled={loading}>
        {loading
          ? getTranslation(translations.updating, i18n)
          : getTranslation(translations.updateBtn, i18n)}
      </Button>
      {message && <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{message}</div>}
    </div>
  )
}
