import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor
} from '@payloadcms/richtext-lexical'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    {
      name: 'form',
      type: 'relationship',
      label: { en: 'Form', ru: 'Форма', de: 'Formular', fr: 'Formulaire' },
      relationTo: 'forms',
      required: true
    },
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: {
        en: 'Enable Intro Content',
        ru: 'Включить вводный текст',
        de: 'Einleitungstext aktivieren',
        fr: "Activer le texte d'introduction"
      }
    },
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro)
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature()
          ]
        }
      }),
      label: {
        en: 'Intro Content',
        ru: 'Вводный текст',
        de: 'Einleitungstext',
        fr: "Texte d'introduction"
      }
    }
  ],
  graphQL: {
    singularName: 'FormBlock'
  },
  labels: {
    singular: { en: 'Form Block', ru: 'Блок формы', de: 'Formular-Block', fr: 'Bloc formulaire' },
    plural: { en: 'Form Blocks', ru: 'Блоки форм', de: 'Formular-Blöcke', fr: 'Blocs formulaires' }
  }
}
