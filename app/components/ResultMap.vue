<script setup lang="ts">
/// <reference types="@types/google.maps" />
/**
 * 検索結果の店舗を地図上に表示するコンポーネント
 * Google Maps APIを使用するため、<ClientOnly>でラップして使用すること
 */
import type { ShopSummary } from '../../server/types/hp-internal'
import { escapeHtml } from '~/utils/html'

const props = defineProps<{
  /** 地図上に表示する店舗リスト */
  shops: ShopSummary[]
}>()

const { apiKey, waitForGoogleMaps } = useGoogleMaps()

// 地図のDOM参照
const mapContainer = ref<HTMLElement | null>(null)
// Google Maps インスタンス
const map = ref<google.maps.Map | null>(null)
// マーカーとInfoWindowの管理
const markers = ref<google.maps.Marker[]>([])
const infoWindow = ref<google.maps.InfoWindow | null>(null)
// APIロード状態
const isLoading = ref(true)
const hasError = ref(false)

/**
 * 住所を市区町村レベルまで短縮（日本語住所専用）
 */
const shortenAddress = (address: string): string => {
  // 「東京都渋谷区道玄坂1-2-3」→「東京都渋谷区」
  const match = address.match(/^(.+?[都道府県].+?[市区町村郡])/)
  return match?.[1] ?? address
}

/**
 * InfoWindowのHTMLコンテンツを生成（XSS対策済み）
 */
const createInfoWindowContent = (shop: ShopSummary): string => {
  const shopName = escapeHtml(shop.name)
  const genre = escapeHtml(shop.genre?.name ?? 'ジャンル未設定')
  const address = escapeHtml(shop.address ? shortenAddress(shop.address) : '住所情報なし')
  const detailUrl = escapeHtml(`/shops/${shop.id}`)

  return `
    <div class="p-3 max-w-xs" data-test="map-info-window">
      <h3 class="truncate text-base font-semibold text-gray-900" data-test="map-info-window-name">
        ${shopName}
      </h3>
      <p class="mt-1 text-sm text-orange-600" data-test="map-info-window-genre">
        ${genre}
      </p>
      <p class="mt-1 text-sm text-gray-600" data-test="map-info-window-address">
        ${address}
      </p>
      <a
        href="${detailUrl}"
        class="mt-3 inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
        aria-label="${shopName} の詳細を見る"
        data-test="map-info-window-link"
      >
        詳細を見る
      </a>
    </div>
  `
}

/**
 * 地図を初期化してマーカーを配置
 */
const initializeMap = async () => {
  if (!mapContainer.value) return

  try {
    // Google Maps APIの読み込みを待機
    await waitForGoogleMaps()

    // 位置情報を持つ店舗のみフィルタリング
    const shopsWithLocation = props.shops.filter((shop) => shop.lat != null && shop.lng != null)

    if (shopsWithLocation.length === 0) {
      isLoading.value = false
      return
    }

    // 地図を初期化（初期位置は最初の店舗）
    const firstShop = shopsWithLocation[0]!
    map.value = new google.maps.Map(mapContainer.value, {
      center: { lat: firstShop.lat!, lng: firstShop.lng! },
      zoom: 14,
      gestureHandling: 'auto',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    })

    // InfoWindowインスタンスを作成
    infoWindow.value = new google.maps.InfoWindow()

    // 全マーカーを配置
    const bounds = new google.maps.LatLngBounds()
    shopsWithLocation.forEach((shop) => {
      const position = { lat: shop.lat!, lng: shop.lng! }
      const marker = new google.maps.Marker({
        position,
        map: map.value!,
        title: shop.name,
      })

      // マーカークリックでInfoWindow表示
      marker.addListener('click', () => {
        infoWindow.value!.setContent(createInfoWindowContent(shop))
        infoWindow.value!.open(map.value!, marker)
      })

      markers.value.push(marker)
      bounds.extend(position)
    })

    // 全マーカーが収まるように地図を調整
    if (shopsWithLocation.length > 1) {
      map.value.fitBounds(bounds)
    }

    // 地図クリックでInfoWindowを閉じる
    map.value.addListener('click', () => {
      infoWindow.value?.close()
    })

    isLoading.value = false
  } catch (error) {
    console.error('地図の初期化に失敗しました:', error)
    hasError.value = true
    isLoading.value = false
  }
}

/**
 * クリーンアップ
 */
const cleanup = () => {
  // InfoWindowを閉じる
  infoWindow.value?.close()
  infoWindow.value = null

  // マーカーを削除
  markers.value.forEach((marker) => marker.setMap(null))
  markers.value = []

  // 地図インスタンスをクリア
  map.value = null
}

// マウント時に地図を初期化
onMounted(() => {
  if (!apiKey) {
    console.error('Google Maps APIキーが設定されていません')
    hasError.value = true
    isLoading.value = false
    return
  }

  initializeMap()
})

// アンマウント時にクリーンアップ
onUnmounted(() => {
  cleanup()
})

// 店舗リストが変更されたら地図を再初期化
watch(
  () => props.shops,
  () => {
    cleanup()
    initializeMap()
  },
)
</script>

<template>
  <div class="relative" data-test="result-map">
    <!-- ローディング状態 -->
    <div
      v-if="isLoading"
      class="flex h-[600px] items-center justify-center rounded-xl bg-gray-100"
      role="status"
      aria-label="地図を読み込み中"
      data-test="result-map-loading"
    >
      <div class="text-center">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"
        ></div>
        <p class="mt-4 text-sm text-gray-600">地図を読み込んでいます...</p>
      </div>
    </div>

    <!-- エラー状態 -->
    <div
      v-else-if="hasError"
      class="flex h-[600px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50"
      data-test="result-map-error"
    >
      <div class="text-center">
        <p class="text-lg text-gray-600">地図の読み込みに失敗しました</p>
        <p class="mt-2 text-sm text-gray-500">しばらく時間をおいて再度お試しください</p>
      </div>
    </div>

    <!-- 店舗なし状態 -->
    <div
      v-else-if="shops.length === 0"
      class="flex h-[600px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50"
      data-test="result-map-empty"
    >
      <div class="text-center">
        <p class="text-lg text-gray-600">表示する店舗がありません</p>
      </div>
    </div>

    <!-- 地図コンテナ -->
    <div
      v-else
      ref="mapContainer"
      class="h-[600px] w-full rounded-xl shadow-sm ring-1 ring-gray-200"
      data-test="result-map-container"
    ></div>
  </div>
</template>
