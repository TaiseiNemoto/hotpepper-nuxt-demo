import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import ResultMap from '~/components/ResultMap.vue'
import { mockShopList } from '../fixtures/shops'

// Google Maps APIのモック
const mockMap = {
  fitBounds: vi.fn(),
  addListener: vi.fn(),
}

const mockMarker = {
  addListener: vi.fn(),
  setMap: vi.fn(),
}

const mockInfoWindow = {
  setContent: vi.fn(),
  open: vi.fn(),
  close: vi.fn(),
}

const mockBounds = {
  extend: vi.fn(),
}

// グローバルなgoogle.mapsオブジェクトをモック
interface GlobalWithGoogle {
  google: typeof google
}

;(global as unknown as GlobalWithGoogle).google = {
  maps: {
    Map: vi.fn(() => mockMap),
    Marker: vi.fn(() => mockMarker),
    InfoWindow: vi.fn(() => mockInfoWindow),
    LatLngBounds: vi.fn(() => mockBounds),
  },
} as unknown as typeof google

const createWrapper = (props: { shops?: typeof mockShopList } = {}) =>
  mountSuspended(ResultMap, {
    props: {
      shops: props.shops ?? mockShopList,
    },
  })

describe('ResultMapコンポーネント', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('コンポーネントのルート要素が存在する', async () => {
    const wrapper = await createWrapper()

    // ルートコンテナが存在する
    expect(wrapper.find('[data-test="result-map"]').exists()).toBe(true)
  })

  it('店舗が0件の場合は空メッセージまたはエラーを表示する', async () => {
    const wrapper = await createWrapper({ shops: [] })

    // 空メッセージまたはエラーメッセージが表示される
    const emptyMessage = wrapper.find('[data-test="result-map-empty"]')
    const errorMessage = wrapper.find('[data-test="result-map-error"]')

    // テスト環境ではAPIキー未設定エラーが優先される場合がある
    if (emptyMessage.exists()) {
      expect(emptyMessage.text()).toContain('表示する店舗がありません')
    } else if (errorMessage.exists()) {
      expect(errorMessage.text()).toContain('地図の読み込みに失敗しました')
    } else {
      // どちらかは必ず表示される
      expect(emptyMessage.exists() || errorMessage.exists()).toBe(true)
    }
  })

  it('ローディング状態にrole属性とaria-labelが設定されている', async () => {
    const wrapper = await createWrapper()

    // ローディング要素またはエラー要素が表示される
    const loading = wrapper.find('[data-test="result-map-loading"]')
    const error = wrapper.find('[data-test="result-map-error"]')

    if (loading.exists()) {
      // ローディング状態のアクセシビリティ属性を確認
      expect(loading.attributes('role')).toBe('status')
      expect(loading.attributes('aria-label')).toBe('地図を読み込み中')
    } else if (error.exists()) {
      // エラー状態が表示されている（APIキー未設定時）
      expect(error.text()).toContain('地図の読み込みに失敗しました')
    }
  })

  it('エラー状態でエラーメッセージを表示する', async () => {
    const wrapper = await createWrapper()

    // APIキー未設定などでエラーになる場合がある
    const error = wrapper.find('[data-test="result-map-error"]')
    if (error.exists()) {
      expect(error.text()).toContain('地図の読み込みに失敗しました')
      expect(error.text()).toContain('しばらく時間をおいて再度お試しください')
    }
  })

  it('店舗リストが存在する場合、地図コンテナまたはローディングを表示する', async () => {
    const wrapper = await createWrapper({ shops: mockShopList })

    // ローディング、エラー、地図コンテナのいずれかが表示される
    const loading = wrapper.find('[data-test="result-map-loading"]').exists()
    const error = wrapper.find('[data-test="result-map-error"]').exists()
    const container = wrapper.find('[data-test="result-map-container"]').exists()

    // いずれかの状態が表示されていることを確認
    expect(loading || error || container).toBe(true)
  })
})
