<script setup lang="ts">
import scanned from "virtual:kit-blocks";

const { tokens, active, base, panel: open, picked } = useTokens();
const focused = useActiveElement();
const desktop = useBreakpoints(base.theme.breakpoint).greaterOrEqual("s");

const bp = ref<"default" | "s">(desktop.value ? "s" : "default");
const title = ref("");
const saved = ref<any[]>([]);
const selected = ref<string>();
const toast = useToast();
const snapshot = ref(JSON.stringify(tokens.value));
const dirty = computed(() => JSON.stringify(tokens.value) !== snapshot.value);
const { undo, redo } = useDebouncedRefHistory(tokens, { deep: true, debounce: 300, capacity: 100 });

const tabs = [
  { label: "Mobile", value: "default" },
  { label: `Desktop ≥ ${base.theme.breakpoint.s}`, value: "s" },
];

const groups = [
  { label: "Site variables", value: "site", slot: "site" },
  { label: "Block variables", value: "blocks", slot: "blocks" },
];

const site = [
  { label: "Spacing", value: "spacing", slot: "scale", group: "spacing" },
  { label: "Sizes", value: "size", slot: "scale", group: "size" },
  { label: "Typography", value: "typography", slot: "typography" },
  { label: "Colors", value: "colors", slot: "colors" },
  { label: "Breakpoints", value: "breakpoints", slot: "breakpoints" },
];

const blocks = computed(() => {
  const used = new Set(scanned.flatMap((b) => [...b.spacing, ...b.typo]));
  const other = {
    label: "Other",
    spacing: Object.keys(tokens.value.theme.specific).filter((k) => !used.has(k)),
    typo: Object.keys(tokens.value.typography).filter((k) => !used.has(k)),
  };
  return [...scanned, ...(other.spacing.length || other.typo.length ? [other] : [])].map((b) => ({
    ...b,
    value: b.label,
    slot: "block",
  }));
});

const typeProps = [
  { key: "font-size", label: "size", unit: "px", min: 6, step: 1 },
  {
    key: "line-height",
    label: "line-height",
    unit: "",
    min: 0.8,
    max: 2,
    step: 0.01,
  },
  {
    key: "letter-spacing",
    label: "tracking",
    unit: "em",
    min: -0.1,
    max: 0.1,
    step: 0.001,
  },
  {
    key: "font-weight",
    label: "weight",
    unit: "",
    min: 100,
    max: 900,
    step: 100,
  },
];

const colors = computed(() =>
  Object.entries(tokens.value.theme.color).flatMap(([k, v]: [string, any]) =>
    typeof v === "string"
      ? [{ name: k, parent: tokens.value.theme.color, key: k }]
      : Object.keys(v).map((k2) => ({ name: `${k}-${k2}`, parent: v, key: k2 }))
  )
);

onKeyStroke(
  (e) => (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s",
  async (e) => {
    e.preventDefault();
    const style = saved.value.find((s) => s.slug === selected.value) ?? { title: "Default" };
    title.value = style.title;
    await save();
    toast.add({ title: `Saved “${style.title}”`, duration: 1500 });
  }
);

onKeyStroke(
  (e) => (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z",
  (e) => {
    if (focused.value?.matches("textarea, input:not([inputmode])")) return;
    e.preventDefault();
    (e.shiftKey ? redo : undo)();
  },
);

onKeyStroke("Escape", () => {
  if (!picked.value) open.value = false;
});

useEventListener("beforeunload", (e: BeforeUnloadEvent) => {
  if (!dirty.value) return;
  e.preventDefault();
  e.returnValue = "";
});

onKeyStroke(["u", "U"], () => {
  if (focused.value?.matches("input, textarea, select, [contenteditable]"))
    return;
  open.value = !open.value;
});

function rows(block: { spacing: string[]; typo: string[] }) {
  return [
    ...block.spacing.map((name) => ({
      type: "spacing" as const,
      name,
      map: tokens.value.theme.specific,
      options: Object.keys(tokens.value.theme.spacing),
    })),
    ...block.typo.map((name) => ({
      type: "typo" as const,
      name,
      map: tokens.value.typography,
      options: Object.keys(tokens.value.utilities).map((k) => k.replace("typo-", "")),
    })),
  ];
}

function read(v: any) {
  return parseFloat(typeof v === "object" ? v[bp.value] ?? v.default : v);
}

function inherited(v: any) {
  return bp.value === "s" && (typeof v !== "object" || v.s == null);
}

function write(target: any, key: string, n: number, unit = "") {
  const v =
    typeof target[key] === "object" ? target[key] : { default: target[key] };
  target[key] = { ...v, [bp.value]: `${n ?? 0}${unit}` };
}

function inherit(target: any, key: string) {
  const { s, ...rest } = target[key];
  target[key] = rest;
}

async function load() {
  const res = await fetch("/__styles");
  const remote = res.headers.get("content-type")?.includes("json")
    ? await res.json()
    : [];
  const local = Object.keys(localStorage)
    .filter((k) => k.startsWith("styles:"))
    .map((k) => JSON.parse(localStorage.getItem(k)!));
  saved.value = [
    ...new Map([...local, ...remote].map((s) => [s.slug, s])).values(),
  ];
}

async function save() {
  const slug = slugify(title.value);
  if (!slug) return;
  const style = { title: title.value, slug, tokens: tokens.value };
  localStorage.setItem(`styles:${slug}`, JSON.stringify(style));
  await fetch("/__styles", { method: "POST", body: JSON.stringify(style) });
  await load();
  selected.value = slug;
  snapshot.value = JSON.stringify(tokens.value);
}

function reset() {
  tokens.value = structuredClone(base);
  selected.value = undefined;
}

function download() {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(tokens.value, null, 2)], {
      type: "application/json",
    })
  );
  a.download = `${slugify(title.value) || "tokens"}.json`;
  a.click();
}

watch(selected, (slug) => {
  const style = saved.value.find((s) => s.slug === slug);
  if (!style) return;
  tokens.value = merge(
    structuredClone(base),
    structuredClone(toRaw(style.tokens))
  );
  title.value = style.title;
  snapshot.value = JSON.stringify(tokens.value);
});

onMounted(async () => {
  await load();
  if (saved.value.some((s) => s.slug === "default")) selected.value = "default";
});
</script>

<template>
  <Transition
    enter-active-class="transition-transform duration-200"
    leave-active-class="transition-transform duration-200"
    enter-from-class="translate-x-full"
    leave-to-class="translate-x-full"
  >
    <aside
      v-if="open"
      class="fixed inset-y-0 right-0 z-50 flex w-96 flex-col border-l border-default bg-default text-sm text-default shadow-xl"
    >
      <div class="flex flex-col gap-2 border-b border-default px-4 py-3">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-highlighted">Tokens</span>
          <UKbd value="U" />
        </div>
        <UTabs
          v-model="bp"
          :items="tabs"
          :content="false"
          size="sm"
          class="w-full"
        />
        <p v-if="(bp === 's') !== desktop" class="text-xs text-warning">
          The window is {{ desktop ? "desktop" : "mobile" }}: edits on this tab
          won't show until you resize.
        </p>
      </div>

      <div class="flex-1 overflow-y-auto px-4">
        <UAccordion
          type="multiple"
          :items="groups"
          :default-value="['site']"
          :ui="{ label: 'text-xs font-semibold tracking-wide uppercase', body: 'pt-0 pl-3' }"
        >
          <template #site-body>
            <UAccordion type="multiple" :items="site" :default-value="['spacing', 'typography']">
              <template #scale-body="{ item }">
                <div class="flex flex-col gap-4">
                  <div v-for="group in [item.group]" :key="group" class="flex flex-col gap-2">
                    <div
                      v-for="(value, name) in tokens.theme[group]"
                      :key="name"
                      class="flex flex-col gap-0.5"
                      @mouseenter="active = { type: 'spacing', name }"
                      @mouseleave="active = null"
                      @focusin="active = { type: 'spacing', name }"
                      @focusout="active = null"
                    >
                      <div class="flex items-center justify-between">
                        <span
                          class="font-mono text-xs"
                          :class="active?.name === name && 'text-primary'"
                          >{{ name }}</span
                        >
                        <span v-if="inherited(value)" class="text-xs text-muted"
                          >inherits mobile</span
                        >
                        <UButton
                          v-else-if="bp === 's'"
                          label="use mobile"
                          color="neutral"
                          variant="link"
                          size="xs"
                          class="p-0"
                          @click="inherit(tokens.theme[group], name)"
                        />
                      </div>
                      <TokenRange
                        :model-value="read(value)"
                        :max="Math.max(64, read((base.theme as any)[group][name] ?? value) * 2)"
                        unit="px"
                        :inherited="inherited(value)"
                        @update:model-value="
                          (n) => write(tokens.theme[group], name, n, 'px')
                        "
                      />
                    </div>
                  </div>
                </div>
          </template>

          <template #colors-body>
            <div class="flex flex-col gap-1">
              <p class="mb-1 text-xs text-muted">
                Colors are the same on mobile and desktop.
              </p>
              <div
                v-for="c in colors"
                :key="c.name"
                class="grid grid-cols-[6rem_2rem_1fr] items-center gap-2"
                @mouseenter="active = { type: 'color', name: c.name }"
                @mouseleave="active = null"
                @focusin="active = { type: 'color', name: c.name }"
                @focusout="active = null"
              >
                <span
                  class="font-mono text-xs"
                  :class="active?.name === c.name && 'text-primary'"
                  >{{ c.name }}</span
                >
                <UPopover>
                  <button
                    class="size-7 rounded border border-default"
                    :style="{ background: c.parent[c.key] }"
                  />
                  <template #content>
                    <UColorPicker
                      v-model="c.parent[c.key]"
                      format="rgb"
                      class="p-2"
                    />
                  </template>
                </UPopover>
                <UInput v-model="c.parent[c.key]" size="xs" />
              </div>
            </div>
          </template>

          <template #typography-body>
            <div class="flex flex-col gap-4">
              <div
                v-for="(style, name) in tokens.utilities"
                :key="name"
                class="flex flex-col gap-1"
                @mouseenter="
                  active = {
                    type: 'typo',
                    name: String(name).replace('typo-', ''),
                  }
                "
                @mouseleave="active = null"
                @focusin="
                  active = {
                    type: 'typo',
                    name: String(name).replace('typo-', ''),
                  }
                "
                @focusout="active = null"
              >
                <span
                  class="font-mono text-xs"
                  :class="
                    active?.name === String(name).replace('typo-', '') &&
                    'text-primary'
                  "
                >
                  {{ name }}
                </span>
                <div
                  v-for="p in typeProps"
                  :key="p.key"
                  class="grid grid-cols-[4.5rem_1fr] items-center gap-2"
                >
                  <button
                    v-if="bp === 's' && !inherited(style[p.key])"
                    class="text-left text-xs text-muted underline"
                    title="Use mobile value"
                    @click="inherit(style, p.key)"
                  >
                    {{ p.label }}
                  </button>
                  <span v-else class="text-xs text-muted">{{ p.label }}</span>
                  <TokenRange
                    :model-value="read(style[p.key])"
                    :min="p.min"
                    :max="p.max ?? Math.max(64, read((base.utilities as any)[name]?.[p.key] ?? style[p.key]) * 2)"
                    :step="p.step"
                    :unit="p.unit"
                    :inherited="inherited(style[p.key])"
                    @update:model-value="(n) => write(style, p.key, n, p.unit)"
                  />
                </div>
              </div>
            </div>
          </template>

          <template #breakpoints-body>
            <div
              v-for="(value, name) in tokens.theme.breakpoint"
              :key="name"
              class="flex flex-col gap-0.5"
            >
              <span class="font-mono text-xs">{{ name }}</span>
              <TokenRange
                :model-value="parseFloat(value)"
                :min="320"
                :max="1920"
                unit="px"
                @update:model-value="
                  (n) => (tokens.theme.breakpoint[name] = `${n || 0}px`)
                "
              />
            </div>
            <p class="mt-2 text-xs text-muted">
              Moves the token media queries only; s: classes keep the built
              breakpoint.
            </p>
          </template>
        </UAccordion>
          </template>

          <template #blocks-body>
            <p class="text-xs text-muted">Usually edited on the page with Shift + click.</p>
            <UAccordion type="multiple" :items="blocks">
              <template #block-body="{ item }">
                <div class="flex flex-col gap-1">
                  <div
                    v-for="row in rows(item)"
                    :key="`${row.type}-${row.name}`"
                    class="grid grid-cols-[1.25rem_1fr_7.5rem] items-center gap-2"
                    @mouseenter="active = { type: row.type, name: row.name }"
                    @mouseleave="active = null"
                    @focusin="active = { type: row.type, name: row.name }"
                    @focusout="active = null"
                  >
                    <span class="text-center text-[10px] text-dimmed">{{ row.type === "typo" ? "Aa" : "↔" }}</span>
                    <div class="flex flex-col">
                      <span class="font-mono text-xs" :class="active?.name === row.name && 'text-primary'">{{ row.name }}</span>
                      <span v-if="inherited(row.map[row.name])" class="text-xs text-muted">inherits mobile</span>
                      <button
                        v-else-if="bp === 's'"
                        class="self-start text-xs text-muted underline"
                        @click="inherit(row.map, row.name)"
                      >
                        use mobile
                      </button>
                    </div>
                    <USelect
                      :model-value="
                        typeof row.map[row.name] === 'object'
                          ? (row.map[row.name][bp] ?? row.map[row.name].default)
                          : row.map[row.name]
                      "
                      :items="row.options"
                      size="xs"
                      :class="inherited(row.map[row.name]) && 'opacity-50'"
                      @update:model-value="(v) => write(row.map, row.name, v)"
                    />
                  </div>
                </div>
          </template>
        </UAccordion>
          </template>
        </UAccordion>
      </div>

      <div class="flex flex-col gap-2 border-t border-default p-4">
        <div class="flex gap-2">
          <UInput
            v-model="title"
            placeholder="Style title"
            size="sm"
            class="flex-1"
            @keydown.enter="save"
          />
          <UButton
            label="Save style"
            size="sm"
            :disabled="!slugify(title)"
            @click="save"
          />
        </div>
        <USelect
          v-model="selected"
          :items="saved"
          value-key="slug"
          label-key="title"
          placeholder="Load saved style"
          size="sm"
        />
        <div class="flex gap-2">
          <UButton
            label="Reset"
            color="neutral"
            variant="outline"
            size="sm"
            class="flex-1 justify-center"
            @click="reset"
          />
          <UButton
            label="Download JSON"
            color="neutral"
            variant="outline"
            size="sm"
            class="flex-1 justify-center"
            @click="download"
          />
        </div>
      </div>
    </aside>
  </Transition>

</template>
