<script setup lang="ts">
// SEO設定
useSeoMeta({
  title: 'トップ',
  ogTitle: 'HotPepper グルメ検索',
  description:
    'HotPepper Gourmet APIを使った飲食店検索サイト。周辺のお店を探したり、エリアやジャンルで絞り込んで検索できます。',
  ogDescription:
    'HotPepper Gourmet APIを使った飲食店検索サイト。周辺のお店を探したり、エリアやジャンルで絞り込んで検索できます。',
  ogType: 'website',
})

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

// マスタデータのローディング状態を統合
const isLoadingMasters = computed(() => isLoadingGenres.value || isLoadingLargeAreas.value)

// マスタデータのエラー状態を統合
const mastersError = computed(() => {
  return genresError.value || largeAreasError.value
})

const mastersErrorMessage = computed(() => {
  const errors = [genresErrorMessage.value, largeAreasErrorMessage.value].filter(Boolean)

  if (errors.length === 0) return '検索フォームの読み込みに失敗しました'
  if (errors.length === 1) return errors[0]
  return `複数のデータ読み込みに失敗しました（${errors.length}件）`
})

// マスタデータの再試行
const retryLoadMasters = async () => {
  await Promise.all([refreshGenres(), refreshLargeAreas()])
}

// 周辺店舗データ取得（CSRのみ）
const nearbyLocation = ref<{ lat: number; lng: number } | null>(null)

// 周辺店舗検索パラメータ
const nearbySearchParams = computed(() => {
  if (!nearbyLocation.value) return {}
  return {
    lat: nearbyLocation.value.lat,
    lng: nearbyLocation.value.lng,
    perPage: 10,
    page: 1,
  }
})

const {
  shops: nearbyShops,
  isLoading: isLoadingNearby,
  apiError: nearbyApiError,
  errorMessage: nearbyErrorMessage,
  execute: fetchNearbyShops,
} = useShopSearch(nearbySearchParams, {
  server: false,
  immediate: false,
})

const nearbyHasError = computed(() => !!nearbyApiError.value)

// 位置情報取得時のハンドラ
const handleLocationObtained = async (location: { lat: number; lng: number }) => {
  nearbyLocation.value = location
  await fetchNearbyShops()
}

// 周辺店舗検索のリトライ
const retryNearbySearch = async () => {
  if (nearbyLocation.value) {
    await fetchNearbyShops()
  }
}
</script>

<template>
  <div>
    <HeroSection />

    <section class="mx-auto max-w-6xl px-6 py-8">
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
        class="rounded-xl bg-red-50 border border-red-200 p-8 text-center"
      >
        <p class="text-red-600 font-medium mb-4">{{ mastersErrorMessage }}</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-orange-600 px-6 py-2 text-white font-medium transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
          @click="retryLoadMasters"
        >
          再試行
        </button>
      </div>

      <!-- 検索フォーム表示 -->
      <SearchForm v-else :genres="genres" :large-areas="largeAreas" />
    </section>

    <NearbyHotCarousel
      :shops="nearbyShops"
      :is-loading="isLoadingNearby"
      :has-error="nearbyHasError"
      :error-message="nearbyErrorMessage"
      @location-obtained="handleLocationObtained"
      @retry="retryNearbySearch"
    />
  </div>
</template>
