const short = new Map([
  ["font-family", "family"],
  ["font-size", "size"],
  ["line-height", "lh"],
  ["letter-spacing", "ls"],
  ["font-weight", "weight"],
  ["text-transform", "case"],
]);

const formats = new Map([
  ["woff2", "woff2"],
  ["woff", "woff"],
  ["ttf", "truetype"],
  ["otf", "opentype"],
]);

export function toCss(tokens: any, runtime = false) {
  const base: string[] = [];
  const s: string[] = [];
  const vars: string[] = [];
  const add = (target: string[], name: string, value: any) => {
    const v = typeof value === "object" ? value : { default: value };
    target.push(`  ${name}: ${v.default};`);
    if (v.s) s.push(`    ${name}: ${v.s};`);
  };

  Object.entries(tokens.theme.breakpoint).forEach(([k, v]) => base.push(`  --breakpoint-${k}: ${v};`));
  Object.entries(tokens.fonts).forEach(([k, v]: [string, any]) => base.push(`  --font-${k}: ${v["font-family"]};`));
  Object.entries(tokens.theme.color).forEach(([k, v]) =>
    typeof v === "string"
      ? base.push(`  --color-${k}: ${v};`)
      : Object.entries(v as object).forEach(([k2, v2]) => base.push(`  --color-${k}-${k2}: ${v2};`)),
  );
  Object.entries({ ...tokens.theme.spacing, ...tokens.theme.size }).forEach(([k, v]) => add(base, `--spacing-${k}`, v));
  Object.entries(tokens.theme.specific).forEach(([k, v]) => {
    const ref = typeof v === "object" ? (v as any) : { default: v };
    add(base, `--spacing-${k}`, {
      default: `var(--spacing-${ref.default})`,
      ...(ref.s && { s: `var(--spacing-${ref.s})` }),
    });
  });
  Object.entries(tokens.utilities).forEach(([name, props]: [string, any]) =>
    Object.entries(props).forEach(([p, v]) => add(vars, `--${name}-${short.get(p) || p}`, v)),
  );

  const fallbacks = new Map([
    ["family", "inherit"],
    ["size", "inherit"],
    ["lh", "inherit"],
    ["ls", "normal"],
    ["weight", "inherit"],
    ["case", "none"],
  ]);
  Object.entries(tokens.typography || {}).forEach(([role, v]) => {
    const ref = typeof v === "object" ? (v as any) : { default: v };
    fallbacks.forEach((fallback, p) =>
      add(vars, `--typo-${role}-${p}`, {
        default: `var(--typo-${ref.default}-${p}, ${fallback})`,
        ...(ref.s && { s: `var(--typo-${ref.s}-${p}, ${fallback})` }),
      }),
    );
  });

  const roles = Object.keys(tokens.typography || {}).map(
    (role) =>
      `@utility typo-${role} {\n${[...short]
        .map(([p, k]) => `  ${p}: var(--typo-${role}-${k});`)
        .join("\n")}\n}`,
  );

  const utilities = Object.entries(tokens.utilities).map(
    ([name, props]: [string, any]) =>
      `@utility ${name} {\n${Object.keys(props)
        .map((p) => `  ${p}: var(--${name}-${short.get(p) || p});`)
        .join("\n")}\n}`,
  );

  const faces = Object.values(tokens.fonts).flatMap((font: any) =>
    (font.src || []).map(
      (f: any) =>
        `@font-face {\n  font-family: ${font["font-family"].split(",")[0]};\n  src: url("${f.url}") format("${formats.get(f.url.split(".").pop()) || "woff2"}");\n  font-weight: ${f.weight || "normal"};\n  font-style: ${f.style || "normal"};\n  font-display: swap;\n}`,
    ),
  );

  return [
    ...faces,
    `${runtime ? ":root" : "@theme static"} {\n${base.join("\n")}\n}`,
    `:root {\n${vars.join("\n")}\n}`,
    `@media (min-width: ${tokens.theme.breakpoint.s}) {\n  :root {\n${s.join("\n")}\n  }\n}`,
    ...(runtime ? [] : [...utilities, ...roles]),
  ].join("\n\n");
}

export function writeTokens(root: string) {
  const { readFileSync, writeFileSync } = process.getBuiltinModule("node:fs");
  const tokens = JSON.parse(readFileSync(`${root}/tokens/tokens.json`, "utf8"));
  writeFileSync(`${root}/src/assets/tokens.css`, `${toCss(tokens)}\n`);
}

if (typeof process !== "undefined" && process.argv[1] === new URL(import.meta.url).pathname) writeTokens(process.cwd());
