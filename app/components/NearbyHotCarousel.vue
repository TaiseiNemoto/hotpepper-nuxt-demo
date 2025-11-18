<template>
  <section v-if="geolocationGranted" class="w-full bg-white py-16" data-test="nearby-hot-carousel">
    <div class="mx-auto max-w-7xl px-12">
      <h2 class="mb-8 text-3xl font-bold text-gray-900">周辺のホットな飲食店</h2>

      <!-- エラー状態 -->
      <div
        v-if="geolocationError"
        class="rounded-xl border border-error bg-error/5 p-6 text-center"
        data-test="nearby-error"
      >
        <p class="text-base text-error">周辺情報の取得に失敗しました</p>
      </div>

      <!-- ローディング状態（スケルトン） -->
      <div v-else-if="isLoading" class="relative" data-test="nearby-loading">
        <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <div
            v-for="i in 10"
            :key="`skeleton-${i}`"
            class="w-80 shrink-0 animate-pulse rounded-2xl bg-gray-200 p-4"
            aria-hidden="true"
          >
            <div class="flex gap-4">
              <div class="aspect-[4/3] w-32 shrink-0 rounded-xl bg-gray-300"></div>
              <div class="flex flex-1 flex-col">
                <div class="h-4 w-20 rounded bg-gray-300"></div>
                <div class="mt-2 h-5 w-full rounded bg-gray-300"></div>
                <div class="mt-2 h-4 w-full rounded bg-gray-300"></div>
                <div class="mt-1 h-4 w-3/4 rounded bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空結果 -->
      <div
        v-else-if="props.shops.length === 0"
        class="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center"
        data-test="nearby-empty"
      >
        <p class="text-base text-gray-600">周辺で該当店舗が見つかりませんでした</p>
      </div>

      <!-- カルーセル -->
      <div v-else class="relative" data-test="nearby-carousel">
        <!-- 前へボタン -->
        <button
          v-if="showPrevButton"
          type="button"
          class="absolute -left-6 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-gray-200 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50"
          :disabled="!canScrollPrev"
          :aria-label="canScrollPrev ? '前の店舗を表示' : '先頭です'"
          data-test="carousel-prev-button"
          @click="scrollPrev"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="h-6 w-6"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <!-- カルーセルコンテナ -->
        <div
          ref="carouselContainer"
          class="flex gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-hide snap-x snap-mandatory"
          data-test="carousel-container"
          @scroll="handleScroll"
        >
          <div
            v-for="shop in props.shops"
            :key="shop.id"
            class="w-80 shrink-0 snap-start"
            :data-test="`carousel-item-${shop.id}`"
          >
            <ShopCard :shop="shop" />
          </div>
        </div>

        <!-- 次へボタン -->
        <button
          v-if="showNextButton"
          type="button"
          class="absolute -right-6 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-gray-200 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50"
          :disabled="!canScrollNext"
          :aria-label="canScrollNext ? '次の店舗を表示' : '末尾です'"
          data-test="carousel-next-button"
          @click="scrollNext"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="h-6 w-6"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ShopSummary } from '../../server/types/hp-internal'

const props = withDefaults(
  defineProps<{
    shops: ShopSummary[]
    isLoading?: boolean
  }>(),
  {
    isLoading: false,
  },
)

const emit = defineEmits<{
  'location-obtained': [location: { lat: number; lng: number }]
}>()

// 位置情報の状態
const geolocationGranted = ref(false)
const geolocationError = ref(false)

// カルーセルの状態
const carouselContainer = ref<HTMLDivElement | null>(null)
const canScrollPrev = ref(false)
const canScrollNext = ref(true)

// ボタンの表示制御（店舗が2件以上の場合のみ表示）
const showPrevButton = computed(() => props.shops.length >= 2)
const showNextButton = computed(() => props.shops.length >= 2)

/**
 * 位置情報を取得する
 */
const requestGeolocation = async () => {
  if (!navigator.geolocation) {
    geolocationGranted.value = false
    return
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5分間キャッシュ
      })
    })

    geolocationGranted.value = true
    geolocationError.value = false

    emit('location-obtained', {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- API結合フェーズ(3.3)でエラーハンドリング実装時に使用予定
  } catch (error) {
    // 位置情報の取得に失敗した場合はセクション全体を非表示にする
    geolocationGranted.value = false
    // geolocationErrorは将来のAPI結合フェーズでデータ取得エラー用に使用
    geolocationError.value = false
  }
}

/**
 * スクロール位置を監視してボタンの活性/非活性を制御
 */
const handleScroll = () => {
  if (!carouselContainer.value) return

  const { scrollLeft, scrollWidth, clientWidth } = carouselContainer.value
  canScrollPrev.value = scrollLeft > 0
  // 浮動小数点の誤差を考慮して-1で判定
  canScrollNext.value = scrollLeft < scrollWidth - clientWidth - 1
}

/**
 * カルーセルアイテムの幅を動的に取得
 */
const getItemWidth = (): number => {
  if (!carouselContainer.value) return 0

  const items = carouselContainer.value.querySelectorAll('[data-test^="carousel-item-"]')
  if (items.length === 0) return 0

  const firstItem = items[0] as HTMLElement
  const itemWidth = firstItem.getBoundingClientRect().width
  const gap = 16 // gap-4 (16px)

  return itemWidth + gap
}

/**
 * 前へスクロール
 */
const scrollPrev = () => {
  if (!carouselContainer.value) return

  const containerWidth = carouselContainer.value.clientWidth
  const itemWidth = getItemWidth()
  if (itemWidth === 0) return

  const scrollAmount = Math.floor(containerWidth / itemWidth) * itemWidth

  carouselContainer.value.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth',
  })
}

/**
 * 次へスクロール
 */
const scrollNext = () => {
  if (!carouselContainer.value) return

  const containerWidth = carouselContainer.value.clientWidth
  const itemWidth = getItemWidth()
  if (itemWidth === 0) return

  const scrollAmount = Math.floor(containerWidth / itemWidth) * itemWidth

  carouselContainer.value.scrollBy({
    left: scrollAmount,
    behavior: 'smooth',
  })
}

// コンポーネントマウント時に位置情報を取得
onMounted(() => {
  requestGeolocation()

  // 初期スクロール位置の更新
  nextTick(() => {
    handleScroll()
  })
})
</script>
