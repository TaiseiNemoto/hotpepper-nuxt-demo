import type { ShopDetail, ShopDetailResponse } from '../../server/types/hp-internal'

/**
 * 店舗詳細API呼び出し
 * HP-02: 店舗詳細取得
 */
export const useShopDetail = (shopId: MaybeRef<string>) => {
  const id = computed(() => unref(shopId))

  // IDが有効かどうか
  const hasValidId = computed(() => !!id.value && id.value.trim() !== '')

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
  } = useInternalApi<ShopDetailResponse>(() => `/api/hp/shops/${id.value}`, {
    // IDが有効な場合のみSSRで実行
    server: hasValidId.value,
    // IDが無効な場合はlazyにして初回フェッチをスキップ
    lazy: !hasValidId.value,
    // IDが変更されたら自動的に再フェッチ
    watch: [id],
  })

  // 店舗データを取得
  const shop = computed<ShopDetail | null>(() => {
    if (!hasValidId.value) return null
    return data.value?.shop ?? null
  })

  // 404エラーかどうか
  const isNotFound = computed(() => {
    if (!hasValidId.value) return false
    return data.value?.notFound ?? false
  })

  return {
    // データ
    shop,
    isNotFound,
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
