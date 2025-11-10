import type {
  GenresResponse,
  LargeAreasResponse,
  MiddleAreasResponse,
  SmallAreasResponse,
} from '../../server/types/hp-internal'

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
 */
export const useMiddleAreas = (largeAreaCode?: MaybeRef<string | undefined>) => {
  const code = computed(() => unref(largeAreaCode))

  const query = computed(() => {
    return code.value ? { largeAreaCode: code.value } : {}
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
  } = useInternalApi<MiddleAreasResponse>('/api/hp/areas/middle', {
    query,
    // SSRで実行（初期データ取得）
    server: true,
    // クライアント側でもキャッシュを利用
    lazy: false,
    // largeAreaCodeが変更されたら自動的に再フェッチ
    watch: [code],
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
 * 小エリアマスタ取得
 * HP-06: 小エリアマスタ取得
 */
export const useSmallAreas = (middleAreaCode?: MaybeRef<string | undefined>) => {
  const code = computed(() => unref(middleAreaCode))

  const query = computed(() => {
    return code.value ? { middleAreaCode: code.value } : {}
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
  } = useInternalApi<SmallAreasResponse>('/api/hp/areas/small', {
    query,
    // SSRで実行（初期データ取得）
    server: true,
    // クライアント側でもキャッシュを利用
    lazy: false,
    // middleAreaCodeが変更されたら自動的に再フェッチ
    watch: [code],
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
