<script setup lang="ts">
import type { ShopDetail } from '../../../server/types/hp-internal'
import { mockShopDetail } from '../../../tests/fixtures/shops'

// URLパラメータから店舗ID取得
const route = useRoute()
const shopId = route.params.id as string

// モックデータから店舗詳細取得（3.3フェーズでAPI結合予定）
const shop = ref<ShopDetail | null>(null)

// 店舗IDが存在するかチェック
if (shopId === mockShopDetail.id) {
  shop.value = mockShopDetail
} else {
  // 存在しない店舗IDの場合は404エラー
  throw createError({ statusCode: 404, message: '店舗が見つかりませんでした' })
}

// SEO設定（店舗情報から動的に生成）
const pageTitle = computed(() => shop.value?.name ?? '店舗詳細')
const pageDescription = computed(() => {
  if (!shop.value) return ''
  const parts = []
  if (shop.value.genre?.name) parts.push(shop.value.genre.name)
  if (shop.value.address) parts.push(shop.value.address)
  if (shop.value.catch) parts.push(shop.value.catch)
  return parts.join(' | ')
})
const ogImage = computed(() => shop.value?.photo?.l ?? '')

useSeoMeta({
  title: pageTitle.value,
  ogTitle: pageTitle.value,
  description: pageDescription.value,
  ogDescription: pageDescription.value,
  ogType: 'article',
  ogImage: ogImage.value,
})

// 公式詳細ページURL
const officialUrl = computed(() => shop.value?.urlPc ?? '')
const hasOfficialUrl = computed(() => Boolean(officialUrl.value))

// Google Maps用の位置情報
const hasLocation = computed(
  () =>
    shop.value?.lat !== undefined &&
    shop.value?.lat !== null &&
    shop.value?.lng !== undefined &&
    shop.value?.lng !== null,
)
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 py-8">
    <div v-if="shop" class="space-y-8">
      <!-- ShopHeader -->
      <ShopHeader :shop="shop" data-test="shop-detail-header" />

      <!-- 公式詳細ページボタン -->
      <div v-if="hasOfficialUrl" class="flex justify-center" data-test="shop-actions">
        <a
          :href="officialUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center rounded-xl bg-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          data-test="official-link-button"
        >
          <svg
            class="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          公式詳細ページを見る
        </a>
      </div>

      <!-- 基本情報 -->
      <section data-test="shop-info-section">
        <h2 class="mb-6 text-2xl font-bold text-gray-900">基本情報</h2>
        <ShopInfoGrid :shop="shop" />
      </section>

      <!-- 地図 -->
      <section v-if="hasLocation" data-test="shop-map-section">
        <h2 class="mb-6 text-2xl font-bold text-gray-900">アクセスマップ</h2>
        <ClientOnly>
          <ShopMap :lat="shop.lat" :lng="shop.lng" :shop-name="shop.name" />
          <template #fallback>
            <div
              class="h-[400px] animate-pulse rounded-xl bg-gray-100 ring-1 ring-gray-200"
              role="status"
              aria-label="地図を読み込み中"
            />
          </template>
        </ClientOnly>
      </section>
    </div>
  </div>
</template>
