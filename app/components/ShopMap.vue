<script setup lang="ts">
/// <reference types="@types/google.maps" />
/**
 * 店舗詳細ページの地図表示コンポーネント
 * Google Maps JavaScript APIを利用するため、<ClientOnly>でラップして使用すること
 */
import { escapeHtml } from '~/utils/html'

const props = defineProps<{
  lat?: number | null
  lng?: number | null
  shopName: string
}>()

const { apiKey, waitForGoogleMaps } = useGoogleMaps()

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<google.maps.Map | null>(null)
const marker = ref<google.maps.Marker | null>(null)
const infoWindow = ref<google.maps.InfoWindow | null>(null)

const isLoading = ref(true)
const hasError = ref(false)

const hasLocation = computed(() => {
  const { lat, lng } = props
  const hasLat = typeof lat === 'number' && !Number.isNaN(lat)
  const hasLng = typeof lng === 'number' && !Number.isNaN(lng)
  return hasLat && hasLng
})

const createInfoWindowContent = (shopName: string): string => {
  const safeName = escapeHtml(shopName)
  return `
    <div class="text-base font-semibold text-gray-900" data-test="shop-map-info-window">
      ${safeName}
    </div>
  `
}

const initializeMap = async () => {
  if (!mapContainer.value || !hasLocation.value) {
    isLoading.value = false
    return
  }

  try {
    await waitForGoogleMaps()

    const position = { lat: props.lat!, lng: props.lng! }

    map.value = new google.maps.Map(mapContainer.value, {
      center: position,
      zoom: 15,
      gestureHandling: 'auto',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    })

    marker.value = new google.maps.Marker({
      position,
      map: map.value,
      title: props.shopName,
      label: props.shopName.charAt(0),
    })

    infoWindow.value = new google.maps.InfoWindow({
      content: createInfoWindowContent(props.shopName),
    })

    infoWindow.value.open(map.value, marker.value)

    marker.value.addListener('click', () => {
      infoWindow.value?.open(map.value!, marker.value!)
    })

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

const cleanup = () => {
  infoWindow.value?.close()
  infoWindow.value = null

  marker.value?.setMap(null)
  marker.value = null

  map.value = null
}

onMounted(() => {
  if (!apiKey) {
    console.error('Google Maps APIキーが設定されていません')
    hasError.value = true
    isLoading.value = false
    return
  }

  if (!hasLocation.value) {
    isLoading.value = false
    return
  }

  initializeMap()
})

onUnmounted(() => {
  cleanup()
})

watch(
  () => [props.lat, props.lng, props.shopName],
  () => {
    cleanup()
    hasError.value = false

    if (!apiKey) {
      return
    }

    if (!hasLocation.value) {
      isLoading.value = false
      return
    }

    isLoading.value = true
    initializeMap()
  },
)
</script>

<template>
  <section class="space-y-4" data-test="shop-map">
    <h2 class="text-2xl font-bold text-gray-900">店舗位置</h2>

    <div class="relative">
      <div
        ref="mapContainer"
        class="h-[480px] w-full rounded-2xl shadow-sm ring-1 ring-gray-100"
        data-test="shop-map-container"
        tabindex="0"
      ></div>

      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-100"
        role="status"
        aria-label="地図を読み込み中"
        data-test="shop-map-loading"
      >
        <div class="text-center">
          <div
            class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"
          ></div>
          <p class="mt-4 text-sm text-gray-600">地図を読み込んでいます...</p>
        </div>
      </div>

      <div
        v-else-if="hasError"
        class="absolute inset-0 flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50"
        data-test="shop-map-error"
      >
        <div class="text-center">
          <p class="text-lg text-gray-600">地図の読み込みに失敗しました</p>
          <p class="mt-2 text-sm text-gray-500">しばらく時間をおいて再度お試しください</p>
        </div>
      </div>

      <div
        v-else-if="!hasLocation"
        class="absolute inset-0 flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50"
        data-test="shop-map-no-location"
      >
        <p class="text-lg text-gray-600">位置情報が登録されていません</p>
      </div>
    </div>
  </section>
</template>
