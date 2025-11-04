import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    // Nuxt環境で実行するテストの設定
    environment: 'nuxt',
    // グローバルAPIを使用可能にする（describe, it, expectなど）
    globals: true,
    // テストファイルのパターン
    include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    // 除外するパス
    exclude: ['**/node_modules/**', '**/.nuxt/**', '**/.output/**', '**/dist/**'],
    // カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        '.nuxt/**',
        '.output/**',
        'tests/**',
        '**/*.config.{js,ts,mjs}',
        '**/types/**',
      ],
    },
    // Nuxt環境のオプション
    environmentOptions: {
      nuxt: {
        // DOM環境として happy-dom を使用（jsdomより高速）
        domEnvironment: 'happy-dom',
        // モック設定
        mock: {
          intersectionObserver: true,
          indexedDb: true,
        },
      },
    },
  },
})
