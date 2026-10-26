<script setup lang="ts">
import { cva } from "class-variance-authority";

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    cta?: { label: string; to: string };
    theme?: "xl" | "l";
  }>(),
  { theme: "l" },
);

const xl = props.theme === "xl";

const classes = cva("flex flex-col s:whitespace-pre-line", {
  variants: {
    theme: {
      xl: "",
      l: "px-text-x",
    },
  },
});
</script>

<template>
  <section class="flex flex-col items-start gap-heading-cta px-page-x">
    <div :class="classes({ theme: props.theme })">
      <ElementsText as="h2" :theme="{ typo: xl ? 'headline' : 'title' }">{{ props.title }}</ElementsText>
      <ElementsText v-if="props.subtitle" :theme="{ typo: xl ? 'headline-sub' : 'subtitle', color: 'grey' }">{{ props.subtitle }}</ElementsText>
    </div>
    <ElementsButton v-if="props.cta" v-bind="props.cta" />
  </section>
</template>
