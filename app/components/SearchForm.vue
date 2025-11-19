<script setup lang="ts">
import type { Genre, LargeArea, MiddleArea, SmallArea } from '../../server/types/hp-internal'

// Props定義
defineProps<{
  genres: Genre[]
  largeAreas: LargeArea[]
  middleAreas: MiddleArea[]
  smallAreas: SmallArea[]
}>()

// Reactive state 定義
const keyword = ref<string>('')
const selectedGenres = ref<string[]>([])
const selectedLargeAreas = ref<string[]>([])
const selectedMiddleAreas = ref<string[]>([])
const selectedSmallAreas = ref<string[]>([])

// 検索ボタンの無効化判定
const isSearchDisabled = computed(() => {
  // すべてのフィールドが空の場合は検索不可
  return (
    keyword.value.trim() === '' &&
    selectedGenres.value.length === 0 &&
    selectedLargeAreas.value.length === 0 &&
    selectedMiddleAreas.value.length === 0 &&
    selectedSmallAreas.value.length === 0
  )
})

// 検索実行処理
const handleSubmit = () => {
  if (isSearchDisabled.value) return

  // URLクエリを構築
  const query: Record<string, string> = {}

  const trimmedKeyword = keyword.value.trim()
  if (trimmedKeyword) {
    query.q = trimmedKeyword
  }

  if (selectedGenres.value.length > 0) {
    query.genres = selectedGenres.value.join(',')
  }

  if (selectedLargeAreas.value.length > 0) {
    query.area_l = selectedLargeAreas.value.join(',')
  }

  if (selectedMiddleAreas.value.length > 0) {
    query.area_m = selectedMiddleAreas.value.join(',')
  }

  if (selectedSmallAreas.value.length > 0) {
    query.area_s = selectedSmallAreas.value.join(',')
  }

  // 検索結果ページへ遷移
  navigateTo({
    path: '/shops',
    query,
  })
}
</script>

<template>
  <section class="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
    <h2 class="mb-6 text-xl font-semibold text-gray-900">店舗を検索</h2>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <!-- キーワード入力フィールド -->
      <SearchKeywordField v-model="keyword" />

      <!-- ジャンル選択UI -->
      <SearchGenreSelector v-model="selectedGenres" :genres="genres" />

      <!-- エリア選択UI -->
      <SearchAreaSelector
        :large-areas="largeAreas"
        :middle-areas="middleAreas"
        :small-areas="smallAreas"
        @update:selected-large-areas="selectedLargeAreas = $event"
        @update:selected-middle-areas="selectedMiddleAreas = $event"
        @update:selected-small-areas="selectedSmallAreas = $event"
      />

      <!-- 検索ボタン -->
      <div>
        <button
          type="submit"
          :disabled="isSearchDisabled"
          class="w-full rounded-lg bg-orange-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          検索
        </button>
      </div>
    </form>
  </section>
</template>
