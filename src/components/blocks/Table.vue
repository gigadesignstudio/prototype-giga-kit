<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    columns: { label: string; span: number; icon?: "sort" | "filter"; count?: number }[];
    rows: {
      client: string;
      date: string;
      ongoing?: boolean;
      transformations: string;
      units: string;
      details: string;
      to?: string;
    }[];
  }>(),
  {},
);

const spans = new Map([
  [1, "col-span-1"],
  [2, "col-span-2"],
  [3, "col-span-3"],
]);

const cell = "flex items-center bg-white px-text-x typo-cell group-hover:bg-black group-hover:text-white";
</script>

<template>
  <section class="overflow-x-auto">
    <div class="flex min-w-max flex-col gap-table-head px-page-x s:min-w-0">
      <div class="grid grid-cols-12 gap-x-grid-x">
        <div v-for="column in props.columns" :key="column.label" :class="[spans.get(column.span), 'flex gap-label-gap']">
          <ElementsText
            as="span"
            :theme="{ typo: 'label' }"
            class="flex flex-1 items-end border-t border-black px-text-x"
          >
            {{ column.label }}
          </ElementsText>
          <span
            v-if="column.icon"
            class="flex items-end border-t border-black"
            :class="column.count && 'px-text-x'"
          >
            <ElementsText v-if="column.count" as="span" :theme="{ typo: 'label' }" class="px-text-x">
              {{ column.count }}
            </ElementsText>
            <ElementsImage :src="`/assets/${column.icon}.svg`" />
          </span>
        </div>
      </div>
      <div class="flex flex-col gap-table-row">
        <div v-for="(row, i) in props.rows" :key="i" class="group grid grid-cols-12 gap-x-grid-x">
          <span :class="[cell, 'col-span-2']">{{ row.client }}</span>
          <span :class="cell">
            {{ row.date }}
            <template v-if="row.ongoing">
              <span class="ml-text-x size-dot bg-black group-hover:hidden" />
              <ElementsText as="span" :theme="{ typo: 'chip' }" class="hidden px-text-x text-white group-hover:inline">
                ongoing
              </ElementsText>
            </template>
          </span>
          <span :class="[cell, 'col-span-3']">{{ row.transformations }}</span>
          <span :class="[cell, 'col-span-3']">{{ row.units }}</span>
          <span :class="[cell, 'col-span-3 justify-between']">
            {{ row.details }}
            <ElementsLink
              :to="row.to || '#'"
              class="hidden items-center gap-label-gap typo-link text-white group-hover:flex"
            >
              learn more
              <ElementsImage src="/assets/arrow-row-white.svg" />
            </ElementsLink>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
