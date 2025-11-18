import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import NearbyHotCarousel from '../../app/components/NearbyHotCarousel.vue'
import { mockShopList } from '../fixtures/shops'

describe('NearbyHotCarouselコンポーネント', () => {
  let mockGeolocation: {
    getCurrentPosition: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // navigator.geolocationのモックを作成
    mockGeolocation = {
      getCurrentPosition: vi.fn(),
    }
    Object.defineProperty(globalThis.navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('位置情報取得', () => {
    it('位置情報が許可された場合、セクションが表示され、location-obtainedイベントが発火する', async () => {
      const mockPosition = {
        coords: {
          latitude: 35.658034,
          longitude: 139.701636,
        },
      }

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition)
      })

      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: mockShopList.slice(0, 10),
          isLoading: false,
        },
      })

      await flushPromises()

      expect(wrapper.find('[data-test="nearby-hot-carousel"]').exists()).toBe(true)
      expect(wrapper.emitted('location-obtained')).toBeTruthy()
      // emitされたイベントの引数にlatとlngプロパティが存在することを確認
      const emittedEvents = wrapper.emitted('location-obtained')
      expect(emittedEvents).toBeDefined()
      expect(emittedEvents!.length).toBeGreaterThan(0)
      expect(emittedEvents![0]).toBeDefined()
      const emittedEvent = emittedEvents![0]![0] as { lat: number; lng: number }
      expect(emittedEvent).toHaveProperty('lat')
      expect(emittedEvent).toHaveProperty('lng')
      expect(typeof emittedEvent.lat).toBe('number')
      expect(typeof emittedEvent.lng).toBe('number')
    })

    it('位置情報が拒否された場合、セクションが非表示になる', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(new Error('User denied geolocation'))
      })

      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: mockShopList.slice(0, 10),
          isLoading: false,
        },
      })

      await flushPromises()

      expect(wrapper.find('[data-test="nearby-hot-carousel"]').exists()).toBe(false)
    })

    it('navigator.geolocationが存在しない場合、セクションが非表示になる', async () => {
      Object.defineProperty(globalThis.navigator, 'geolocation', {
        value: undefined,
        configurable: true,
      })

      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: mockShopList.slice(0, 10),
          isLoading: false,
        },
      })

      await flushPromises()

      expect(wrapper.find('[data-test="nearby-hot-carousel"]').exists()).toBe(false)
    })
  })

  describe('表示状態', () => {
    beforeEach(() => {
      // 位置情報を許可
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 35.658034,
            longitude: 139.701636,
          },
        })
      })
    })

    it('ローディング中はスケルトンカードを表示する', async () => {
      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: [],
          isLoading: true,
        },
      })

      await flushPromises()

      expect(wrapper.find('[data-test="nearby-loading"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="nearby-carousel"]').exists()).toBe(false)
      expect(wrapper.find('[data-test="nearby-empty"]').exists()).toBe(false)
    })

    it('店舗が0件の場合、空メッセージを表示する', async () => {
      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: [],
          isLoading: false,
        },
      })

      await flushPromises()

      const emptyMessage = wrapper.find('[data-test="nearby-empty"]')
      expect(emptyMessage.exists()).toBe(true)
      expect(emptyMessage.text()).toBe('周辺で該当店舗が見つかりませんでした')
      expect(wrapper.find('[data-test="nearby-carousel"]').exists()).toBe(false)
    })

    it('店舗が存在する場合、カルーセルを表示する', async () => {
      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: mockShopList.slice(0, 5),
          isLoading: false,
        },
      })

      await flushPromises()

      expect(wrapper.find('[data-test="nearby-carousel"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="nearby-empty"]').exists()).toBe(false)
      expect(wrapper.find('[data-test="nearby-loading"]').exists()).toBe(false)
    })
  })

  describe('カルーセル表示', () => {
    beforeEach(() => {
      // 位置情報を許可
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 35.658034,
            longitude: 139.701636,
          },
        })
      })
    })

    it('セクションタイトルを表示する', async () => {
      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: mockShopList.slice(0, 3),
          isLoading: false,
        },
      })

      await flushPromises()

      expect(wrapper.find('h2').text()).toBe('周辺のホットな飲食店')
    })

    it('渡された店舗をShopCardで表示する', async () => {
      const testShops = mockShopList.slice(0, 3)
      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: testShops,
          isLoading: false,
        },
      })

      await flushPromises()

      testShops.forEach((shop) => {
        const item = wrapper.find(`[data-test="carousel-item-${shop.id}"]`)
        expect(item.exists()).toBe(true)
      })
    })

    it('店舗が2件未満の場合、前へ/次へボタンを非表示にする', async () => {
      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: mockShopList.slice(0, 1),
          isLoading: false,
        },
      })

      await flushPromises()

      expect(wrapper.find('[data-test="carousel-prev-button"]').exists()).toBe(false)
      expect(wrapper.find('[data-test="carousel-next-button"]').exists()).toBe(false)
    })

    it('店舗が2件以上の場合、前へ/次へボタンを表示する', async () => {
      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: mockShopList.slice(0, 5),
          isLoading: false,
        },
      })

      await flushPromises()

      expect(wrapper.find('[data-test="carousel-prev-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="carousel-next-button"]').exists()).toBe(true)
    })

    it('カルーセルコンテナが存在する', async () => {
      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: mockShopList.slice(0, 3),
          isLoading: false,
        },
      })

      await flushPromises()

      const container = wrapper.find('[data-test="carousel-container"]')
      expect(container.exists()).toBe(true)
    })

    it('前へボタンにアクセシビリティ属性が設定されている', async () => {
      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: mockShopList.slice(0, 5),
          isLoading: false,
        },
      })

      await flushPromises()

      const prevButton = wrapper.find('[data-test="carousel-prev-button"]')
      expect(prevButton.attributes('type')).toBe('button')
      expect(prevButton.attributes('aria-label')).toBeTruthy()
    })

    it('次へボタンにアクセシビリティ属性が設定されている', async () => {
      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: mockShopList.slice(0, 5),
          isLoading: false,
        },
      })

      await flushPromises()

      const nextButton = wrapper.find('[data-test="carousel-next-button"]')
      expect(nextButton.attributes('type')).toBe('button')
      expect(nextButton.attributes('aria-label')).toBeTruthy()
    })
  })

  describe('カルーセルボタンの動作', () => {
    beforeEach(() => {
      // 位置情報を許可
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 35.658034,
            longitude: 139.701636,
          },
        })
      })
    })

    it('次へボタンをクリックするとスクロールイベントが発生する', async () => {
      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: mockShopList.slice(0, 10),
          isLoading: false,
        },
      })

      await flushPromises()

      const container = wrapper.find('[data-test="carousel-container"]')
      const nextButton = wrapper.find('[data-test="carousel-next-button"]')

      // scrollByメソッドのモック
      const scrollBySpy = vi.fn()
      container.element.scrollBy = scrollBySpy

      await nextButton.trigger('click')

      expect(scrollBySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          behavior: 'smooth',
        }),
      )
    })

    it('前へボタンをクリックするとスクロールイベントが発生する', async () => {
      const wrapper = await mountSuspended(NearbyHotCarousel, {
        props: {
          shops: mockShopList.slice(0, 10),
          isLoading: false,
        },
      })

      await flushPromises()

      const container = wrapper.find('[data-test="carousel-container"]')
      const prevButton = wrapper.find('[data-test="carousel-prev-button"]')

      // scrollByメソッドのモック
      const scrollBySpy = vi.fn()
      container.element.scrollBy = scrollBySpy

      // スクロール位置を右に移動して前へボタンを活性化
      Object.defineProperty(container.element, 'scrollLeft', { value: 100, configurable: true })
      Object.defineProperty(container.element, 'scrollWidth', { value: 1000, configurable: true })
      Object.defineProperty(container.element, 'clientWidth', { value: 400, configurable: true })
      await container.trigger('scroll')

      await prevButton.trigger('click')

      expect(scrollBySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          behavior: 'smooth',
        }),
      )
    })
  })
})
