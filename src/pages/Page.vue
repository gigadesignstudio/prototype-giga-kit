<script setup lang="ts">
import { pages } from "@/router";
import layout from "@/data/layout.json";
import BlocksHeading from "@/components/blocks/Heading.vue";
import BlocksText from "@/components/blocks/Text.vue";
import BlocksColumns from "@/components/blocks/Columns.vue";
import BlocksGroups from "@/components/blocks/Groups.vue";
import BlocksTable from "@/components/blocks/Table.vue";

const route = useRoute();

const page = computed(
  () =>
    pages.get(route.meta.slug as string) || {
      title: route.path.slice(1),
      blocks: [{ type: "heading", theme: "xl", title: route.path.slice(1) }],
    },
);

const components = new Map<string, any>([
  ["heading", BlocksHeading],
  ["text", BlocksText],
  ["columns", BlocksColumns],
  ["groups", BlocksGroups],
  ["table", BlocksTable],
]);

const spaces = new Map([
  ["section", "mt-section"],
  ["subsection", "mt-subsection"],
  ["heading-content", "mt-heading-content"],
  ["title-content", "mt-title-content"],
]);

useTitle(() => (route.path === "/" ? layout.site.name : `${page.value.title} — ${layout.site.name}`));
</script>

<template>
  <main class="pt-page-top">
    <component
      :is="components.get(b.type)"
      v-for="(b, i) in page.blocks"
      :key="`${route.path}-${i}`"
      v-bind="b"
      :class="i && spaces.get(b.space || 'section')"
    />
  </main>
</template>
