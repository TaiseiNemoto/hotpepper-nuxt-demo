<script setup lang="ts"></script>

<template>
  <section
    class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 px-12 py-24 text-white shadow-lg"
  >
    <!-- 背景装飾 -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
      <div class="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
    </div>

    <!-- コンテンツ -->
    <div class="relative z-10 mx-auto max-w-4xl text-center">
      <h1 class="mb-4 text-4xl font-bold leading-tight drop-shadow-md">
        HotPepper Gourmet 飲食店検索
      </h1>
      <p class="mb-6 text-3xl font-semibold leading-tight drop-shadow-md">
        あなたにぴったりのお店を見つけよう
      </p>
      <p class="text-xl leading-relaxed text-orange-50 drop-shadow-sm">
        エリアやジャンルから、あなたの好みに合ったお店を簡単に探せます。
      </p>
    </div>
  </section>
</template>
