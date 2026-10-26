<script setup lang="ts">
const props = withDefaults(defineProps<{ to: string }>(), {});

const external = /^(https?:|mailto:|tel:|#)/.test(props.to);
</script>

<template>
  <a v-if="external" :href="props.to"><slot /></a>
  <RouterLink v-else :to="props.to"><slot /></RouterLink>
</template>
