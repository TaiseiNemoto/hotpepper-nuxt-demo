// Nuxt Runtime Config type extensions
declare module 'nuxt/schema' {
  interface RuntimeConfig {
    hotpepperApiKey: string
    logLevel: string
    logEnableAccess: string
  }

  interface PublicRuntimeConfig {
    googleMapsApiKey: string
  }
}

export {}
