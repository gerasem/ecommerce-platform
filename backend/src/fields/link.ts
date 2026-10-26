import type { Field } from 'payload'

import { deepMerge } from '@/utilities/deepMerge'

export type LinkAppearances = 'default' | 'outline'

export const appearanceOptions: Record<
  LinkAppearances,
  { label: { en: string; ru: string; de: string; fr: string } | string; value: string }
> = {
  default: {
    label: { en: 'Default', ru: 'По умолчанию', de: 'Standard', fr: 'Par défaut' },
    value: 'default'
  },
  outline: {
    label: { en: 'Outline', ru: 'Контурная', de: 'Umrandet', fr: 'Contour' },
    value: 'outline'
  }
}

type LinkType = (options?: {
  appearances?: LinkAppearances[] | false
  disableLabel?: boolean
  disableRequired?: boolean
  overrides?: Record<string, unknown>
}) => Field

export const link: LinkType = ({
  appearances,
  disableLabel = false,
  disableRequired = false,
  overrides = {}
} = {}) => {
  const linkResult: Field = {
    name: 'link',
    type: 'group',
    admin: {
      hideGutter: true
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            type: 'radio',
            admin: {
              layout: 'horizontal',
              width: '50%'
            },
            defaultValue: 'reference',
            options: [
              {
                label: {
                  en: 'Internal link',
                  ru: 'Внутренняя ссылка',
                  de: 'Interner Link',
                  fr: 'Lien interne'
                },
                value: 'reference'
              },
              {
                label: {
                  en: 'Custom URL',
                  ru: 'Внешний URL',
                  de: 'Benutzerdefinierte URL',
                  fr: 'URL personnalisée'
                },
                value: 'custom'
              }
            ]
          },
          {
            name: 'newTab',
            type: 'checkbox',
            admin: {
              style: {
                alignSelf: 'flex-end'
              },
              width: '50%'
            },
            label: {
              en: 'Open in new tab',
              ru: 'Открывать в новой вкладке',
              de: 'In neuem Tab öffnen',
              fr: 'Ouvrir dans un nouvel onglet'
            }
          }
        ]
      }
    ]
  }

  const linkTypes: Field[] = [
    {
      name: 'reference',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference'
      },
      label: {
        en: 'Document to link to',
        ru: 'Страница для ссылки',
        de: 'Zielseite des Links',
        fr: 'Document cible'
      },
      maxDepth: 1,
      relationTo: ['pages'],
      required: disableRequired ? false : true
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom'
      },
      label: {
        en: 'Custom URL',
        ru: 'Внешний URL',
        de: 'Benutzerdefinierte URL',
        fr: 'URL personnalisée'
      },
      required: disableRequired ? false : true
    }
  ]

  if (!disableLabel) {
    linkTypes.map(linkType => ({
      ...linkType,
      admin: {
        ...linkType.admin,
        width: '50%'
      }
    }))

    linkResult.fields.push({
      type: 'row',
      fields: [
        ...linkTypes,
        {
          name: 'label',
          type: 'text',
          admin: {
            width: '50%'
          },
          label: {
            en: 'Label',
            ru: 'Текст ссылки',
            de: 'Beschriftung',
            fr: 'Texte du lien'
          },
          required: false
        }
      ]
    })
  } else {
    linkResult.fields = [...linkResult.fields, ...linkTypes]
  }

  if (appearances !== false) {
    let appearanceOptionsToUse = [appearanceOptions.default, appearanceOptions.outline]

    if (appearances) {
      appearanceOptionsToUse = appearances.map(appearance => appearanceOptions[appearance])
    }

    linkResult.fields.push({
      name: 'appearance',
      type: 'select',
      label: {
        en: 'Appearance',
        ru: 'Внешний вид',
        de: 'Erscheinungsbild',
        fr: 'Apparence'
      },
      admin: {
        description: {
          en: 'Choose how the link should be rendered.',
          ru: 'Выберите стиль отображения кнопки/ссылки.',
          de: 'Wählen Sie das Erscheinungsbild des Links.',
          fr: 'Choisissez le style du lien.'
        }
      },
      defaultValue: 'default',
      options: appearanceOptionsToUse
    })
  }

  return deepMerge(linkResult, overrides)
}
