<script setup lang="ts">
import { cva } from "class-variance-authority";

const props = withDefaults(
  defineProps<{
    number?: number;
    label?: string;
    text?: string;
    list?: string[];
    listTheme?: "grey" | "black";
    person?: { name: string; role: string; link?: { label: string; to: string } };
  }>(),
  { listTheme: "grey" },
);

const classes = cva("flex flex-col px-text-x typo-body", {
  variants: {
    listTheme: {
      grey: "text-grey-500",
      black: "text-black",
    },
  },
});
</script>

<template>
  <div class="flex flex-col gap-card-gap">
    <div v-if="props.label" class="flex gap-label-gap">
      <ElementsText
        v-if="props.number"
        as="span"
        :theme="{ typo: 'label' }"
        class="shrink-0 border-t border-black px-text-x"
      >
        {{ props.number }}
      </ElementsText>
      <ElementsText as="span" :theme="{ typo: 'label' }" class="flex-1 border-t border-black px-text-x">
        {{ props.label }}
      </ElementsText>
    </div>
    <div class="flex flex-col gap-card-content">
      <ElementsText v-if="props.text" class="px-text-x">{{ props.text }}</ElementsText>
      <ul v-if="props.list" :class="classes({ listTheme: props.listTheme })">
        <li v-for="(item, i) in props.list" :key="i">{{ item }}</li>
      </ul>
      <div v-if="props.person" class="flex flex-col gap-person-gap">
        <div class="flex flex-col px-text-x">
          <ElementsText>{{ props.person.name }}</ElementsText>
          <ElementsText>{{ props.person.role }}</ElementsText>
        </div>
        <ElementsLink
          v-if="props.person.link"
          :to="props.person.link.to"
          class="self-start border-b border-black px-text-x typo-link"
        >
          {{ props.person.link.label }}
        </ElementsLink>
      </div>
    </div>
  </div>
</template>
