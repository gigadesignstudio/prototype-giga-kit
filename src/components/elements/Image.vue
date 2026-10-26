<script setup lang="ts">
const props = withDefaults(defineProps<{ src: string; alt?: string }>(), { alt: "" });
</script>

<template>
  <img :src="props.src" :alt="props.alt" class="block" />
</template>
