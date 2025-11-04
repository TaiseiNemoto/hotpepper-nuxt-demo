// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    hotpepperApiKey: '',
    logLevel: 'info',
    logEnableAccess: 'true',
    public: {
      googleMapsApiKey: '',
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        noUncheckedSideEffectImports: true,
      },
    },
  },

  modules: ['@nuxt/eslint', '@nuxt/test-utils/module'],
})
