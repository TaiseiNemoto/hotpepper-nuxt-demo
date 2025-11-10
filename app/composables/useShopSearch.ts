import type { ShopSearchResponse } from '../../server/types/hp-internal'

/**
 * 店舗検索パラメータ
 */
export interface ShopSearchParams {
  page?: number
  perPage?: number
  q?: string
  genreCode?: string | string[]
  largeAreaCode?: string | string[]
  middleAreaCode?: string | string[]
  smallAreaCode?: string | string[]
  lat?: number
  lng?: number
  range?: number
  order?: number
}

/**
 * 店舗検索API呼び出し
 * HP-01: 店舗検索
 */
export const useShopSearch = (params?: MaybeRef<ShopSearchParams>) => {
  const searchParams = computed(() => unref(params) ?? {})

  // クエリパラメータを構築
  const query = computed(() => {
    const p = searchParams.value
    const queryObj: Record<string, string | number | string[]> = {}

    if (p.page) queryObj.page = p.page
    if (p.perPage) queryObj.perPage = p.perPage
    if (p.q) queryObj.q = p.q
    if (p.genreCode) queryObj.genreCode = p.genreCode
    if (p.largeAreaCode) queryObj.largeAreaCode = p.largeAreaCode
    if (p.middleAreaCode) queryObj.middleAreaCode = p.middleAreaCode
    if (p.smallAreaCode) queryObj.smallAreaCode = p.smallAreaCode
    if (p.lat) queryObj.lat = p.lat
    if (p.lng) queryObj.lng = p.lng
    if (p.range) queryObj.range = p.range
    if (p.order) queryObj.order = p.order

    return queryObj
  })

  const {
    data,
    apiError,
    errorMessage,
    isLoading,
    isSuccess,
    isFailure,
    error,
    status,
    refresh,
    execute,
  } = useInternalApi<ShopSearchResponse>('/api/hp/shops/search', {
    query,
    // SSRで実行（初期データ取得）
    server: true,
    // クライアント側でもキャッシュを利用
    lazy: false,
    // クエリパラメータが変更されたら自動的に再フェッチ
    watch: [query],
  })

  // レスポンスから個別のデータを取得
  const shops = computed(() => data.value?.shops ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const start = computed(() => data.value?.start ?? 0)
  const returned = computed(() => data.value?.returned ?? 0)

  // ページネーション情報
  const currentPage = computed(() => searchParams.value.page ?? 1)
  const perPage = computed(() => searchParams.value.perPage ?? 20)
  const totalPages = computed(() => Math.ceil(total.value / perPage.value))
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  return {
    // データ
    shops,
    total,
    start,
    returned,
    // ページネーション情報
    currentPage,
    perPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    // 状態
    isLoading,
    isSuccess,
    isFailure,
    apiError,
    errorMessage,
    error,
    status,
    // メソッド
    refresh,
    execute,
  }
}
