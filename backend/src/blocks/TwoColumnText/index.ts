import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
  UploadFeature,
  AlignFeature,
  BlockquoteFeature,
  HTMLConverterFeature
} from '@payloadcms/richtext-lexical'

export const TwoColumnTextBlock: Block = {
  slug: 'twoColumnText',
  interfaceName: 'TwoColumnTextBlock',
  fields: [
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            UploadFeature({
              collections: {
                media: {
                  fields: [
                    {
                      name: 'caption',
                      type: 'text'
                    }
                  ]
                }
              }
            }),
            AlignFeature(),
            BlockquoteFeature(),
            HTMLConverterFeature({})
          ]
        }
      }),
      label: {
        en: '2-Column Text',
        ru: 'Текст в 2 колонки',
        de: '2-Spalten-Text',
        fr: 'Texte en 2 colonnes'
      },
      localized: true
    }
  ]
}
