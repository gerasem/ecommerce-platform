import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
  UploadFeature,
  AlignFeature,
  BlockquoteFeature,
  HTMLConverterFeature,
  BlocksFeature
} from '@payloadcms/richtext-lexical'

import { TwoColumnTextBlock } from '../TwoColumnText'

import { blockSettingsFields } from '../sharedSettings'

export const ContentBlock: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Content', ru: 'Контент', de: 'Inhalt', fr: 'Contenu' },
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
                    HTMLConverterFeature({}),
                    BlocksFeature({ blocks: [TwoColumnTextBlock] })
                  ]
                }
              }),
              label: {
                en: 'Rich Text Content',
                ru: 'Текстовый контент',
                de: 'Formatierter Text',
                fr: 'Texte enrichi'
              },
              localized: true
            }
          ]
        },
        {
          label: {
            en: 'Block Layout',
            ru: 'Настройки блока',
            de: 'Block-Layout',
            fr: 'Mise en page du bloc'
          },
          fields: blockSettingsFields
        }
      ]
    }
  ]
}
