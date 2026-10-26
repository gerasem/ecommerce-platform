'use client'
import React, { useEffect, useState } from 'react'
import { useTranslation } from '@payloadcms/ui'
import { getTranslation } from '@payloadcms/translations'

const translations = {
  allRead: {
    en: 'All submissions read',
    ru: 'Все заявки прочитаны',
    de: 'Alle Einsendungen gelesen',
    fr: 'Toutes les soumissions sont lues'
  },
  unreadText: {
    en: 'unread submissions',
    ru: 'непрочитанных заявок',
    de: 'ungelesene Einsendungen',
    fr: 'soumissions non lues'
  }
}

export const UnreadDescription: React.FC = () => {
  const { i18n } = useTranslation()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/form-submissions?where[read][equals]=false&limit=0')
        const data = await response.json()
        setCount(data.totalDocs)
      } catch (error) {
        console.error('Failed to fetch unread submissions count:', error)
      }
    }

    fetchUnreadCount()

    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  if (count === null) return null
  if (count === 0)
    return (
      <div style={{ color: '#666', fontSize: '14px' }}>
        {getTranslation(translations.allRead, i18n)}
      </div>
    )

  return (
    <div
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        backgroundColor: '#ff9800',
        color: 'white',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        marginBottom: '10px'
      }}
    >
      {count} {getTranslation(translations.unreadText, i18n)}
    </div>
  )
}

export default UnreadDescription
