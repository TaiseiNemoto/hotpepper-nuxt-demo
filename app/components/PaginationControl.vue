<script setup lang="ts">
/**
 * ページネーションコンポーネント
 * 検索結果のページ切り替えUIを提供する
 */
const props = defineProps<{
  /** 現在のページ番号（1始まり） */
  currentPage: number
  /** 総ページ数 */
  pageCount: number
  /** 総件数（非表示判定用） */
  total: number
}>()

const emit = defineEmits<{
  'update:page': [page: number]
}>()

/** 非表示条件 */
const isHidden = computed(() => props.total === 0 || props.pageCount <= 1)

/** 前へボタンが有効か */
const canGoPrev = computed(() => props.currentPage > 1)

/** 次へボタンが有効か */
const canGoNext = computed(() => props.currentPage < props.pageCount)

/**
 * ウィンドウ表示するページ番号を計算
 * 最大5つのウィンドウ表示（例: [1] … 4 5 6 … 20）
 */
type PageItem = { type: 'page'; value: number; key: string } | { type: 'ellipsis'; key: string }

const pageItems = computed((): PageItem[] => {
  const items: PageItem[] = []
  const current = props.currentPage
  const totalPages = props.pageCount

  if (totalPages <= 7) {
    // 7ページ以下: 全ページ表示
    for (let i = 1; i <= totalPages; i++) {
      items.push({ type: 'page', value: i, key: `page-${i}` })
    }
  } else {
    // 常に最初のページを表示
    items.push({ type: 'page', value: 1, key: 'page-1' })

    if (current <= 4) {
      // 先頭付近: 1 2 3 4 5 … 20
      for (let i = 2; i <= 5; i++) {
        items.push({ type: 'page', value: i, key: `page-${i}` })
      }
      items.push({ type: 'ellipsis', key: 'ellipsis-end' })
    } else if (current >= totalPages - 3) {
      // 末尾付近: 1 … 16 17 18 19 20
      items.push({ type: 'ellipsis', key: 'ellipsis-start' })
      for (let i = totalPages - 4; i <= totalPages - 1; i++) {
        items.push({ type: 'page', value: i, key: `page-${i}` })
      }
    } else {
      // 中央: 1 … 4 5 6 … 20
      items.push({ type: 'ellipsis', key: 'ellipsis-start' })
      for (let i = current - 1; i <= current + 1; i++) {
        items.push({ type: 'page', value: i, key: `page-${i}` })
      }
      items.push({ type: 'ellipsis', key: 'ellipsis-end' })
    }

    // 常に最後のページを表示
    items.push({ type: 'page', value: totalPages, key: `page-${totalPages}` })
  }

  return items
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.pageCount && page !== props.currentPage) {
    emit('update:page', page)
  }
}
</script>

<template>
  <nav
    v-if="!isHidden"
    aria-label="ページネーション"
    class="flex items-center justify-center gap-1"
    data-test="pagination"
  >
    <!-- 前へボタン -->
    <button
      type="button"
      :disabled="!canGoPrev"
      :aria-disabled="!canGoPrev"
      class="flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors"
      :class="
        canGoPrev
          ? 'bg-white text-gray-700 hover:bg-gray-100'
          : 'cursor-not-allowed bg-gray-100 text-gray-400'
      "
      data-test="pagination-prev"
      @click="goToPage(currentPage - 1)"
    >
      <span aria-hidden="true">←</span>
      <span>前へ</span>
    </button>

    <!-- ページ番号 -->
    <div class="flex items-center gap-1">
      <template v-for="item in pageItems" :key="item.key">
        <!-- 省略記号 -->
        <span
          v-if="item.type === 'ellipsis'"
          class="flex h-10 w-10 items-center justify-center text-gray-500"
          aria-hidden="true"
          :data-test="`pagination-${item.key}`"
        >
          …
        </span>
        <!-- ページ番号ボタン -->
        <button
          v-else
          type="button"
          :aria-current="item.value === currentPage ? 'page' : undefined"
          :aria-label="`${item.value}ページ目${item.value === currentPage ? '（現在のページ）' : ''}`"
          class="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors"
          :class="
            item.value === currentPage
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          "
          :disabled="item.value === currentPage"
          :data-test="`pagination-${item.key}`"
          @click="goToPage(item.value)"
        >
          {{ item.value }}
        </button>
      </template>
    </div>

    <!-- 次へボタン -->
    <button
      type="button"
      :disabled="!canGoNext"
      :aria-disabled="!canGoNext"
      class="flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors"
      :class="
        canGoNext
          ? 'bg-white text-gray-700 hover:bg-gray-100'
          : 'cursor-not-allowed bg-gray-100 text-gray-400'
      "
      data-test="pagination-next"
      @click="goToPage(currentPage + 1)"
    >
      <span>次へ</span>
      <span aria-hidden="true">→</span>
    </button>
  </nav>
</template>
