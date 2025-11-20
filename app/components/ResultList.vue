<script setup lang="ts">
/**
 * 検索結果の店舗リストを表示するコンポーネント
 * ローディング状態、空結果、店舗リストの3つの状態を切り替えて表示する
 */
import type { ShopSummary } from '../../server/types/hp-internal'

const props = withDefaults(
  defineProps<{
    /** 表示する店舗リスト */
    shops: ShopSummary[]
    /** ローディング状態 */
    isLoading?: boolean
    /** スケルトン表示件数 */
    skeletonCount?: number
  }>(),
  {
    isLoading: false,
    skeletonCount: 10,
  },
)
</script>

<template>
  <div data-test="result-list">
    <!-- ローディング状態（スケルトン） -->
    <div
      v-if="isLoading"
      class="flex flex-col gap-4"
      role="status"
      aria-label="検索結果を読み込み中"
      data-test="result-list-loading"
    >
      <div
        v-for="i in props.skeletonCount"
        :key="`skeleton-${i}`"
        class="animate-pulse rounded-2xl bg-gray-200 p-4"
        aria-hidden="true"
      >
        <div class="flex gap-4">
          <div class="aspect-[4/3] w-32 shrink-0 rounded-xl bg-gray-300"></div>
          <div class="flex flex-1 flex-col">
            <div class="h-4 w-20 rounded bg-gray-300"></div>
            <div class="mt-2 h-5 w-full max-w-xs rounded bg-gray-300"></div>
            <div class="mt-2 h-4 w-full max-w-md rounded bg-gray-300"></div>
            <div class="mt-1 h-4 w-3/4 max-w-sm rounded bg-gray-300"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空結果 -->
    <div
      v-else-if="shops.length === 0"
      class="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center"
      data-test="result-list-empty"
    >
      <p class="text-lg text-gray-600">検索条件に一致する店舗が見つかりませんでした</p>
      <p class="mt-2 text-sm text-gray-500">条件を変更して再検索してください</p>
    </div>

    <!-- 店舗リスト（縦並び） -->
    <ul v-else class="flex flex-col gap-4" data-test="result-list-items">
      <li v-for="shop in shops" :key="shop.id" :data-test="`result-list-item-${shop.id}`">
        <ShopCard :shop="shop" />
      </li>
    </ul>
  </div>
</template>
