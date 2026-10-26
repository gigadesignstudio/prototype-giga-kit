<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    min?: number;
    max: number;
    step?: number;
    unit?: string;
    inherited?: boolean;
  }>(),
  { min: 0, step: 1, unit: "", inherited: false },
);

const model = defineModel<number>({ default: 0 });
</script>

<template>
  <div class="flex items-center gap-2" :class="props.inherited && 'opacity-50'">
    <USlider v-model="model" :min="props.min" :max="props.max" :step="props.step" size="xs" class="flex-1" />
    <UInputNumber
      v-model="model"
      :step="props.step"
      :increment="false"
      :decrement="false"
      :format-options="{ maximumFractionDigits: 3 }"
      size="xs"
      class="w-16"
    />
    <span class="w-5 text-xs text-muted">{{ props.unit }}</span>
  </div>
</template>
