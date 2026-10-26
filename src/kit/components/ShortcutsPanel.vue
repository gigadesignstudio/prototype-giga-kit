<script setup lang="ts">
const { panel } = useTokens();
const focused = useActiveElement();

const open = ref(false);

const shortcuts = [
  { keys: ["U"], label: "Open or close the tokens panel" },
  { keys: ["meta", "S"], label: "Save the loaded style (or Default)" },
  { keys: ["meta", "Z"], label: "Undo the last edit" },
  { keys: ["meta", "shift", "Z"], label: "Redo" },
  {
    keys: ["shift"],
    mouse: "hover",
    label: "Show which spacer or text style is under the cursor",
  },
  {
    keys: ["shift"],
    mouse: "click",
    label: "Pick the base spacer or text style",
  },
  { keys: ["esc"], label: "Close the popup" },
  { keys: ["?"], label: "Open or close this list" },
];

onKeyStroke("?", () => {
  if (focused.value?.matches("input, textarea, select, [contenteditable]"))
    return;
  open.value = !open.value;
});
</script>

<template>
  <button
    class="fixed bottom-4 z-40 flex items-center gap-1.5 rounded-md border border-default bg-default py-1 pr-3 pl-1 text-xs font-medium text-muted shadow-md transition-[right] duration-200 hover:text-highlighted"
    :class="panel ? 'right-100' : 'right-4'"
    @click="open = true"
  >
    <UKbd value="?" />
    Shortcuts
  </button>

  <UModal v-model:open="open" title="Shortcuts">
    <template #body>
      <ul class="flex flex-col gap-3 text-sm">
        <li
          v-for="s in shortcuts"
          :key="s.label"
          class="flex items-center justify-between gap-4"
        >
          <span class="text-default">{{ s.label }}</span>
          <span class="flex shrink-0 items-center gap-1">
            <UKbd v-for="k in s.keys" :key="k" :value="k" />
            <span v-if="s.mouse" class="text-xs text-muted"
              >+ {{ s.mouse }}</span
            >
          </span>
        </li>
      </ul>
    </template>
  </UModal>
</template>
