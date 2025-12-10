<script setup lang="ts">
import type { Genre } from '../../server/types/hp-internal'

const GENRE_LIMIT = 2

const props = defineProps<{
  modelValue: string[]
  genres: Genre[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const availableGenres = computed(() => {
  return props.genres.filter((g) => !props.modelValue.includes(g.code))
})

const getGenreName = (code: string): string => {
  return props.genres.find((g) => g.code === code)?.name ?? code
}

const addGenre = (event: Event) => {
  const select = event.target as HTMLSelectElement
  const value = select.value

  if (value && props.modelValue.length < GENRE_LIMIT) {
    emit('update:modelValue', [...props.modelValue, value])
    select.value = ''
  }
}

const removeGenre = (code: string) => {
  emit(
    'update:modelValue',
    props.modelValue.filter((c) => c !== code),
  )
}
</script>

<template>
  <div>
    <label for="genre-selector" class="mb-2 block text-sm font-medium text-gray-700">
      ジャンル
      <span class="ml-1 text-xs text-gray-500">(最大{{ GENRE_LIMIT }}件)</span>
    </label>
    <div class="space-y-3">
      <!-- 選択済みジャンルバッジ -->
      <div v-if="modelValue.length > 0" class="flex flex-wrap gap-2">
        <button
          v-for="code in modelValue"
          :key="code"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5 text-sm font-medium text-orange-700 transition hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
          @click="removeGenre(code)"
        >
          <span>{{ getGenreName(code) }}</span>
          <IconsXIcon />
          <span class="sr-only">削除</span>
        </button>
      </div>
      <!-- ジャンル選択ドロップダウン -->
      <select
        id="genre-selector"
        :disabled="modelValue.length >= GENRE_LIMIT"
        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        @change="addGenre"
      >
        <option value="">ジャンルを選択...</option>
        <option v-for="genre in availableGenres" :key="genre.code" :value="genre.code">
          {{ genre.name }}
        </option>
      </select>
    </div>
  </div>
</template>
