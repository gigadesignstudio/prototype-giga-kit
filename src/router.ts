import { createRouter, createWebHistory } from "vue-router";
import Page from "@/pages/Page.vue";

const files = import.meta.glob<any>("./data/pages/*.json", { eager: true, import: "default" });

export const pages = new Map(
  Object.entries(files).map(([path, data]) => [path.split("/").pop()!.replace(".json", ""), data]),
);

export default createRouter({
  history: createWebHistory(),
  routes: [
    ...[...pages.keys()].map((slug) => ({
      path: slug === "home" ? "/" : `/${slug}`,
      name: slug,
      component: Page,
      meta: { slug },
    })),
    { path: "/:pathMatch(.*)*", name: "placeholder", component: Page, meta: { slug: "placeholder" } },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
