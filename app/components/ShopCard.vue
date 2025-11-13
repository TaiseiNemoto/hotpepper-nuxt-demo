<template>
  <NuxtLink
    :to="detailPath"
    :aria-label="ariaLabel"
    class="group block focus-visible:outline-none"
    data-test="shop-card-link"
  >
    <article
      class="flex h-full gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-primary-300"
      data-test="shop-card"
    >
      <div
        class="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-100"
        data-test="shop-card-photo"
      >
        <img
          v-if="hasImage"
          :src="imageSrc"
          :alt="altText"
          class="absolute inset-0 h-full w-full object-cover transition duration-200 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div
          v-else
          class="absolute inset-0 flex items-center justify-center text-xs text-gray-400"
          aria-hidden="true"
        >
          画像なし
        </div>
      </div>
      <div class="flex flex-1 flex-col">
        <p class="text-sm font-medium text-primary-600" data-test="shop-card-genre">
          {{ genreLabel }}
        </p>
        <h3 class="mt-1 text-lg font-semibold text-gray-900 truncate" data-test="shop-card-name">
          {{ shop.name }}
        </h3>
        <p
          v-if="catchCopy"
          class="mt-2 text-sm text-gray-600 line-clamp-2"
          data-test="shop-card-catch"
        >
          {{ catchCopy }}
        </p>
        <span class="sr-only">詳細ページへ移動</span>
      </div>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ShopSummary } from '../../server/types/hp-internal'

const props = defineProps<{
  shop: ShopSummary
}>()

const detailPath = computed(() => `/shops/${props.shop.id}`)
const imageSrc = computed(() => props.shop.photo?.m ?? props.shop.photo?.s ?? '')
const hasImage = computed(() => Boolean(imageSrc.value))
const altText = computed(() => `${props.shop.name} の写真`)
const genreLabel = computed(() => props.shop.genre?.name ?? 'ジャンル未設定')
const catchCopy = computed(() => props.shop.catch?.trim() ?? '')
const ariaLabel = computed(() => `${props.shop.name} の詳細を見る`)
</script>
