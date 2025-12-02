import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import IndexPage from '~/pages/index.vue'
import { mockGenres, mockLargeAreas, mockMiddleAreas, mockSmallAreas } from '../fixtures/masters'
import { mockShopList } from '../fixtures/shops'
import type { ApiError } from '../../server/types/api'

// モック関数を作成
const mockRefreshGenres = vi.fn()
const mockRefreshLargeAreas = vi.fn()
const mockRefreshMiddleAreas = vi.fn()
const mockRefreshSmallAreas = vi.fn()
const mockExecuteShopSearch = vi.fn()

// モック状態を保持する変数
let genresState = {
  genres: mockGenres,
  isLoading: false,
  apiError: null as ApiError | null,
  errorMessage: '',
}

let largeAreasState = {
  areas: mockLargeAreas,
  isLoading: false,
  apiError: null as ApiError | null,
  errorMessage: '',
}

let middleAreasState = {
  areas: mockMiddleAreas,
  isLoading: false,
  apiError: null as ApiError | null,
  errorMessage: '',
}

let smallAreasState = {
  areas: mockSmallAreas,
  isLoading: false,
  apiError: null as ApiError | null,
  errorMessage: '',
}

let shopSearchState = {
  shops: [] as typeof mockShopList,
  isLoading: false,
  apiError: null as ApiError | null,
  errorMessage: '',
}

// composableをモック
mockNuxtImport('useGenres', () => {
  return () => ({
    genres: computed(() => genresState.genres),
    isLoading: computed(() => genresState.isLoading),
    apiError: computed(() => genresState.apiError),
    errorMessage: computed(() => genresState.errorMessage),
    refresh: mockRefreshGenres,
  })
})

mockNuxtImport('useLargeAreas', () => {
  return () => ({
    areas: computed(() => largeAreasState.areas),
    isLoading: computed(() => largeAreasState.isLoading),
    apiError: computed(() => largeAreasState.apiError),
    errorMessage: computed(() => largeAreasState.errorMessage),
    refresh: mockRefreshLargeAreas,
  })
})

mockNuxtImport('useMiddleAreas', () => {
  return () => ({
    areas: computed(() => middleAreasState.areas),
    isLoading: computed(() => middleAreasState.isLoading),
    apiError: computed(() => middleAreasState.apiError),
    errorMessage: computed(() => middleAreasState.errorMessage),
    refresh: mockRefreshMiddleAreas,
  })
})

mockNuxtImport('useSmallAreas', () => {
  return () => ({
    areas: computed(() => smallAreasState.areas),
    isLoading: computed(() => smallAreasState.isLoading),
    apiError: computed(() => smallAreasState.apiError),
    errorMessage: computed(() => smallAreasState.errorMessage),
    refresh: mockRefreshSmallAreas,
  })
})

mockNuxtImport('useShopSearch', () => {
  return () => ({
    shops: computed(() => shopSearchState.shops),
    isLoading: computed(() => shopSearchState.isLoading),
    apiError: computed(() => shopSearchState.apiError),
    errorMessage: computed(() => shopSearchState.errorMessage),
    execute: mockExecuteShopSearch,
  })
})

describe('TOPページ', () => {
  let mockGeolocation: {
    getCurrentPosition: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // モック状態をリセット
    genresState = {
      genres: mockGenres,
      isLoading: false,
      apiError: null,
      errorMessage: '',
    }

    largeAreasState = {
      areas: mockLargeAreas,
      isLoading: false,
      apiError: null,
      errorMessage: '',
    }

    middleAreasState = {
      areas: mockMiddleAreas,
      isLoading: false,
      apiError: null,
      errorMessage: '',
    }

    smallAreasState = {
      areas: mockSmallAreas,
      isLoading: false,
      apiError: null,
      errorMessage: '',
    }

    shopSearchState = {
      shops: [],
      isLoading: false,
      apiError: null,
      errorMessage: '',
    }

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

  describe('マスタデータ取得と表示', () => {
    it('正常時：SearchFormとNearbyHotCarouselを表示する', async () => {
      // Given: 位置情報許可 + マスタ・店舗データあり
      const mockPosition = {
        coords: {
          latitude: 35.658034,
          longitude: 139.701636,
        },
      }
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition)
      })
      shopSearchState.shops = mockShopList.slice(0, 10)

      // When: ページをマウント
      const wrapper = await mountSuspended(IndexPage, {
        route: '/',
      })
      await flushPromises()

      // Then: SearchFormとNearbyHotCarouselが表示される
      expect(wrapper.find('[data-test="search-form"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="nearby-hot-carousel"]').exists()).toBe(true)
    })

    it('マスタデータ取得エラー時：エラーメッセージと再試行ボタンを表示する', async () => {
      // Given: マスタデータ取得失敗
      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error?.(new Error('User denied geolocation'))
      })
      genresState.apiError = { code: 'API_ERROR', message: 'エラーが発生しました' }
      genresState.errorMessage = 'ジャンルマスタの取得に失敗しました'

      // When: ページをマウント
      const wrapper = await mountSuspended(IndexPage, {
        route: '/',
      })
      await flushPromises()

      // Then: エラーメッセージと再試行ボタンが表示され、SearchFormは非表示
      const errorSection = wrapper.find('[role="alert"]')
      expect(errorSection.exists()).toBe(true)

      const retryButton = wrapper.find('button[type="button"]')
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.text()).toBe('再試行')

      expect(wrapper.find('[data-test="search-form"]').exists()).toBe(false)
    })
  })

  describe('周辺店舗検索', () => {
    it('店舗検索エラー時：エラーメッセージを表示する', async () => {
      // Given: 位置情報許可 + 店舗検索失敗
      const mockPosition = {
        coords: {
          latitude: 35.658034,
          longitude: 139.701636,
        },
      }
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition)
      })
      shopSearchState.apiError = { code: 'API_ERROR', message: 'エラーが発生しました' }
      shopSearchState.errorMessage = '周辺店舗の取得に失敗しました'

      // When: ページをマウント
      const wrapper = await mountSuspended(IndexPage, {
        route: '/',
      })
      await flushPromises()

      // Then: エラーメッセージが表示される
      expect(wrapper.find('[data-test="nearby-error"]').exists()).toBe(true)
    })
  })
})
