import type {
  GenresResponse,
  LargeAreasResponse,
  MiddleArea,
  MiddleAreasResponse,
  SmallArea,
  SmallAreasResponse,
} from '../../server/types/hp-internal'
import type { ApiError, ApiSuccess } from '../../server/types/api'

/**
 * ジャンルマスタ取得
 * HP-03: ジャンルマスタ取得
 */
export const useGenres = () => {
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
  } = useInternalApi<GenresResponse>('/api/hp/genres', {
    // SSRで実行（初期データ取得）
    server: true,
    // クライアント側でもキャッシュを利用
    lazy: false,
  })

  // ジャンル配列を取得
  const genres = computed(() => data.value?.genres ?? [])

  return {
    genres,
    isLoading,
    isSuccess,
    isFailure,
    apiError,
    errorMessage,
    error,
    status,
    refresh,
    execute,
  }
}

/**
 * 大エリアマスタ取得
 * HP-04: 大エリアマスタ取得
 */
export const useLargeAreas = () => {
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
  } = useInternalApi<LargeAreasResponse>('/api/hp/areas/large', {
    // SSRで実行（初期データ取得）
    server: true,
    // クライアント側でもキャッシュを利用
    lazy: false,
  })

  // エリア配列を取得
  const areas = computed(() => data.value?.areas ?? [])

  return {
    areas,
    isLoading,
    isSuccess,
    isFailure,
    apiError,
    errorMessage,
    error,
    status,
    refresh,
    execute,
  }
}

/**
 * 中エリアマスタ取得
 * HP-05: 中エリアマスタ取得
 *
 * @param largeAreaCodes 大エリアコードの配列。複数の大エリアに対応し、各エリアごとに並列でAPIリクエストを実行。
 */
export const useMiddleAreas = (largeAreaCodes?: MaybeRef<string[]>) => {
  const codes = computed(() => unref(largeAreaCodes) ?? [])

  // すべてのデータを保持するMap（キャッシュ）
  const areaCache = ref(new Map<string, MiddleArea[]>())
  const isLoading = ref(false)
  const apiError = ref<ApiError | null>(null)

  // 各大エリアのデータを個別に取得
  const fetchAreasForCode = async (code: string) => {
    if (areaCache.value.has(code)) return // キャッシュがあればスキップ

    try {
      // 内部API呼び出し（/api/hp/areas/middle?largeAreaCode=Z011）
      // → HotPepper APIに large_area=Z011 を渡す
      // → 指定された大エリアの配下の中エリアのみを返す（全件ではない）
      const response = await $fetch<ApiSuccess<MiddleAreasResponse>>('/api/hp/areas/middle', {
        query: { largeAreaCode: code },
      })
      if (response.success) {
        areaCache.value.set(code, response.data.areas)
      }
    } catch (error) {
      console.error('中エリアマスタ取得エラー:', error)
      apiError.value = { code: 'NETWORK_ERROR', message: 'データ取得に失敗しました' }
    }
  }

  // codesの変更を監視して必要なデータを取得
  watch(
    codes,
    async (newCodes) => {
      if (newCodes.length === 0) {
        areaCache.value.clear()
        return
      }

      isLoading.value = true
      // 各大エリアごとに並列でAPIリクエストを実行
      await Promise.all(newCodes.map((code) => fetchAreasForCode(code)))
      isLoading.value = false
    },
    { immediate: true },
  )

  // 選択された大エリアに関連する中エリアのみを返す
  const areas = computed(() => {
    const result: MiddleArea[] = []
    codes.value.forEach((code) => {
      const cached = areaCache.value.get(code)
      if (cached) result.push(...cached)
    })
    return result
  })

  // 検索結果ページとの互換性のための空のrefresh関数（TODO: 検索結果ページ修正後に削除）
  const refresh = async () => {
    // 段階的データ取得ではwatchで自動取得されるため、何もしない
  }

  return {
    areas,
    isLoading: computed(() => isLoading.value),
    apiError: computed(() => apiError.value),
    errorMessage: computed(() => apiError.value?.message ?? ''),
    refresh,
  }
}

/**
 * 小エリアマスタ取得
 * HP-06: 小エリアマスタ取得
 *
 * @param middleAreaCodes 中エリアコードの配列。複数の中エリアに対応し、各エリアごとに並列でAPIリクエストを実行。
 */
export const useSmallAreas = (middleAreaCodes?: MaybeRef<string[]>) => {
  const codes = computed(() => unref(middleAreaCodes) ?? [])

  // すべてのデータを保持するMap（キャッシュ）
  const areaCache = ref(new Map<string, SmallArea[]>())
  const isLoading = ref(false)
  const apiError = ref<ApiError | null>(null)

  // 各中エリアのデータを個別に取得
  const fetchAreasForCode = async (code: string) => {
    if (areaCache.value.has(code)) return // キャッシュがあればスキップ

    try {
      // 内部API呼び出し（/api/hp/areas/small?middleAreaCode=Y005）
      // → HotPepper APIに middle_area=Y005 を渡す
      // → 指定された中エリアの配下の小エリアのみを返す
      const response = await $fetch<ApiSuccess<SmallAreasResponse>>('/api/hp/areas/small', {
        query: { middleAreaCode: code },
      })
      if (response.success) {
        areaCache.value.set(code, response.data.areas)
      }
    } catch (error) {
      console.error('小エリアマスタ取得エラー:', error)
      apiError.value = { code: 'NETWORK_ERROR', message: 'データ取得に失敗しました' }
    }
  }

  // codesの変更を監視して必要なデータを取得
  watch(
    codes,
    async (newCodes) => {
      if (newCodes.length === 0) {
        areaCache.value.clear()
        return
      }

      isLoading.value = true
      // 各中エリアごとに並列でAPIリクエストを実行
      await Promise.all(newCodes.map((code) => fetchAreasForCode(code)))
      isLoading.value = false
    },
    { immediate: true },
  )

  // 選択された中エリアに関連する小エリアのみを返す
  const areas = computed(() => {
    const result: SmallArea[] = []
    codes.value.forEach((code) => {
      const cached = areaCache.value.get(code)
      if (cached) result.push(...cached)
    })
    return result
  })

  // 検索結果ページとの互換性のための空のrefresh関数（TODO: 検索結果ページ修正後に削除）
  const refresh = async () => {
    // 段階的データ取得ではwatchで自動取得されるため、何もしない
  }

  return {
    areas,
    isLoading: computed(() => isLoading.value),
    apiError: computed(() => apiError.value),
    errorMessage: computed(() => apiError.value?.message ?? ''),
    refresh,
  }
}
