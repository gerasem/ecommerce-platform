'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from '@payloadcms/ui'
import { getTranslation } from '@payloadcms/translations'

const translations = {
  successToast: {
    en: 'Frontend deployment started successfully!',
    ru: 'Деплой фронтенда успешно запущен!',
    de: 'Frontend-Deployment erfolgreich gestartet!',
    fr: 'Déploiement du frontend démarré avec succès !'
  },
  errorToast: {
    en: 'Failed to trigger deployment. Please check your configuration.',
    ru: 'Ошибка запуска деплоя. Проверьте конфигурацию.',
    de: 'Fehler beim Starten des Deployments. Bitte überprüfen Sie Ihre Konfiguration.',
    fr: 'Échec du déclenchement du déploiement. Veuillez vérifier votre configuration.'
  },
  deployingBtn: {
    en: 'Deploying...',
    ru: 'Деплой...',
    de: 'Wird bereitgestellt...',
    fr: 'Déploiement...'
  },
  deployBtn: {
    en: 'Deploy Frontend',
    ru: 'Деплой фронтенда',
    de: 'Frontend bereitstellen',
    fr: 'Déployer le frontend'
  }
}

export const DeployButton: React.FC = () => {
  const { i18n } = useTranslation()
  const [isDeploying, setIsDeploying] = useState(false)

  const handleDeploy = async () => {
    setIsDeploying(true)

    try {
      const res = await fetch('/api/custom/deploy-frontend', {
        method: 'POST'
      })

      if (!res.ok) {
        throw new Error('Deployment request failed')
      }

      toast.success(getTranslation(translations.successToast, i18n))
    } catch (error) {
      console.error(error)
      toast.error(getTranslation(translations.errorToast, i18n))
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <button
      onClick={handleDeploy}
      disabled={isDeploying}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'var(--theme-elevation-150)',
        color: 'var(--theme-elevation-800)',
        boxShadow: 'none',
        border: 'none',
        padding: '0.2rem 0.75rem',
        borderRadius: '4px',
        cursor: isDeploying ? 'not-allowed' : 'pointer',
        fontSize: '13px',
        transition: 'all 0.2s',
        opacity: isDeploying ? 0.7 : 1
      }}
      className="btn btn--style-secondary btn--size-medium payload-deploy-button"
    >
      {isDeploying
        ? getTranslation(translations.deployingBtn, i18n)
        : getTranslation(translations.deployBtn, i18n)}
    </button>
  )
}
