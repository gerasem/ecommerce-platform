// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

export default withNuxt(
  {
    name: 'project/ignores',
    ignores: ['app/generated/**', '.nuxt/**', '.output/**']
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  },
  eslintConfigPrettier
)
