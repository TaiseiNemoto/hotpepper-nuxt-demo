## 基本方針
- **`@nuxt/eslint` モジュール**を採用し、Nuxt公式推奨ルールを自動適用
- **スタイル整形は Prettier に一元化**
- **pre-commit で lint + format 自動実行**
- **設定はデフォルト寄せ・最小構成**

---
## 構成要素
|区分|使用ライブラリ|目的|
|---|---|---|
|ESLint|@nuxt/eslint|Nuxt公式モジュールでESLint設定を統合管理|
|Prettier|prettier, prettier-plugin-tailwindcss|コード整形・Tailwind並び順最適化|
|Husky|husky|pre-commit フック管理|
|lint-staged|lint-staged|変更ファイルのみ lint / format 実行|

