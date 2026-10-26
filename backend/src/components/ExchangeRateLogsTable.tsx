'use client'

import React from 'react'
import { useTranslation } from '@payloadcms/ui'
import { getTranslation } from '@payloadcms/translations'

const translations = {
  noLogs: {
    en: 'No update logs found.',
    ru: 'Нет логов обновлений.',
    de: 'Keine Aktualisierungsprotokolle gefunden.',
    fr: 'Aucun journal de mise à jour trouvé.'
  },
  heading: {
    en: 'Update History',
    ru: 'История обновлений',
    de: 'Aktualisierungsverlauf',
    fr: 'Historique des mises à jour'
  },
  date: {
    en: 'Date',
    ru: 'Дата',
    de: 'Datum',
    fr: 'Date'
  },
  rateEur: {
    en: 'Rate (EUR)',
    ru: 'Курс (EUR)',
    de: 'Kurs (EUR)',
    fr: 'Taux (EUR)'
  },
  rateUsd: {
    en: 'Rate (USD)',
    ru: 'Курс (USD)',
    de: 'Kurs (USD)',
    fr: 'Taux (USD)'
  },
  status: {
    en: 'Status',
    ru: 'Статус',
    de: 'Status',
    fr: 'Statut'
  }
}

export default function ExchangeRateLogsTable({ data }: { data?: any }) {
  const { i18n } = useTranslation()
  const logs = data?.logs || []

  if (!logs || logs.length === 0) {
    return (
      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        {getTranslation(translations.noLogs, i18n)}
      </div>
    )
  }

  const localeCode =
    i18n?.language === 'ru'
      ? 'ru-RU'
      : i18n?.language === 'de'
        ? 'de-DE'
        : i18n?.language === 'fr'
          ? 'fr-FR'
          : 'en-US'

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <h4 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
        {getTranslation(translations.heading, i18n)}
      </h4>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--theme-elevation-200, #eaeaea)' }}>
              <th
                style={{
                  padding: '0.75rem 1rem 0.75rem 0',
                  color: 'var(--theme-elevation-500, #666)'
                }}
              >
                {getTranslation(translations.date, i18n)}
              </th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--theme-elevation-500, #666)' }}>
                {getTranslation(translations.rateEur, i18n)}
              </th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--theme-elevation-500, #666)' }}>
                {getTranslation(translations.rateUsd, i18n)}
              </th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--theme-elevation-500, #666)' }}>
                {getTranslation(translations.status, i18n)}
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any, index: number) => (
              <tr
                key={index}
                style={{ borderBottom: '1px solid var(--theme-elevation-100, #f5f5f5)' }}
              >
                <td style={{ padding: '0.75rem 1rem 0.75rem 0' }}>
                  {log.date ? new Date(log.date).toLocaleString(localeCode) : '-'}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>{log.rate}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{log.usdRate}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
