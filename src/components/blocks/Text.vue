<script setup lang="ts">
const props = withDefaults(defineProps<{ text: string }>(), {});
</script>

<template>
  <section class="grid grid-cols-4 gap-x-grid-x px-page-x">
    <ElementsText :theme="{ typo: 'intro' }" class="col-span-4 s:col-span-3">{{ props.text }}</ElementsText>
  </section>
</template>
