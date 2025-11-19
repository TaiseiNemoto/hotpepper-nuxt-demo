<script setup lang="ts">
import type {
  Genre,
  LargeArea,
  MiddleArea,
  ShopSummary,
  SmallArea,
} from '../../server/types/hp-internal'
import {
  mockGenres,
  mockLargeAreas,
  mockMiddleAreas,
  mockSmallAreas,
} from '../../tests/fixtures/masters'
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

// マスタデータ
const genres: Genre[] = mockGenres
const largeAreas: LargeArea[] = mockLargeAreas
const middleAreas: MiddleArea[] = mockMiddleAreas
const smallAreas: SmallArea[] = mockSmallAreas

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
      <SearchForm
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
