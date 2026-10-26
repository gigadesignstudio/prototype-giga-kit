import base from "../../../tokens/tokens.json";

const tokens = ref(structuredClone(base) as any);
const active = ref<{ type: "spacing" | "color" | "typo"; name: string } | null>(null);
const panel = ref(false);
const picked = ref<any>(null);

export default function useTokens() {
  return { tokens, active, base, panel, picked };
}
