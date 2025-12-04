<script setup lang="ts">
// URLクエリからパラメータ取得
const route = useRoute()
const query = computed(() => route.query)

// マスタデータ取得
const {
  genres,
  isLoading: isLoadingGenres,
  apiError: genresError,
  errorMessage: genresErrorMessage,
  refresh: refreshGenres,
} = useGenres()

const {
  areas: largeAreas,
  isLoading: isLoadingLargeAreas,
  apiError: largeAreasError,
  errorMessage: largeAreasErrorMessage,
  refresh: refreshLargeAreas,
} = useLargeAreas()

const {
  areas: middleAreas,
  isLoading: isLoadingMiddleAreas,
  apiError: middleAreasError,
  errorMessage: middleAreasErrorMessage,
  refresh: refreshMiddleAreas,
} = useMiddleAreas()

const {
  areas: smallAreas,
  isLoading: isLoadingSmallAreas,
  apiError: smallAreasError,
  errorMessage: smallAreasErrorMessage,
  refresh: refreshSmallAreas,
} = useSmallAreas()

// マスタデータのローディング状態を統合
const isLoadingMasters = computed(
  () =>
    isLoadingGenres.value ||
    isLoadingLargeAreas.value ||
    isLoadingMiddleAreas.value ||
    isLoadingSmallAreas.value,
)

// マスタデータのエラー状態を統合
const mastersError = computed(() => {
  return (
    genresError.value || largeAreasError.value || middleAreasError.value || smallAreasError.value
  )
})

const mastersErrorMessage = computed(() => {
  const errors = [
    genresErrorMessage.value,
    largeAreasErrorMessage.value,
    middleAreasErrorMessage.value,
    smallAreasErrorMessage.value,
  ].filter(Boolean)

  if (errors.length === 0) return '検索フォームの読み込みに失敗しました'
  if (errors.length === 1) return errors[0]
  return `複数のデータ読み込みに失敗しました（${errors.length}件）`
})

// マスタデータの再試行
const retryLoadMasters = async () => {
  await Promise.all([
    refreshGenres(),
    refreshLargeAreas(),
    refreshMiddleAreas(),
    refreshSmallAreas(),
  ])
}

// タブ切替ステート（既定値: 一覧）
const activeTab = ref<'list' | 'map'>('list')

// URLクエリから検索パラメータを構築
const searchParams = computed(() => ({
  q: query.value.q as string | undefined,
  genreCode: query.value.genres as string | undefined,
  largeAreaCode: query.value.area_l as string | undefined,
  middleAreaCode: query.value.area_m as string | undefined,
  smallAreaCode: query.value.area_s as string | undefined,
  page: Number(query.value.page) || 1,
}))

// 店舗検索API呼び出し
const {
  shops,
  total,
  currentPage,
  totalPages,
  isLoading: isLoadingShops,
  apiError: shopsApiError,
  errorMessage: shopsErrorMessage,
  refresh: refreshShops,
} = useShopSearch(searchParams, {
  server: true, // SSRで実行（SEO最適化）
  immediate: true, // 自動実行 + クエリ変更時に再フェッチ
})

// ページ切替ハンドラ
const handlePageUpdate = (page: number) => {
  navigateTo({
    path: '/shops',
    query: { ...route.query, page: String(page) },
  })
}

// 動的なページ見出しを生成
// 優先順位: キーワード > ジャンル > 小エリア > 中エリア > 大エリア > デフォルト
const pageHeading = computed(() => {
  const keyword = query.value.q
  const genreCodes = query.value.genres
  const largeAreaCodes = query.value.area_l
  const middleAreaCodes = query.value.area_m
  const smallAreaCodes = query.value.area_s

  // 1. キーワード検索（最優先）
  if (keyword && typeof keyword === 'string') {
    return `「${keyword}」の検索結果`
  }

  // 2. ジャンル検索
  if (genreCodes) {
    const codes = typeof genreCodes === 'string' ? genreCodes.split(',') : genreCodes
    const genreNames = codes
      .map((code) => genres.value.find((g) => g.code === code)?.name)
      .filter(Boolean)
    if (genreNames.length > 0) {
      return `「${genreNames.join('・')}」の検索結果`
    }
  }

  // 3. エリア検索（小 > 中 > 大の優先順位）
  if (smallAreaCodes) {
    const codes = typeof smallAreaCodes === 'string' ? smallAreaCodes.split(',') : smallAreaCodes
    const areaNames = codes
      .map((code) => smallAreas.value.find((a) => a.code === code)?.name)
      .filter(Boolean)
    if (areaNames.length > 0) {
      return `「${areaNames.join('・')}」エリアの検索結果`
    }
  }

  if (middleAreaCodes) {
    const codes = typeof middleAreaCodes === 'string' ? middleAreaCodes.split(',') : middleAreaCodes
    const areaNames = codes
      .map((code) => middleAreas.value.find((a) => a.code === code)?.name)
      .filter(Boolean)
    if (areaNames.length > 0) {
      return `「${areaNames.join('・')}」エリアの検索結果`
    }
  }

  if (largeAreaCodes) {
    const codes = typeof largeAreaCodes === 'string' ? largeAreaCodes.split(',') : largeAreaCodes
    const areaNames = codes
      .map((code) => largeAreas.value.find((a) => a.code === code)?.name)
      .filter(Boolean)
    if (areaNames.length > 0) {
      return `「${areaNames.join('・')}」エリアの検索結果`
    }
  }

  // 4. デフォルト（検索条件なし）
  return '検索結果'
})

// 動的なページタイトルを生成（titleTemplate適用済み）
const pageTitle = computed(() => {
  const heading = pageHeading.value
  if (heading === '検索結果') {
    return '検索結果一覧'
  }
  return `${heading}一覧`
})

// 動的なページdescriptionを生成
const pageDescription = computed(() => {
  const heading = pageHeading.value
  if (heading === '検索結果') {
    return 'HotPepper Gourmet APIを使った飲食店検索結果を一覧表示します。地図表示にも対応しています。'
  }
  return `${heading}を一覧表示します。HotPepper Gourmet APIを利用した飲食店検索サイトです。`
})

// SEO設定
useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  ogType: 'article',
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 py-8">
    <!-- ページ見出し -->
    <h1 class="mb-6 text-3xl font-bold text-gray-900" data-test="page-heading">
      {{ pageHeading }}
    </h1>

    <!-- 検索フォーム -->
    <section class="mb-8" aria-label="検索条件">
      <!-- マスタデータ読み込み中 -->
      <div
        v-if="isLoadingMasters"
        class="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"
      >
        <div class="space-y-6 animate-pulse">
          <!-- 見出し -->
          <div class="h-7 w-24 bg-gray-200 rounded"></div>
          <!-- キーワード入力 -->
          <div class="h-10 bg-gray-200 rounded-lg"></div>
          <!-- ジャンル選択 -->
          <div class="h-32 bg-gray-200 rounded-lg"></div>
          <!-- エリア選択 -->
          <div class="h-40 bg-gray-200 rounded-lg"></div>
          <!-- 検索ボタン -->
          <div class="h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      <!-- マスタデータ読み込みエラー -->
      <div
        v-else-if="mastersError"
        role="alert"
        aria-live="polite"
        data-test="masters-error"
        class="rounded-xl bg-red-50 border border-red-200 p-8 text-center"
      >
        <p class="text-red-600 font-medium mb-4">{{ mastersErrorMessage }}</p>
        <button
          type="button"
          data-test="masters-retry-button"
          class="mt-4 rounded-lg bg-orange-600 px-6 py-2 text-white font-medium transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
          @click="retryLoadMasters"
        >
          再試行
        </button>
      </div>

      <!-- 検索フォーム表示 -->
      <SearchForm
        v-else
        :genres="genres"
        :large-areas="largeAreas"
        :middle-areas="middleAreas"
        :small-areas="smallAreas"
      />
    </section>

    <!-- タブ切替UI -->
    <div class="mb-6" role="tablist" aria-label="表示切替" data-test="tab-controls">
      <div class="flex gap-2 border-b border-gray-200">
        <button
          id="tab-list"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'list'"
          :tabindex="activeTab === 'list' ? 0 : -1"
          class="rounded-t-lg px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
          :class="
            activeTab === 'list'
              ? 'bg-white text-orange-600 shadow-sm ring-1 ring-gray-200 ring-b-0'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          "
          data-test="tab-list"
          @click="activeTab = 'list'"
        >
          一覧
        </button>
        <button
          id="tab-map"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'map'"
          :tabindex="activeTab === 'map' ? 0 : -1"
          class="rounded-t-lg px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
          :class="
            activeTab === 'map'
              ? 'bg-white text-orange-600 shadow-sm ring-1 ring-gray-200 ring-b-0'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          "
          data-test="tab-map"
          @click="activeTab = 'map'"
        >
          地図
        </button>
      </div>
    </div>

    <!-- 結果表示エリア -->
    <section aria-label="検索結果">
      <!-- エラー表示 -->
      <div
        v-if="shopsApiError"
        role="alert"
        aria-live="polite"
        data-test="shops-error"
        class="rounded-xl bg-red-50 border border-red-200 p-8 text-center"
      >
        <p class="text-red-600 font-medium mb-4">{{ shopsErrorMessage }}</p>
        <button
          type="button"
          data-test="shops-retry-button"
          class="mt-4 rounded-lg bg-orange-600 px-6 py-2 text-white font-medium transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
          @click="() => refreshShops()"
        >
          再試行
        </button>
      </div>

      <!-- 一覧表示 -->
      <div v-else-if="activeTab === 'list'" role="tabpanel" aria-labelledby="tab-list">
        <ResultList :shops="shops" :is-loading="isLoadingShops" />

        <!-- ページネーション（一覧タブ時のみ） -->
        <div class="mt-8">
          <PaginationControl
            :current-page="currentPage"
            :page-count="totalPages"
            :total="total"
            @update:page="handlePageUpdate"
          />
        </div>
      </div>

      <!-- 地図表示 -->
      <div v-else-if="activeTab === 'map'" role="tabpanel" aria-labelledby="tab-map">
        <ClientOnly>
          <ResultMap :shops="shops" />
          <template #fallback>
            <div
              class="h-[600px] animate-pulse rounded-xl bg-gray-100"
              role="status"
              aria-label="地図を読み込み中"
            ></div>
          </template>
        </ClientOnly>
      </div>
    </section>
  </div>
</template>
