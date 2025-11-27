import type { Config } from 'tailwindcss'

/**
 * Tailwind CSS設定
 *
 * デスクトップ専用のレスポンシブデザイン（最小幅: 1024px）
 * プライマリカラー: オレンジ系
 *
 * @see https://tailwindcss.com/docs/configuration
 */
export default {
  // スキャン対象のファイルパターン
  // app/配下のVue SFC、TypeScript/JavaScript、server/配下のTypeScript/JavaScriptを含む
  content: [
    './app/app.vue',
    './app/components/**/*.{vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.{vue,ts}',
    './app/composables/**/*.{ts,js}',
    './app/plugins/**/*.{ts,js}',
    './app/utils/**/*.{ts,js}',
    './server/**/*.{ts,js}',
  ],
  theme: {
    extend: {
      // カスタムカラーパレット
      // CSS変数経由で定義（app/assets/css/main.cssで実値を定義）
      colors: {
        primary: 'var(--color-primary)', // プライマリカラー（オレンジ系）
        secondary: 'var(--color-secondary)', // セカンダリカラー（グレー系）
        error: 'var(--color-error)', // エラー表示（レッド系）
        success: 'var(--color-success)', // 成功表示（グリーン系）
        warning: 'var(--color-warning)', // 警告表示（イエロー系）
      },
      // フォントファミリー
      // Google Fonts（Noto Sans JP）をデフォルトフォントとして使用
      fontFamily: {
        sans: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
      },
    },
  },
  // プラグイン（現在は未使用）
  plugins: [],
} satisfies Config
