import type { Block } from 'payload'
import { blockSettingsFields } from '../sharedSettings'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Form Settings',
          fields: [
            {
              name: 'form',
              type: 'relationship',
              relationTo: 'forms',
              required: true,
              admin: {
                description: 'Select the form to display.'
              }
            }
          ]
        },
        {
          label: 'Block Layout',
          fields: blockSettingsFields
        }
      ]
    }
  ]
}
