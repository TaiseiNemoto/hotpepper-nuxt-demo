import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * MSW サーバー設定
 * Node環境（テスト環境）で動作するモックサーバーをセットアップ
 */
export const server = setupServer(...handlers)
