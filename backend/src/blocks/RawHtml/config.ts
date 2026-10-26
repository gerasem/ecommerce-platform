import type { Block } from 'payload'

export const RawHtmlBlock: Block = {
  slug: 'rawHtml',
  interfaceName: 'RawHtmlBlock',
  labels: {
    singular: {
      en: 'Raw HTML / iframe',
      ru: 'HTML-код / iframe',
      de: 'HTML / iframe',
      fr: 'HTML brut / iframe'
    },
    plural: {
      en: 'Raw HTML / iframe',
      ru: 'HTML-код / iframe',
      de: 'HTML / iframe',
      fr: 'HTML brut / iframe'
    }
  },
  fields: [
    {
      name: 'html',
      type: 'code',
      label: {
        en: 'HTML / JS / iframe Code',
        ru: 'Код HTML / JS / iframe',
        de: 'HTML / JS / iframe Code',
        fr: 'Code HTML / JS / iframe'
      },
      required: true,
      admin: {
        language: 'html',
        description: {
          en: '⚠️ WARNING: This code is rendered without sanitization. Inserting scripts from untrusted sources is unsafe.',
          ru: '⚠️ ВНИМАНИЕ: Этот код выводится на сайте без очистки. Вставлять скрипты из непроверенных источников небезопасно.',
          de: '⚠️ WARNUNG: Dieser Code wird ohne Bereinigung gerendert. Das Einfügen von Skripten aus nicht vertrauenswürdigen Quellen ist unsicher.',
          fr: '⚠️ ATTENTION: Ce code est affiché sans nettoyage. Insérer des scripts provenant de sources non fiables est dangereux.'
        }
      }
    }
  ]
}
