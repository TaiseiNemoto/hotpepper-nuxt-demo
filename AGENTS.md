# Repository Guidelines

## プロジェクト構成とモジュール配置

メインの Nuxt アプリケーションは `app/` に置かれ、ページ、レイアウト、コンポーネントが目的別に整理されています。UI 用の共通スタイルや Tailwind 設定は `app/assets/` と `app/styles/` にまとめ、フォームや地図部品は `app/components/` 配下で再利用可能に保っています。HotPepper Gourmet API に接続する Nitro エンドポイントは `server/api/`、ロジック切り出しは `server/utils/` を利用してください。環境設定や企画資料は `docs/`、静的アセットは `public/`、エンドツーエンドを除くテスト一式は `tests/` に配置します。

## ビルド・テスト・開発コマンド

ローカル開発は `yarn dev` で開始し、http://localhost:3000 で SSR/CSR を確認します。CI 相当のビルド検証には `yarn build` と `yarn preview` を連続実行してください。静的サイト検証が必要な場合のみ `yarn generate` を使います。型検証は `yarn type-check`、ESLint と Stylelint はそれぞれ `yarn lint` と `yarn lint:css`（修正時は `:fix` 系）を使います。整形は `yarn format`、ユニットテストとコンポーネントテストは `yarn test`、UI 実行は `yarn test:ui`、カバレッジは `yarn test:coverage` が基準です。

## コーディングスタイルと命名規約

TypeScript は strict 設定で未使用変数を禁止します。Prettier 設定に従いセミコロンなし・シングルクオート・100 文字幅を維持してください。Vue コンポーネントは PascalCase で命名し、ファイル名と一致させます。import は ESLint の `sort-imports` 警告に合わせてグループ化し、CSS/SCSS は Stylelint の規約を守りつつ `:deep` 等の擬似クラスは必要最小限とします。インターフェース名の `I` 接頭辞は禁止です。

## テスト方針

テストは Vitest + @vue/test-utils を標準とし、`tests/unit` と `tests/components` にシナリオを配置してください。モック API には MSW を利用し、ネットワーク呼び出しを再現します。UI とサーバーハンドラ双方で境界条件をカバーし、主要コンポーネントで 80% 以上の statement カバレッジ維持を目標とします。テストファイル名は `<対象>.spec.ts` を推奨し、実行前に `yarn type-check` で型崩れを防ぎます。

## コミットとプルリクエスト

コミットメッセージは `feat:`, `fix:`, `chore:` などの Conventional Commits を日本語本文で統一し、必要に応じてチケット番号を後段に付記します。プルリクエストでは概要、テスト結果（実行コマンドやスクリーンショット）、関連 Issue のリンクを記載し、UI 変更時は主要画面のキャプチャを添付してください。レビュワーが確認しやすいよう、差分は機能単位で粒度を揃え、ドラフト状態で早期共有する運用を推奨します。

## セキュリティと設定ヒント

`.env` を `.env.example` から複製し、`NUXT_HOTPEPPER_API_KEY` と `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` を必ず設定してください。API キーはローカル環境でのみ保持し、リポジトリへコミットしないでください。`NUXT_LOG_LEVEL` や `NUXT_LOG_ENABLE_ACCESS` で Nitro のログ量を調整し、ステージングではアクセスログを残す構成を推奨します。Google Maps キーは Referer 制限を有効にし、開発用途と本番用途を分離してください。

## エージェント運用ルール

作業完了前に yarn type-check・yarn lint・yarn lint:css・yarn format --check など必要な型チェック／Lint／フォーマット検証を実行し、エラーは恒久対応で解消してください。コミットは指示があるまで実施せず、レビュー前の状態ではローカル変更のままキープします。
