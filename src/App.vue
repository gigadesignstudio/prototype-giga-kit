<script setup lang="ts">
import Kit from "@/kit/Kit.vue";
</script>

<template>
  <UApp>
    <div id="site" class="min-h-screen bg-white typo-base text-black">
      <LayoutHeader />
      <RouterView />
      <LayoutFooter />
    </div>
    <Kit />
  </UApp>
</template>
