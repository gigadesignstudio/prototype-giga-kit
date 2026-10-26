<script setup lang="ts">
import { cva } from "class-variance-authority";

const props = withDefaults(
  defineProps<{
    items: any[];
    theme?: "default" | "people";
  }>(),
  { theme: "default" },
);

const classes = cva("grid gap-x-grid-x px-page-x s:grid-cols-4", {
  variants: {
    theme: {
      default: "grid-cols-1 gap-y-grid-y",
      people: "grid-cols-2 gap-y-people-y",
    },
  },
});
</script>

<template>
  <section :class="classes({ theme: props.theme })">
    <ElementsCard v-for="(item, i) in props.items" :key="i" v-bind="item" />
  </section>
</template>
