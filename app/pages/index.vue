<script setup lang="ts">
import type { ShopSummary } from '../../server/types/hp-internal'
import { mockShopSummary } from '../../tests/fixtures/shops'

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

// カルーセル用のモック店舗データ（10件生成）
const nearbyShops = ref<ShopSummary[]>([])
const isLoadingNearby = ref(false)

// 10件の店舗データを生成
const generateMockNearbyShops = (): ShopSummary[] => {
  const shopNames = [
    '渋谷居酒屋 本店',
    'イタリアン ベラノッテ',
    '中華料理 龍門',
    '和食処 さくら',
    '焼肉 牛角',
    'フレンチビストロ ルミエール',
    '韓国料理 ソウル',
    'インド料理 タージマハル',
    'スペイン料理 バル',
    '創作料理 匠',
  ]

  const genres = [
    { code: 'G001', name: '居酒屋' },
    { code: 'G002', name: 'イタリアン・フレンチ' },
    { code: 'G003', name: '中華' },
    { code: 'G004', name: '和食' },
    { code: 'G005', name: '焼肉・ホルモン' },
    { code: 'G002', name: 'イタリアン・フレンチ' },
    { code: 'G017', name: '韓国料理' },
    { code: 'G007', name: 'アジア・エスニック料理' },
    { code: 'G006', name: 'ダイニングバー・バル' },
    { code: 'G001', name: '居酒屋' },
  ]

  return shopNames.map((name, index) => ({
    ...mockShopSummary,
    id: `J00123456${index}`,
    name,
    genre: genres[index],
    catch: `${name}の美味しい料理をお楽しみください`,
    lat: mockShopSummary.lat + (Math.random() - 0.5) * 0.01,
    lng: mockShopSummary.lng + (Math.random() - 0.5) * 0.01,
  }))
}

// 位置情報取得時のハンドラ
const handleLocationObtained = (_location: { lat: number; lng: number }) => {
  // モック実装: 実際のAPI呼び出しは3.3フェーズで実施
  isLoadingNearby.value = true

  // ローディング状態をシミュレート
  setTimeout(() => {
    nearbyShops.value = generateMockNearbyShops()
    isLoadingNearby.value = false
  }, 500)
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
      <SearchForm
        v-else
        :genres="genres"
        :large-areas="largeAreas"
        :middle-areas="middleAreas"
        :small-areas="smallAreas"
      />
    </section>

    <NearbyHotCarousel
      :shops="nearbyShops"
      :is-loading="isLoadingNearby"
      @location-obtained="handleLocationObtained"
    />
  </div>
</template>
