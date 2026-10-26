'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from '@payloadcms/ui'
import { getTranslation } from '@payloadcms/translations'

const translations = {
  startingToast: {
    en: 'Starting database backup download...',
    ru: 'Начинается скачивание бэкапа базы данных...',
    de: 'Datenbank-Backup-Download wird gestartet...',
    fr: 'Démarrage du téléchargement de la sauvegarde de la base de données...'
  },
  startingBtn: {
    en: 'Starting Backup...',
    ru: 'Создание бэкапа...',
    de: 'Backup wird gestartet...',
    fr: 'Sauvegarde en cours...'
  },
  backupBtn: {
    en: 'Backup Database',
    ru: 'Бэкап БД',
    de: 'Datenbank sichern',
    fr: 'Sauvegarder la base'
  }
}

export const BackupButton: React.FC = () => {
  const { i18n } = useTranslation()
  const [isBackingUp, setIsBackingUp] = useState(false)

  const handleBackup = () => {
    setIsBackingUp(true)
    toast.info(getTranslation(translations.startingToast, i18n))

    // A simple window.location redirection to a download endpoint
    // will trigger the browser's download manager without navigating away from the page.
    window.location.href = '/api/backup'

    // Reset button state after a short delay
    setTimeout(() => {
      setIsBackingUp(false)
    }, 2000)
  }

  return (
    <button
      onClick={handleBackup}
      disabled={isBackingUp}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#e4e4e4',
        color: 'var(--theme-elevation-800)',
        boxShadow: 'none',
        border: 'none',
        padding: '0.2rem 0.75rem',
        borderRadius: '4px',
        cursor: isBackingUp ? 'not-allowed' : 'pointer',
        fontSize: '13px',
        transition: 'all 0.2s',
        opacity: isBackingUp ? 0.7 : 1
      }}
      className="btn btn--style-secondary btn--size-medium payload-backup-button"
    >
      {isBackingUp
        ? getTranslation(translations.startingBtn, i18n)
        : getTranslation(translations.backupBtn, i18n)}
    </button>
  )
}
