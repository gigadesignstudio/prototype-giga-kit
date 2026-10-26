<script setup lang="ts">
type Kind = "spacing" | "typo";
type Box = { x: number; y: number; w: number; h: number; name: string; type?: Kind; outline?: boolean };

const { tokens, active, picked: selected } = useTokens();
const route = useRoute();
const s = useBreakpoints(tokens.value.theme.breakpoint).greaterOrEqual("s");
const shift = useKeyModifier("Shift");
const { width } = useWindowSize();

const site = ref<HTMLElement | null>(null);
const popup = ref<HTMLElement | null>(null);
const boxes = ref<Box[]>([]);
const point = ref<{ x: number; y: number } | null>(null);
const hover = ref<{ name: string; type: Kind; x: number; y: number } | null>(null);
const creating = ref(false);
const draft = ref({ name: "", value: 8 });

const sides = new Map([
  ["", ["top", "right", "bottom", "left"]],
  ["x", ["right", "left"]],
  ["y", ["top", "bottom"]],
  ["t", ["top"]],
  ["r", ["right"]],
  ["b", ["bottom"]],
  ["l", ["left"]],
]);

const resolve = (v: any) => (typeof v === "object" ? (s.value ? (v.s ?? v.default) : v.default) : v);

const roles = (type: string): Record<string, any> | undefined =>
  new Map<string, any>([
    ["spacing", tokens.value.theme.specific],
    ["typo", tokens.value.typography],
  ]).get(type);

const bases = (type: string): Record<string, any> =>
  type === "typo"
    ? Object.fromEntries(Object.entries(tokens.value.utilities).map(([k, v]) => [k.replace("typo-", ""), v]))
    : tokens.value.theme.spacing;

const describe = (type: string, base: string) => {
  const v = bases(type)[base];
  if (!v) return "";
  return type === "typo" ? `${resolve(v["font-size"])}/${resolve(v["line-height"])}` : resolve(v);
};

const options = computed(() => {
  const type = selected.value?.type || "spacing";
  return [
    ...Object.keys(bases(type)).map((name) => ({ label: `${name} · ${describe(type, name)}`, value: name })),
    { type: "separator" as const },
    { label: type === "typo" ? "+ New style" : "+ New spacer", value: "__new" },
  ];
});

const chip = computed(() => {
  if (!hover.value) return "";
  const { name, type } = hover.value;
  const target = resolve(roles(type)![name]);
  return `${name} → ${target} · ${describe(type, target)}`;
});

useStyleTag(computed(() => (hover.value ? "#site, #site * { cursor: pointer !important; }" : "")));

function measure(type: string, names: string[]) {
  if (!site.value || !names.length) return [];
  const pattern = new Map([
    ["spacing", "-?(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y|w|h|size|min-w|max-w|min-h|max-h)"],
    ["color", "(?:bg|text|border|fill|stroke)"],
    ["typo", "typo"],
  ]).get(type);
  const regex = new RegExp(`^(s:)?(${pattern})-(${names.join("|")})$`);
  const found: Box[] = [];

  site.value.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const classes = [...el.classList];
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return;
    classes.forEach((c) => {
      const m = c.match(regex);
      if (!m) return;
      const [, prefix, util, name] = m;
      if (prefix ? !s.value : s.value && classes.some((k) => k.startsWith(`s:${util}-`))) return;
      if (type !== "spacing") return found.push({ x: r.left, y: r.top, w: r.width, h: r.height, name, outline: true });

      const cs = getComputedStyle(el);
      const px = (p: string) => parseFloat(cs.getPropertyValue(p)) || 0;
      const kind = util.replace(/^-/, "");

      if (/^(w|h|size|min-|max-)/.test(kind)) {
        found.push({ x: r.left, y: r.top, w: r.width, h: r.height, name });
      } else if (kind.startsWith("p")) {
        const [bt, br, bb, bl] = ["top", "right", "bottom", "left"].map((sd) => px(`border-${sd}-width`));
        sides.get(kind.slice(1))?.forEach((sd) => {
          const v = px(`padding-${sd}`);
          const strips = new Map([
            ["top", { x: r.left + bl, y: r.top + bt, w: r.width - bl - br, h: v }],
            ["bottom", { x: r.left + bl, y: r.bottom - bb - v, w: r.width - bl - br, h: v }],
            ["left", { x: r.left + bl, y: r.top + bt, w: v, h: r.height - bt - bb }],
            ["right", { x: r.right - br - v, y: r.top + bt, w: v, h: r.height - bt - bb }],
          ]);
          if (v) found.push({ ...strips.get(sd)!, name });
        });
      } else if (kind.startsWith("m")) {
        sides.get(kind.slice(1))?.forEach((sd) => {
          const v = Math.abs(px(`margin-${sd}`));
          const strips = new Map([
            ["top", { x: r.left, y: r.top - v, w: r.width, h: v }],
            ["bottom", { x: r.left, y: r.bottom, w: r.width, h: v }],
            ["left", { x: r.left - v, y: r.top, w: v, h: r.height }],
            ["right", { x: r.right, y: r.top, w: v, h: r.height }],
          ]);
          if (v) found.push({ ...strips.get(sd)!, name });
        });
      } else {
        const kids = [...el.children].map((k) => k.getBoundingClientRect()).filter((k) => k.width || k.height);
        const token = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--spacing-${name}`));
        const column = kind.startsWith("space") ? token : px("column-gap");
        const row = kind.startsWith("space") ? token : px("row-gap");
        if (column && !/-y$/.test(kind))
          kids.forEach((a) =>
            kids
              .filter((b) => Math.abs(b.left - a.right - column) < 1.5 && b.top < a.bottom && b.bottom > a.top)
              .forEach((b) => {
                const top = Math.max(a.top, b.top);
                found.push({ x: a.right, y: top, w: b.left - a.right, h: Math.min(a.bottom, b.bottom) - top, name });
              }),
          );
        if (row && !/-x$/.test(kind)) {
          const rows = [...new Set(kids.map((k) => Math.round(k.top)))].sort((a, b) => a - b);
          const left = r.left + px("padding-left");
          const width = r.width - px("padding-left") - px("padding-right");
          rows.slice(1).forEach((top, i) => {
            const bottom = Math.max(...kids.filter((k) => Math.round(k.top) === rows[i]).map((k) => k.bottom));
            if (top - bottom > 0.5) found.push({ x: left, y: bottom, w: width, h: top - bottom, name });
          });
        }
      }
    });
  });

  return found;
}

function hit(x: number, y: number): Box | undefined {
  const space = measure("spacing", Object.keys(roles("spacing")!))
    .filter((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)
    .sort((a, b) => a.w * a.h - b.w * b.h)[0];
  if (space) return { ...space, type: "spacing" };
  const names = Object.keys(roles("typo")!);
  const el = document
    .elementFromPoint(x, y)
    ?.closest<HTMLElement>(names.map((n) => `.typo-${n}`).join(","));
  if (!el || el === site.value || !site.value?.contains(el)) return;
  const r = el.getBoundingClientRect();
  const name = [...el.classList].find((c) => names.includes(c.slice(5)) && c.startsWith("typo-"))!.slice(5);
  return { x: r.left, y: r.top, w: r.width, h: r.height, name, type: "typo", outline: true };
}

function update() {
  if (point.value) selected.value = hit(point.value.x - scrollX, point.value.y - scrollY) || selected.value;
  if (!active.value) return (boxes.value = []);
  const { type, name } = active.value;
  const map = roles(type);
  const names =
    map && name in bases(type) ? [name, ...Object.keys(map).filter((k) => resolve(map[k]) === name)] : [name];
  boxes.value = measure(type, names);
}

function close() {
  creating.value = false;
  point.value = null;
  selected.value = null;
  active.value = null;
}

function pick(value: string) {
  if (value !== "__new") return assign(value);
  const { type, name } = selected.value!;
  const base = bases(type!)[resolve(roles(type!)![name])];
  draft.value = { name: "", value: parseFloat(resolve(type === "typo" ? base["font-size"] : base)) || 8 };
  creating.value = true;
}

function create() {
  const name = slugify(draft.value.name);
  if (!name) return;
  const { type, name: role } = selected.value!;
  const size = { default: `${draft.value.value}px` };
  if (type === "typo" && !tokens.value.utilities[`typo-${name}`]) {
    const current = tokens.value.utilities[`typo-${resolve(tokens.value.typography[role])}`];
    tokens.value.utilities[`typo-${name}`] = { ...structuredClone(toRaw(current)), "font-size": size };
  }
  if (type === "spacing" && !(name in tokens.value.theme.spacing)) tokens.value.theme.spacing[name] = size;
  assign(name);
  creating.value = false;
}

function assign(value: string) {
  const { type, name } = selected.value!;
  const map = roles(type!)!;
  const current = typeof map[name] === "object" ? map[name] : { default: map[name] };
  map[name] = { ...current, [s.value ? "s" : "default"]: value };
}

onMounted(() => (site.value = document.getElementById("site")));

watch([active, () => route.fullPath, tokens, s], async () => (await nextTick(), update()), {
  deep: true,
  flush: "post",
});

watch(shift, (v) => {
  if (v) return;
  hover.value = null;
  if (!selected.value) active.value = null;
});
watch(() => route.fullPath, close);

useEventListener(
  "mousemove",
  useThrottleFn((e: MouseEvent) => {
    if (!e.shiftKey || selected.value || !site.value?.contains(e.target as Node)) return (hover.value = null);
    const b = hit(e.clientX, e.clientY);
    hover.value = b ? { name: b.name, type: b.type!, x: e.clientX, y: e.clientY } : null;
    active.value = b ? { type: b.type!, name: b.name } : null;
  }, 40),
);

useEventListener(
  "click",
  (e: MouseEvent) => {
    if (!e.shiftKey || !site.value?.contains(e.target as Node)) return;
    e.preventDefault();
    e.stopPropagation();
    const b = hit(e.clientX, e.clientY);
    if (!b) return close();
    hover.value = null;
    creating.value = false;
    point.value = { x: e.pageX, y: e.pageY };
    selected.value = b;
    active.value = { type: b.type!, name: b.name };
  },
  { capture: true },
);

onClickOutside(popup, (e) => !(e as MouseEvent).shiftKey && close());
onKeyStroke("Escape", close);
useResizeObserver(site, update);
useEventListener("scroll", update, { passive: true, capture: true });
useEventListener("resize", update, { passive: true });
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-40">
    <div
      v-for="(b, i) in boxes"
      :key="i"
      class="absolute top-(--y) left-(--x) h-(--h) w-(--w)"
      :class="b.outline ? 'outline-2 -outline-offset-2 outline-[rgb(34,197,94)]' : 'bg-[rgba(34,197,94,0.35)]'"
      :style="{ '--x': `${b.x}px`, '--y': `${b.y}px`, '--w': `${b.w}px`, '--h': `${b.h}px` }"
    />
    <div
      v-if="selected"
      class="absolute top-(--y) left-(--x) h-(--h) w-(--w) outline-2 -outline-offset-2 outline-[rgb(34,197,94)]"
      :style="{
        '--x': `${selected.x}px`,
        '--y': `${selected.y}px`,
        '--w': `${selected.w}px`,
        '--h': `${selected.h}px`,
      }"
    />
    <div
      v-if="selected"
      ref="popup"
      class="pointer-events-auto absolute top-(--y) left-(--x) flex items-center gap-2 rounded-md border border-default bg-default p-1.5 pl-2.5 text-xs text-default shadow-lg"
      :class="selected.y > 48 && '-translate-y-full'"
      :style="{
        '--x': `${Math.max(8, Math.min(selected.x, width - 280))}px`,
        '--y': `${selected.y > 48 ? selected.y - 6 : selected.y + selected.h + 6}px`,
      }"
    >
      <span class="font-mono font-medium text-highlighted">{{ selected.name }}</span>
      <span class="text-muted">{{ s ? "desktop" : "mobile" }}</span>
      <form v-if="creating" class="flex items-center gap-1" @submit.prevent="create">
        <UInput v-model="draft.name" :placeholder="selected.type === 'typo' ? 'style name' : 'name'" size="xs" class="w-24" autofocus />
        <UInputNumber v-model="draft.value" :min="0" :increment="false" :decrement="false" size="xs" class="w-14" />
        <span class="text-muted">px</span>
        <UButton type="submit" label="Add" size="xs" :disabled="!slugify(draft.name)" />
        <UButton label="Cancel" color="neutral" variant="ghost" size="xs" @click="creating = false" />
      </form>
      <USelect
        v-else
        :model-value="resolve(roles(selected.type!)![selected.name])"
        :items="options"
        :portal="false"
        size="xs"
        class="w-36"
        @update:model-value="pick"
      />
    </div>
    <div
      v-if="hover"
      class="absolute top-(--y) left-(--x) rounded bg-[rgb(34,197,94)] px-1.5 py-0.5 font-mono text-xs whitespace-nowrap text-white shadow"
      :style="{ '--x': `${Math.min(hover.x + 14, width - 200)}px`, '--y': `${hover.y + 16}px` }"
    >
      {{ chip }}
    </div>
  </div>
</template>
