<script setup lang="ts">
import type {
  Genre,
  LargeArea,
  MiddleArea,
  ShopSummary,
  SmallArea,
} from '../../../server/types/hp-internal'
import {
  mockGenres,
  mockLargeAreas,
  mockMiddleAreas,
  mockSmallAreas,
} from '../../../tests/fixtures/masters'
import { mockShopSummary } from '../../../tests/fixtures/shops'

// URLクエリからパラメータ取得
const route = useRoute()
const query = computed(() => route.query)

// マスタデータ
const genres: Genre[] = mockGenres
const largeAreas: LargeArea[] = mockLargeAreas
const middleAreas: MiddleArea[] = mockMiddleAreas
const smallAreas: SmallArea[] = mockSmallAreas

// タブ切替ステート（既定値: 一覧）
const activeTab = ref<'list' | 'map'>('list')

// モックデータ: 20件の店舗データを生成
const generateMockShops = (): ShopSummary[] => {
  const shopNames = [
    '渋谷居酒屋 本店',
    'イタリアン ベラノッテ',
    '中華料理 龍門',
    '和食処 さくら',
    '焼肉 牛角 渋谷店',
    'フレンチビストロ ルミエール',
    '韓国料理 ソウル',
    'インド料理 タージマハル',
    'スペイン料理 バル・エスパーニャ',
    '創作料理 匠',
    '寿司処 江戸前',
    'ラーメン 一蘭 新宿店',
    'カフェ ド パリ',
    '鉄板焼き 鉄人',
    '居酒屋 大漁',
    'ピザ ナポリ',
    'タイ料理 バンコク',
    '焼き鳥 炭火焼',
    'ステーキハウス 銀座',
    'ダイニングバー ラウンジ',
  ]

  const genresList = [
    { code: 'G001', name: '居酒屋' },
    { code: 'G002', name: 'イタリアン・フレンチ' },
    { code: 'G004', name: '中華' },
    { code: 'G005', name: '和食' },
    { code: 'G008', name: '焼肉・ホルモン' },
    { code: 'G002', name: 'イタリアン・フレンチ' },
    { code: 'G017', name: '韓国料理' },
    { code: 'G007', name: 'アジア・エスニック料理' },
    { code: 'G006', name: 'ダイニングバー・バル' },
    { code: 'G001', name: '居酒屋' },
    { code: 'G003', name: '和食' },
    { code: 'G013', name: 'ラーメン' },
    { code: 'G014', name: 'カフェ・スイーツ' },
    { code: 'G008', name: '焼肉・ホルモン' },
    { code: 'G001', name: '居酒屋' },
    { code: 'G002', name: 'イタリアン・フレンチ' },
    { code: 'G007', name: 'アジア・エスニック料理' },
    { code: 'G001', name: '居酒屋' },
    { code: 'G012', name: 'ステーキ・ハンバーグ' },
    { code: 'G006', name: 'ダイニングバー・バル' },
  ]

  return shopNames.map((name, index) => ({
    ...mockShopSummary,
    id: `J00${1234567 + index}`,
    name,
    genre: genresList[index],
    catch: `${name}の美味しい料理をお楽しみください`,
    lat: mockShopSummary.lat + (Math.random() - 0.5) * 0.02,
    lng: mockShopSummary.lng + (Math.random() - 0.5) * 0.02,
  }))
}

const shops = ref<ShopSummary[]>(generateMockShops())

// ページネーション情報（モック）
const pagination = {
  currentPage: 1,
  pageCount: 5,
  total: 100,
}

// ページ切替ハンドラ
const handlePageUpdate = (page: number) => {
  // モック実装: 実際のAPI呼び出しは3.3フェーズで実施
  console.log(`ページ ${page} に移動（モック）`)
  // 実際はnavigateToでクエリパラメータを更新する
}

// 動的なページ見出しを生成
const pageHeading = computed(() => {
  const keyword = query.value.q
  const genreCodes = query.value.genres
  const largeAreaCodes = query.value.area_l
  const middleAreaCodes = query.value.area_m
  const smallAreaCodes = query.value.area_s

  // キーワードがある場合
  if (keyword && typeof keyword === 'string') {
    return `「${keyword}」の検索結果`
  }

  // ジャンルがある場合
  if (genreCodes) {
    const codes = typeof genreCodes === 'string' ? genreCodes.split(',') : genreCodes
    const genreNames = codes
      .map((code) => genres.find((g) => g.code === code)?.name)
      .filter(Boolean)
    if (genreNames.length > 0) {
      return `「${genreNames.join('・')}」の検索結果`
    }
  }

  // エリアがある場合（小 > 中 > 大の優先順位）
  if (smallAreaCodes) {
    const codes = typeof smallAreaCodes === 'string' ? smallAreaCodes.split(',') : smallAreaCodes
    const areaNames = codes
      .map((code) => smallAreas.find((a) => a.code === code)?.name)
      .filter(Boolean)
    if (areaNames.length > 0) {
      return `「${areaNames.join('・')}」エリアの検索結果`
    }
  }

  if (middleAreaCodes) {
    const codes = typeof middleAreaCodes === 'string' ? middleAreaCodes.split(',') : middleAreaCodes
    const areaNames = codes
      .map((code) => middleAreas.find((a) => a.code === code)?.name)
      .filter(Boolean)
    if (areaNames.length > 0) {
      return `「${areaNames.join('・')}」エリアの検索結果`
    }
  }

  if (largeAreaCodes) {
    const codes = typeof largeAreaCodes === 'string' ? largeAreaCodes.split(',') : largeAreaCodes
    const areaNames = codes
      .map((code) => largeAreas.find((a) => a.code === code)?.name)
      .filter(Boolean)
    if (areaNames.length > 0) {
      return `「${areaNames.join('・')}」エリアの検索結果`
    }
  }

  // デフォルト
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
      <SearchForm
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
      <!-- 一覧表示 -->
      <div v-if="activeTab === 'list'" role="tabpanel" aria-labelledby="tab-list">
        <ResultList :shops="shops" />

        <!-- ページネーション（一覧タブ時のみ） -->
        <div class="mt-8">
          <PaginationControl
            :current-page="pagination.currentPage"
            :page-count="pagination.pageCount"
            :total="pagination.total"
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
