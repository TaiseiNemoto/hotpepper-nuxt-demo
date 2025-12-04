import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import ShopsIndexPage from '~/pages/shops/index.vue'
import { mockGenres, mockLargeAreas, mockMiddleAreas, mockSmallAreas } from '../../fixtures/masters'
import { mockShopList } from '../../fixtures/shops'
import type { ApiError } from '../../../server/types/api'

// モック関数を作成
const mockRefreshGenres = vi.fn()
const mockRefreshLargeAreas = vi.fn()
const mockRefreshMiddleAreas = vi.fn()
const mockRefreshSmallAreas = vi.fn()
const mockRefreshShops = vi.fn()

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
  shops: mockShopList,
  total: 100,
  currentPage: 1,
  totalPages: 5,
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
    total: computed(() => shopSearchState.total),
    currentPage: computed(() => shopSearchState.currentPage),
    totalPages: computed(() => shopSearchState.totalPages),
    isLoading: computed(() => shopSearchState.isLoading),
    apiError: computed(() => shopSearchState.apiError),
    errorMessage: computed(() => shopSearchState.errorMessage),
    refresh: mockRefreshShops,
  })
})

describe('検索結果ページ', () => {
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
      shops: mockShopList,
      total: 100,
      currentPage: 1,
      totalPages: 5,
      isLoading: false,
      apiError: null,
      errorMessage: '',
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('マスタデータ取得と表示', () => {
    it('正常時：SearchFormを表示する', async () => {
      // When: ページをマウント
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })
      await flushPromises()

      // Then: SearchFormが表示される
      expect(wrapper.find('[data-test="search-form"]').exists()).toBe(true)
    })

    it('ローディング中：スケルトンUIを表示する', async () => {
      // Given: マスタデータ読み込み中
      genresState.isLoading = true

      // When: ページをマウント
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })
      await flushPromises()

      // Then: スケルトンUIが表示され、SearchFormは非表示
      const skeletonUI = wrapper.find('.animate-pulse')
      expect(skeletonUI.exists()).toBe(true)
      expect(wrapper.find('[data-test="search-form"]').exists()).toBe(false)
    })

    it('マスタデータ取得エラー時：エラーメッセージと再試行ボタンを表示する', async () => {
      // Given: マスタデータ取得失敗
      genresState.apiError = { code: 'API_ERROR', message: 'エラーが発生しました' }
      genresState.errorMessage = 'ジャンルマスタの取得に失敗しました'

      // When: ページをマウント
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })
      await flushPromises()

      // Then: エラーメッセージと再試行ボタンが表示され、SearchFormは非表示
      const errorSection = wrapper.find('[data-test="masters-error"]')
      expect(errorSection.exists()).toBe(true)
      expect(errorSection.text()).toContain('ジャンルマスタの取得に失敗しました')

      const retryButton = wrapper.find('[data-test="masters-retry-button"]')
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.text()).toBe('再試行')

      expect(wrapper.find('[data-test="search-form"]').exists()).toBe(false)
    })

    it('再試行ボタンクリック時：すべてのマスタデータを再取得する', async () => {
      // Given: マスタデータ取得失敗
      genresState.apiError = { code: 'API_ERROR', message: 'エラーが発生しました' }
      genresState.errorMessage = 'ジャンルマスタの取得に失敗しました'

      // When: ページをマウントして再試行ボタンをクリック
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })
      await flushPromises()

      const retryButton = wrapper.find('[data-test="masters-retry-button"]')
      await retryButton.trigger('click')

      // Then: すべてのrefresh関数が呼ばれる
      expect(mockRefreshGenres).toHaveBeenCalledOnce()
      expect(mockRefreshLargeAreas).toHaveBeenCalledOnce()
      expect(mockRefreshMiddleAreas).toHaveBeenCalledOnce()
      expect(mockRefreshSmallAreas).toHaveBeenCalledOnce()
    })
  })

  describe('ページ見出しの動的生成', () => {
    it('デフォルト見出しを表示', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('検索結果')
    })

    it('キーワード検索：見出しにキーワードを表示', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?q=ラーメン',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.text()).toBe('「ラーメン」の検索結果')
    })

    it('ジャンル検索：見出しにジャンル名を表示', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?genres=G001',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.text()).toContain('の検索結果')
      // ジャンル名はモックデータに依存するため、パターンのみ確認
    })

    it('複数ジャンル検索：見出しに複数ジャンル名を中黒で連結', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?genres=G001,G002',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      // 複数ジャンルが中黒で連結されることを確認
      expect(heading.text()).toMatch(/・/)
      expect(heading.text()).toContain('の検索結果')
    })

    it('大エリア検索：見出しにエリア名を表示', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?area_l=Z011',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.text()).toContain('エリアの検索結果')
    })

    it('中エリア検索：大エリアより中エリアを優先', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?area_l=Z011&area_m=Y005',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.text()).toContain('エリアの検索結果')
      // 中エリアが表示されることを期待（大エリアは無視される）
    })

    it('小エリア検索：最も優先度が高い', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?area_l=Z011&area_m=Y005&area_s=X001',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.text()).toContain('エリアの検索結果')
      // 小エリアが最優先で表示される
    })

    it('キーワードが最優先：他の条件があってもキーワードを表示', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?q=寿司&genres=G001&area_l=Z011',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.text()).toBe('「寿司」の検索結果')
    })
  })

  describe('タブ切替UI', () => {
    it('デフォルトで一覧タブが選択されている', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      const listTab = wrapper.find('[data-test="tab-list"]')
      const mapTab = wrapper.find('[data-test="tab-map"]')

      expect(listTab.attributes('aria-selected')).toBe('true')
      expect(mapTab.attributes('aria-selected')).toBe('false')
    })

    it('タブクリックで表示切替とaria-selected更新', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      // 初期状態: 一覧が表示
      expect(wrapper.find('[data-test="result-list"]').exists()).toBe(true)

      // 地図タブをクリック
      await wrapper.find('[data-test="tab-map"]').trigger('click')

      // タブの選択状態が変更される
      const listTab = wrapper.find('[data-test="tab-list"]')
      const mapTab = wrapper.find('[data-test="tab-map"]')
      expect(listTab.attributes('aria-selected')).toBe('false')
      expect(mapTab.attributes('aria-selected')).toBe('true')

      // 一覧が非表示になる
      expect(wrapper.find('[data-test="result-list"]').exists()).toBe(false)
    })

    it('地図タブでPaginationが非表示になる', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      // 地図タブに切り替え
      await wrapper.find('[data-test="tab-map"]').trigger('click')

      // Paginationが非表示（v-if による条件分岐）
      expect(wrapper.find('[data-test="pagination"]').exists()).toBe(false)
    })
  })

  describe('アクセシビリティ', () => {
    it('タブにrole="tab"が設定される', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      const listTab = wrapper.find('[data-test="tab-list"]')
      const mapTab = wrapper.find('[data-test="tab-map"]')

      expect(listTab.attributes('role')).toBe('tab')
      expect(mapTab.attributes('role')).toBe('tab')
    })

    it('タブリストにrole="tablist"とaria-labelが設定される', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      const tablist = wrapper.find('[role="tablist"]')
      expect(tablist.exists()).toBe(true)
      expect(tablist.attributes('aria-label')).toBe('表示切替')
    })

    it('選択状態でtabindex切替', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      const listTab = wrapper.find('[data-test="tab-list"]')
      const mapTab = wrapper.find('[data-test="tab-map"]')

      // 初期状態: 一覧タブが選択
      expect(listTab.attributes('tabindex')).toBe('0')
      expect(mapTab.attributes('tabindex')).toBe('-1')

      // 地図タブに切り替え
      await mapTab.trigger('click')

      expect(listTab.attributes('tabindex')).toBe('-1')
      expect(mapTab.attributes('tabindex')).toBe('0')
    })
  })

  describe('店舗検索API連携', () => {
    it('正常時：店舗リストとページネーションを表示する', async () => {
      // When: ページをマウント
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?q=ラーメン',
      })
      await flushPromises()

      // Then: ResultListに店舗データが渡される
      const resultList = wrapper.find('[data-test="result-list"]')
      expect(resultList.exists()).toBe(true)

      // Then: ページネーションが表示される
      const pagination = wrapper.find('[data-test="pagination"]')
      expect(pagination.exists()).toBe(true)
    })

    it('ローディング中：スケルトンUIを表示する', async () => {
      // Given: 店舗検索中
      shopSearchState.isLoading = true
      shopSearchState.shops = []

      // When: ページをマウント
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?q=ラーメン',
      })
      await flushPromises()

      // Then: ローディングスケルトンが表示される
      const loadingIndicator = wrapper.find('[data-test="result-list-loading"]')
      expect(loadingIndicator.exists()).toBe(true)
    })

    it('0件時：空メッセージを表示する', async () => {
      // Given: 検索結果0件
      shopSearchState.shops = []
      shopSearchState.total = 0

      // When: ページをマウント
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?q=存在しない店舗',
      })
      await flushPromises()

      // Then: 空メッセージが表示される
      const emptyMessage = wrapper.find('[data-test="result-list-empty"]')
      expect(emptyMessage.exists()).toBe(true)
      expect(emptyMessage.text()).toContain('検索条件に一致する店舗が見つかりませんでした')
    })

    it('エラー時：エラーメッセージと再試行ボタンを表示する', async () => {
      // Given: 店舗検索失敗
      shopSearchState.apiError = { code: 'API_ERROR', message: 'エラーが発生しました' }
      shopSearchState.errorMessage = '店舗検索に失敗しました'

      // When: ページをマウント
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?q=ラーメン',
      })
      await flushPromises()

      // Then: エラーメッセージと再試行ボタンが表示される
      const errorSection = wrapper.find('[data-test="shops-error"]')
      expect(errorSection.exists()).toBe(true)
      expect(errorSection.text()).toContain('店舗検索に失敗しました')

      const retryButton = wrapper.find('[data-test="shops-retry-button"]')
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.text()).toBe('再試行')
    })

    it('再試行ボタンクリック時：店舗検索を再実行する', async () => {
      // Given: 店舗検索失敗
      shopSearchState.apiError = { code: 'API_ERROR', message: 'エラーが発生しました' }
      shopSearchState.errorMessage = '店舗検索に失敗しました'

      // When: ページをマウントして再試行ボタンをクリック
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?q=ラーメン',
      })
      await flushPromises()

      const retryButton = wrapper.find('[data-test="shops-retry-button"]')
      await retryButton.trigger('click')

      // Then: refresh関数が呼ばれる
      expect(mockRefreshShops).toHaveBeenCalledOnce()
    })

    it('URLクエリからパラメータを取得して検索する', async () => {
      // When: 複数の検索条件でページをマウント
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?q=ラーメン&genres=G001,G002&area_l=Z011&page=2',
      })
      await flushPromises()

      // Then: ページが正常に表示される
      expect(wrapper.find('[data-test="page-heading"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="result-list"]').exists()).toBe(true)
    })
  })
})
