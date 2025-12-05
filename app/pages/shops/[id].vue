<script setup lang="ts">
/**
 * 店舗詳細ページ
 *
 * 機能:
 * - 店舗詳細情報の表示（名前、住所、営業時間など）
 * - Google Maps APIを使った地図表示
 * - 公式詳細ページへのリンク
 * - SSRによるSEO最適化
 */

// URLパラメータから店舗ID取得
const route = useRoute()
const shopId = route.params.id as string

// useShopDetail composableで店舗詳細を取得
const { shop, isNotFound, isLoading, apiError, errorMessage, refresh } = useShopDetail(shopId)

// 404エラー時はNuxtのエラーハンドリングに委譲
watch(
  isNotFound,
  (notFound) => {
    if (notFound) {
      throw createError({ statusCode: 404, message: '店舗が見つかりませんでした' })
    }
  },
  { immediate: true },
)

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

// computedをそのまま渡してリアクティブ性を維持
useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  ogType: 'article',
  ogImage: ogImage,
})

// 公式詳細ページURLの存在チェック
const hasOfficialUrl = computed(() => Boolean(shop.value?.urlPc))

// Google Maps用の位置情報チェック
const hasLocation = computed(() => {
  const lat = shop.value?.lat
  const lng = shop.value?.lng
  return lat != null && lng != null
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 py-8">
    <!-- ローディング状態 -->
    <div
      v-if="isLoading"
      class="space-y-8 animate-pulse"
      role="status"
      aria-busy="true"
      aria-label="店舗詳細を読み込み中"
      data-test="shop-loading"
    >
      <!-- ヘッダースケルトン -->
      <div class="space-y-4">
        <div class="h-10 w-3/4 bg-gray-200 rounded"></div>
        <div class="h-6 w-1/2 bg-gray-200 rounded"></div>
        <div class="h-64 bg-gray-200 rounded-xl"></div>
      </div>
      <!-- ボタンスケルトン -->
      <div class="flex justify-center">
        <div class="h-14 w-64 bg-gray-200 rounded-xl"></div>
      </div>
      <!-- 基本情報スケルトン -->
      <div class="space-y-4">
        <div class="h-8 w-32 bg-gray-200 rounded"></div>
        <div class="h-48 bg-gray-200 rounded-xl"></div>
      </div>
      <!-- 地図スケルトン -->
      <div class="space-y-4">
        <div class="h-8 w-48 bg-gray-200 rounded"></div>
        <div class="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    </div>

    <!-- エラー表示 -->
    <div
      v-else-if="apiError"
      role="alert"
      aria-live="polite"
      data-test="shop-error"
      class="rounded-xl bg-red-50 border border-red-200 p-8 text-center"
    >
      <p class="text-red-600 font-medium mb-4">{{ errorMessage }}</p>
      <button
        type="button"
        data-test="shop-retry-button"
        class="mt-4 rounded-lg bg-orange-600 px-6 py-2 text-white font-medium transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
        @click="() => refresh()"
      >
        再試行
      </button>
    </div>

    <!-- 店舗詳細表示 -->
    <div v-else-if="shop" class="space-y-8" data-test="shop-content">
      <!-- ShopHeader -->
      <ShopHeader :shop="shop" data-test="shop-detail-header" />

      <!-- 公式詳細ページボタン -->
      <div v-if="hasOfficialUrl && shop.urlPc" class="flex justify-center" data-test="shop-actions">
        <a
          :href="shop.urlPc"
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

      <!-- 基本情報セクション -->
      <section aria-labelledby="shop-info-heading" data-test="shop-info-section">
        <h2 id="shop-info-heading" class="mb-6 text-2xl font-bold text-gray-900">基本情報</h2>
        <ShopInfoGrid :shop="shop" />
      </section>

      <!-- アクセスマップセクション -->
      <section v-if="hasLocation" aria-labelledby="shop-map-heading" data-test="shop-map-section">
        <h2 id="shop-map-heading" class="mb-6 text-2xl font-bold text-gray-900">アクセスマップ</h2>
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
