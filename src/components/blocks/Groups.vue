<script setup lang="ts">
const props = withDefaults(
  defineProps<{ groups: { title: string; items: any[] }[] }>(),
  {},
);
</script>

<template>
  <section class="grid grid-cols-1 gap-x-grid-x gap-y-groups-y px-page-x s:grid-cols-2">
    <div v-for="(group, i) in props.groups" :key="i" class="flex flex-col gap-title-content">
      <ElementsText as="h3" :theme="{ typo: 'title' }">{{ group.title }}</ElementsText>
      <div class="grid grid-cols-2 gap-x-grid-x gap-y-grid-y">
        <ElementsCard v-for="(item, j) in group.items" :key="j" v-bind="item" />
      </div>
    </div>
  </section>
</template>
