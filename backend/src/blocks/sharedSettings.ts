import type { Field } from 'payload'

export const blockSettingsFields: Field[] = [
  {
    name: 'width',
    type: 'select',
    label: {
      en: 'Width',
      ru: 'Ширина блока',
      de: 'Blockbreite',
      fr: 'Largeur du bloc'
    },
    defaultValue: '1/1',
    options: [
      {
        label: {
          en: 'Full Width (1/1)',
          ru: 'Полная ширина (1/1)',
          de: 'Volle Breite (1/1)',
          fr: 'Pleine largeur (1/1)'
        },
        value: '1/1'
      },
      {
        label: {
          en: 'Half (1/2)',
          ru: 'Половина (1/2)',
          de: 'Halbe Breite (1/2)',
          fr: 'Moitié (1/2)'
        },
        value: '1/2'
      },
      {
        label: {
          en: 'One Third (1/3)',
          ru: 'Одна треть (1/3)',
          de: 'Ein Drittel (1/3)',
          fr: 'Un tiers (1/3)'
        },
        value: '1/3'
      },
      {
        label: {
          en: 'Two Thirds (2/3)',
          ru: 'Две трети (2/3)',
          de: 'Zwei Drittel (2/3)',
          fr: 'Deux tiers (2/3)'
        },
        value: '2/3'
      }
    ]
  },
  {
    name: 'customClass',
    type: 'text',
    label: {
      en: 'Custom CSS Class',
      ru: 'Пользовательский CSS-класс',
      de: 'Benutzerdefinierte CSS-Klasse',
      fr: 'Classe CSS personnalisée'
    },
    admin: {
      description: {
        en: 'Add CSS classes (e.g. "bg-gray-100 p-4 rounded-xl")',
        ru: 'CSS-классы (например, "bg-gray-100 p-4 rounded-xl")',
        de: 'CSS-Klassen hinzufügen (z. B. "bg-gray-100 p-4 rounded-xl")',
        fr: 'Ajouter des classes CSS (ex. "bg-gray-100 p-4 rounded-xl")'
      }
    }
  }
]
