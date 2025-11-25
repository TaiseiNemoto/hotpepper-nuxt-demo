<script setup lang="ts">
import type { ShopDetail } from '../../server/types/hp-internal'

const props = defineProps<{
  shop: ShopDetail
}>()

const imageSrc = computed(() => props.shop.photo?.l ?? '')
const hasImage = computed(() => Boolean(imageSrc.value))
const altText = computed(() => `${props.shop.name} の写真`)
const genreLabel = computed(() => props.shop.genre?.name ?? 'ジャンル未設定')
const catchCopy = computed(() => props.shop.catch?.trim() ?? '')
</script>

<template>
  <article
    class="flex gap-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100"
    data-test="shop-header"
  >
    <div
      class="relative aspect-[4/3] w-80 shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-100"
      data-test="shop-header-photo"
    >
      <img
        v-if="hasImage"
        :src="imageSrc"
        :alt="altText"
        class="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
      <div
        v-else
        class="absolute inset-0 flex items-center justify-center text-sm text-gray-400"
        aria-hidden="true"
      >
        画像なし
      </div>
    </div>
    <div class="flex flex-1 flex-col">
      <p class="text-base font-medium text-orange-600" data-test="shop-header-genre">
        {{ genreLabel }}
      </p>
      <h1 class="mt-2 truncate text-4xl font-bold text-gray-900" data-test="shop-header-name">
        {{ shop.name }}
      </h1>
      <p
        v-if="catchCopy"
        class="mt-4 line-clamp-2 text-base text-gray-600"
        data-test="shop-header-catch"
      >
        {{ catchCopy }}
      </p>
    </div>
  </article>
</template>
