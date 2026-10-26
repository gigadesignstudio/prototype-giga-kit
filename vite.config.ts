import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ui from "@nuxt/ui/vite";
import kit from "./kit/vite";

export default defineConfig({
  plugins: [
    kit(),
    vue(),
    ui({
      colorMode: false,
      autoImport: {
        imports: ["vue", "vue-router", "@vueuse/core"],
        dirs: ["src/composables", "src/utils", "src/kit/composables", "src/kit/utils"],
        dts: "src/auto-imports.d.ts",
        vueTemplate: true,
      },
      components: {
        dirs: ["src/components", "src/kit/components"],
        directoryAsNamespace: true,
        dts: "src/components.d.ts",
      },
    }),
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: { watch: { ignored: [fileURLToPath(new URL("./styles/**", import.meta.url))] } },
});
