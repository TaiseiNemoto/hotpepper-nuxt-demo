<script setup lang="ts">
import type { ShopDetail } from '../../server/types/hp-internal'

const props = defineProps<{
  shop: ShopDetail
}>()

const budgetDisplay = computed(() => {
  const { budget } = props.shop
  if (!budget?.name && !budget?.average) return undefined

  if (budget.name && budget.average) {
    return `${budget.name} (平均: ${budget.average})`
  }
  return budget.name ?? budget.average
})

const capacityDisplay = computed(() => {
  const { capacity } = props.shop
  return capacity ? `${capacity}名` : undefined
})
</script>

<template>
  <section
    class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100"
    data-test="shop-info-grid"
  >
    <h2 class="mb-6 text-2xl font-bold text-gray-900" data-test="shop-info-title">基本情報</h2>
    <dl class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div v-if="shop.address" class="flex flex-col gap-1" data-test="shop-info-address">
        <dt class="text-sm font-semibold text-gray-700">住所</dt>
        <dd class="text-base text-gray-900">{{ shop.address }}</dd>
      </div>

      <div v-if="shop.stationName" class="flex flex-col gap-1" data-test="shop-info-station">
        <dt class="text-sm font-semibold text-gray-700">最寄り駅</dt>
        <dd class="text-base text-gray-900">{{ shop.stationName }}</dd>
      </div>

      <div v-if="shop.access" class="flex flex-col gap-1" data-test="shop-info-access">
        <dt class="text-sm font-semibold text-gray-700">アクセス</dt>
        <dd class="text-base text-gray-900">{{ shop.access }}</dd>
      </div>

      <div v-if="shop.open" class="flex flex-col gap-1" data-test="shop-info-open">
        <dt class="text-sm font-semibold text-gray-700">営業時間</dt>
        <dd class="text-base text-gray-900">{{ shop.open }}</dd>
      </div>

      <div v-if="shop.close" class="flex flex-col gap-1" data-test="shop-info-close">
        <dt class="text-sm font-semibold text-gray-700">定休日</dt>
        <dd class="text-base text-gray-900">{{ shop.close }}</dd>
      </div>

      <div v-if="budgetDisplay" class="flex flex-col gap-1" data-test="shop-info-budget">
        <dt class="text-sm font-semibold text-gray-700">予算</dt>
        <dd class="text-base text-gray-900">{{ budgetDisplay }}</dd>
      </div>

      <div v-if="capacityDisplay" class="flex flex-col gap-1" data-test="shop-info-capacity">
        <dt class="text-sm font-semibold text-gray-700">収容人数</dt>
        <dd class="text-base text-gray-900">{{ capacityDisplay }}</dd>
      </div>

      <div v-if="shop.nonSmoking" class="flex flex-col gap-1" data-test="shop-info-nonsmoking">
        <dt class="text-sm font-semibold text-gray-700">禁煙・喫煙</dt>
        <dd class="text-base text-gray-900">{{ shop.nonSmoking }}</dd>
      </div>

      <div v-if="shop.parking" class="flex flex-col gap-1" data-test="shop-info-parking">
        <dt class="text-sm font-semibold text-gray-700">駐車場</dt>
        <dd class="text-base text-gray-900">{{ shop.parking }}</dd>
      </div>

      <div v-if="shop.card" class="flex flex-col gap-1" data-test="shop-info-card">
        <dt class="text-sm font-semibold text-gray-700">カード</dt>
        <dd class="text-base text-gray-900">{{ shop.card }}</dd>
      </div>

      <div v-if="shop.charter" class="flex flex-col gap-1" data-test="shop-info-charter">
        <dt class="text-sm font-semibold text-gray-700">貸切</dt>
        <dd class="text-base text-gray-900">{{ shop.charter }}</dd>
      </div>

      <div v-if="shop.privateRoom" class="flex flex-col gap-1" data-test="shop-info-private-room">
        <dt class="text-sm font-semibold text-gray-700">個室</dt>
        <dd class="text-base text-gray-900">{{ shop.privateRoom }}</dd>
      </div>
    </dl>
  </section>
</template>
