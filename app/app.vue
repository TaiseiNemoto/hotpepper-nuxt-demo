<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'ja',
  },
  title: 'HotPepper グルメ検索',
  titleTemplate: '%s | HotPepper グルメ検索',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    {
      name: 'description',
      content:
        'HotPepper Gourmet APIを使った飲食店検索サイト。周辺のお店を探したり、エリアやジャンルで絞り込んで検索できます。',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'HotPepper グルメ検索' },
    { property: 'og:locale', content: 'ja_JP' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
