<template>
  <div>
    <label for="sf-keyword" class="mb-2 block text-sm font-medium text-gray-700">
      キーワード
    </label>
    <input
      id="sf-keyword"
      :value="modelValue"
      type="text"
      placeholder="店名、料理名など"
      maxlength="100"
      class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
