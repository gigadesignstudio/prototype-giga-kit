import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import type { Plugin } from "vite";
import { writeTokens } from "./tokens";

const id = "virtual:kit-blocks";
const resolved = `\0${id}`;
const spacing = "-?(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)";
const scanned = /\/src\/(components\/(blocks|layout|elements)\/[^/]+\.vue|pages\/Page\.vue|App\.vue)$/;

function scan(root: string) {
  const tokens = JSON.parse(readFileSync(`${root}/tokens/tokens.json`, "utf8"));
  const specific = Object.keys(tokens.theme.specific);
  const roles = Object.keys(tokens.typography || {});
  const files = [
    ["Page", ["src/App.vue", "src/pages/Page.vue"]],
    ...["layout", "blocks", "elements"].flatMap((dir) =>
      readdirSync(`${root}/src/components/${dir}`)
        .filter((f) => f.endsWith(".vue") && !(dir === "elements" && f === "Text.vue"))
        .map((f) => [f.replace(".vue", ""), [`src/components/${dir}/${f}`]]),
    ),
  ] as [string, string[]][];

  return files
    .map(([label, paths]) => {
      const code = paths.map((p) => readFileSync(`${root}/${p}`, "utf8")).join("\n");
      const literals = [...code.matchAll(/typo:\s*([^,}]+)/g)].flatMap((m) => [...m[1].matchAll(/["']([\w-]+)["']/g)].map((q) => q[1]));
      return {
        label,
        spacing: specific.filter((name) => new RegExp(`(?:^|[\\s"'\`:])${spacing}-${name}(?=[\\s"'\`])`).test(code)),
        typo: roles.filter((name) => new RegExp(`typo-${name}(?![\\w-])`).test(code) || literals.includes(name)),
      };
    })
    .filter((b) => b.spacing.length || b.typo.length);
}

export default function kit(): Plugin {
  let root = "";
  return {
    name: "kit",
    configResolved: (config) => void (root = config.root),
    buildStart: () => writeTokens(root),
    resolveId: (source) => (source === id ? resolved : undefined),
    load: (source) => (source === resolved ? `export default ${JSON.stringify(scan(root))}` : undefined),
    handleHotUpdate({ file, server, modules }) {
      if (!scanned.test(file) && !file.endsWith("tokens/tokens.json")) return;
      const mod = server.moduleGraph.getModuleById(resolved);
      if (!mod) return;
      server.moduleGraph.invalidateModule(mod);
      return [...modules, mod];
    },
    configureServer(server) {
      const source = `${root}/tokens/tokens.json`;
      const styles = `${root}/styles`;
      server.watcher.add(source);
      server.watcher.on("change", (file) => file === source && writeTokens(root));
      server.middlewares.use("/__styles", async (req, res) => {
        mkdirSync(styles, { recursive: true });
        if (req.method === "POST") {
          let body = "";
          for await (const chunk of req) body += chunk;
          const style = JSON.parse(body);
          writeFileSync(`${styles}/${style.slug}.json`, `${JSON.stringify(style, null, 2)}\n`);
        }
        const list = readdirSync(styles)
          .filter((f) => f.endsWith(".json"))
          .map((f) => JSON.parse(readFileSync(`${styles}/${f}`, "utf8")));
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(list));
      });
    },
  };
}
