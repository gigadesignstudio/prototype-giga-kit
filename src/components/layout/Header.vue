<script setup lang="ts">
import layout from "@/data/layout.json";

const route = useRoute();
const open = ref(false);

watch(() => route.path, () => (open.value = false));
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-10 bg-white">
    <div class="grid grid-cols-2 items-center gap-x-grid-x px-page-x py-nav-y s:grid-cols-4">
      <ElementsLink to="/" class="px-text-x">
        <ElementsImage :src="layout.header.logo.src" :alt="layout.header.logo.alt" class="w-logo" />
      </ElementsLink>
      <nav class="hidden gap-nav-gap s:col-span-3 s:flex">
        <ElementsLink
          v-for="link in layout.header.nav"
          :key="link.to"
          :to="link.to"
          active-class="bg-black text-white"
          class="p-nav-link typo-nav"
        >
          {{ link.label }}
        </ElementsLink>
      </nav>
      <button class="justify-self-end p-nav-link typo-nav s:hidden" @click="open = !open">
        {{ open ? layout.header.menu.close : layout.header.menu.open }}
      </button>
    </div>
    <nav v-if="open" class="flex flex-col items-start gap-menu-gap px-page-x pb-menu-bottom s:hidden">
      <ElementsLink
        v-for="link in layout.header.nav"
        :key="link.to"
        :to="link.to"
        active-class="bg-black text-white"
        class="p-nav-link typo-nav-mobile"
      >
        {{ link.label }}
      </ElementsLink>
    </nav>
  </header>
</template>
