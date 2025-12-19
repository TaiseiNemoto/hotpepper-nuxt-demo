<script setup lang="ts">
import { AREA_LIMITS, useAreaSelection } from '../composables/useAreaSelection'
import type { LargeArea } from '../../server/types/hp-internal'

const props = defineProps<{
  largeAreas: LargeArea[]
}>()

const emit = defineEmits<{
  'update:selectedLargeAreas': [value: string[]]
  'update:selectedMiddleAreas': [value: string[]]
  'update:selectedSmallAreas': [value: string[]]
}>()

const {
  selectedLargeAreas,
  selectedMiddleAreas,
  selectedSmallAreas,
  availableLargeAreas,
  availableMiddleAreas,
  availableSmallAreas,
  isLoadingMiddle,
  isLoadingSmall,
  getLargeAreaName,
  getMiddleAreaName,
  getSmallAreaName,
  addLargeAreaByCode,
  addMiddleAreaByCode,
  addSmallAreaByCode,
  removeLargeArea,
  removeMiddleArea,
  removeSmallArea,
} = useAreaSelection(props.largeAreas)

// 選択された値を親に通知
watch(selectedLargeAreas, (newValue) => {
  emit('update:selectedLargeAreas', newValue)
})

watch(selectedMiddleAreas, (newValue) => {
  emit('update:selectedMiddleAreas', newValue)
})

watch(selectedSmallAreas, (newValue) => {
  emit('update:selectedSmallAreas', newValue)
})
</script>

<template>
  <div>
    <label class="mb-2 block text-sm font-medium text-gray-700">エリア</label>
    <div class="space-y-3">
      <!-- 選択済みエリアバッジ -->
      <div
        v-if="
          selectedLargeAreas.length > 0 ||
          selectedMiddleAreas.length > 0 ||
          selectedSmallAreas.length > 0
        "
        class="flex flex-wrap gap-2"
      >
        <button
          v-for="code in selectedLargeAreas"
          :key="'large-' + code"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          @click="removeLargeArea(code)"
        >
          <span>{{ getLargeAreaName(code) }}</span>
          <IconsXIcon />
          <span class="sr-only">削除</span>
        </button>
        <button
          v-for="code in selectedMiddleAreas"
          :key="'middle-' + code"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 transition hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300"
          @click="removeMiddleArea(code)"
        >
          <span>{{ getMiddleAreaName(code) }}</span>
          <IconsXIcon />
          <span class="sr-only">削除</span>
        </button>
        <button
          v-for="code in selectedSmallAreas"
          :key="'small-' + code"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700 transition hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
          @click="removeSmallArea(code)"
        >
          <span>{{ getSmallAreaName(code) }}</span>
          <IconsXIcon />
          <span class="sr-only">削除</span>
        </button>
      </div>

      <!-- 大エリア選択 -->
      <div>
        <label for="sf-large-area" class="mb-1 block text-xs font-medium text-gray-600">
          大エリア
          <span class="ml-1 text-xs text-gray-500">(最大{{ AREA_LIMITS.LARGE_AREAS }}件)</span>
        </label>
        <select
          id="sf-large-area"
          :disabled="selectedLargeAreas.length >= AREA_LIMITS.LARGE_AREAS"
          class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          @change="
            (e) => {
              const target = e.target as HTMLSelectElement
              addLargeAreaByCode(target.value)
              target.value = ''
            }
          "
        >
          <option value="">大エリアを選択...</option>
          <option v-for="area in availableLargeAreas" :key="area.code" :value="area.code">
            {{ area.name }}
          </option>
        </select>
      </div>

      <!-- 中エリア選択 -->
      <div>
        <label for="sf-middle-area" class="mb-1 block text-xs font-medium text-gray-600">
          中エリア
          <span class="ml-1 text-xs text-gray-500">(最大{{ AREA_LIMITS.MIDDLE_AREAS }}件)</span>
        </label>
        <select
          id="sf-middle-area"
          :disabled="
            selectedLargeAreas.length === 0 ||
            selectedMiddleAreas.length >= AREA_LIMITS.MIDDLE_AREAS ||
            isLoadingMiddle
          "
          class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          @change="
            (e) => {
              const target = e.target as HTMLSelectElement
              addMiddleAreaByCode(target.value)
              target.value = ''
            }
          "
        >
          <option value="">
            {{ isLoadingMiddle ? '読み込み中...' : '中エリアを選択...' }}
          </option>
          <option v-for="area in availableMiddleAreas" :key="area.code" :value="area.code">
            {{ area.name }}
          </option>
        </select>
      </div>

      <!-- 小エリア選択 -->
      <div>
        <label for="sf-small-area" class="mb-1 block text-xs font-medium text-gray-600">
          小エリア
          <span class="ml-1 text-xs text-gray-500">(最大{{ AREA_LIMITS.SMALL_AREAS }}件)</span>
        </label>
        <select
          id="sf-small-area"
          :disabled="
            selectedMiddleAreas.length === 0 ||
            selectedSmallAreas.length >= AREA_LIMITS.SMALL_AREAS ||
            isLoadingSmall
          "
          class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          @change="
            (e) => {
              const target = e.target as HTMLSelectElement
              addSmallAreaByCode(target.value)
              target.value = ''
            }
          "
        >
          <option value="">
            {{ isLoadingSmall ? '読み込み中...' : '小エリアを選択...' }}
          </option>
          <option v-for="area in availableSmallAreas" :key="area.code" :value="area.code">
            {{ area.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
