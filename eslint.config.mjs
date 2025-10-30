// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/.yarn/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/.output/**',
      'eslint.config.mjs',
      'stylelint.config.js',
    ],
  },

  {
    rules: {
      'sort-imports': [
        'warn',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['interface', 'typeAlias'],
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: false },
        },
      ],
      'vue/match-component-file-name': ['error', { extensions: ['vue'], shouldMatchCase: true }],
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        { registeredComponentsOnly: true, ignores: [] },
      ],
      'vue/no-v-html': 'error',
      'vue/enforce-style-attribute': ['error', { allow: ['scoped', 'module'] }],
    },
  },
)
