export const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const plain = (v: any) => v && typeof v === "object" && !("default" in v);

export const merge = (a: any, b: any): any =>
  Object.fromEntries(
    [...new Set([...Object.keys(a), ...Object.keys(b)])].map((k) => [
      k,
      plain(a[k]) && plain(b[k]) ? merge(a[k], b[k]) : (b[k] ?? a[k]),
    ]),
  );
