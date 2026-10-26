<script setup lang="ts">
import layout from "@/data/layout.json";
</script>

<template>
  <footer class="mt-section grid grid-cols-2 gap-x-grid-x gap-y-footer-y px-page-x pb-page-bottom s:grid-cols-4">
    <div class="col-span-full flex flex-col items-start gap-heading-cta">
      <div class="flex flex-col">
        <ElementsText :theme="{ typo: 'title' }">{{ layout.footer.title }}</ElementsText>
        <ElementsText :theme="{ typo: 'subtitle', color: 'grey' }">{{ layout.footer.subtitle }}</ElementsText>
      </div>
      <ElementsButton v-bind="layout.footer.cta" />
    </div>
    <div v-for="(column, i) in layout.footer.columns" :key="i" class="flex flex-col">
      <ElementsText :theme="{ typo: 'label' }" class="px-text-x">{{ column.label }}</ElementsText>
      <div class="flex flex-col items-start px-text-x py-footer-links-y">
        <ElementsLink v-for="(link, j) in column.links" :key="j" :to="link.to" class="typo-footer-link">
          {{ link.label }}
        </ElementsLink>
      </div>
    </div>
  </footer>
</template>
