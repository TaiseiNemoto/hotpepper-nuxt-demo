import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'

import ShopMap from '~/components/ShopMap.vue'

const runtimeConfig = vi.hoisted(() => ({
  public: {
    googleMapsApiKey: 'test-api-key',
  },
}))

mockNuxtImport('useRuntimeConfig', () => () => runtimeConfig)

const mockMap = {
  addListener: vi.fn(),
}

const mockMarker = {
  addListener: vi.fn(),
  setMap: vi.fn(),
}

const mockInfoWindow = {
  open: vi.fn(),
  close: vi.fn(),
}

interface GlobalWithGoogle {
  google: typeof google
}

;(global as unknown as GlobalWithGoogle).google = {
  maps: {
    Map: vi.fn(() => mockMap),
    Marker: vi.fn(() => mockMarker),
    InfoWindow: vi.fn(() => mockInfoWindow),
  },
} as unknown as typeof google

const defaultProps = {
  lat: 35.658034,
  lng: 139.701636,
  shopName: 'テスト飲食店',
}

const createWrapper = (props: Partial<typeof defaultProps> = {}) =>
  mountSuspended(ShopMap, {
    props: {
      ...defaultProps,
      ...props,
    },
  })

describe('ShopMapコンポーネント', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    runtimeConfig.public.googleMapsApiKey = 'test-api-key'
  })

  it('ルート要素が描画される', async () => {
    const wrapper = await createWrapper()
    expect(wrapper.find('[data-test="shop-map"]').exists()).toBe(true)
  })

  it('緯度経度がない場合は位置情報メッセージを表示する', async () => {
    const wrapper = await createWrapper({ lat: undefined, lng: undefined })
    await nextTick()

    const message = wrapper.find('[data-test="shop-map-no-location"]')
    expect(message.exists()).toBe(true)
    expect(message.text()).toContain('位置情報が登録されていません')
  })

  it('APIキーが未設定の場合はエラーを表示する', async () => {
    runtimeConfig.public.googleMapsApiKey = ''
    const wrapper = await createWrapper()

    expect(wrapper.find('[data-test="shop-map-error"]').text()).toContain(
      '地図の読み込みに失敗しました',
    )
  })

  it('地図が正常に初期化される', async () => {
    const wrapper = await createWrapper()
    await nextTick()

    // ユーザーに影響する挙動をテスト
    expect(wrapper.find('[data-test="shop-map-container"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="shop-map-loading"]').exists()).toBe(false)
  })
})
