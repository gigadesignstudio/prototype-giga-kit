<script setup lang="ts">
import { cva } from "class-variance-authority";

const props = withDefaults(
  defineProps<{
    as?: string;
    theme?: { typo?: TypoRole; color?: "black" | "grey" };
  }>(),
  { as: "p", theme: () => ({}) },
);

const classes = cva("", {
  variants: {
    typo: {
      base: "typo-base",
      label: "typo-label",
      button: "typo-button",
      link: "typo-link",
      chip: "typo-chip",
      body: "typo-body",
      cell: "typo-cell",
      nav: "typo-nav",
      "footer-link": "typo-footer-link",
      "nav-mobile": "typo-nav-mobile",
      title: "typo-title",
      subtitle: "typo-subtitle",
      intro: "typo-intro",
      headline: "typo-headline",
      "headline-sub": "typo-headline-sub",
    },
    color: {
      black: "text-black",
      grey: "text-grey-500",
    },
  },
  defaultVariants: { typo: "body", color: "black" },
});
</script>

<template>
  <component :is="props.as" :class="cn(classes({ ...props.theme }))">
    <slot />
  </component>
</template>
