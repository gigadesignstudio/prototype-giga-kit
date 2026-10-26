<script setup lang="ts">
import { toCss } from "../../kit/tokens";

const { tokens } = useTokens();
const { css } = useStyleTag("", { id: "live-tokens" });

watch(tokens, (v) => (css.value = toCss(v, true)), { deep: true, immediate: true });
</script>

<template>
  <TokenPanel />
  <ShortcutsPanel />
  <TokenHighlight />
</template>
