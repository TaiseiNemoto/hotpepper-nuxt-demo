<script setup lang="ts"></script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50 text-gray-900">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
