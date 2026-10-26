<script setup lang="ts">
const props = withDefaults(defineProps<{ label: string; to: string }>(), {});
</script>

<template>
  <ElementsLink :to="props.to" class="inline-flex border border-black">
    <ElementsText as="span" :theme="{ typo: 'button' }" class="px-button-x py-button-y">
      {{ props.label }}
    </ElementsText>
    <span class="flex items-center px-button-icon-x py-button-y">
      <ElementsImage src="/assets/arrow.svg" />
    </span>
  </ElementsLink>
</template>
