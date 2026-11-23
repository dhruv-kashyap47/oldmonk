import { createRouter, intentPreload } from "@solidjs/router";
import { lazy } from "solid-js";
import { categories } from "./content/categories";
import HomePage from "./pages/home";

const CategoryPage = lazy(() => import("./pages/category"));

const routes = [
  { path: "/", component: HomePage },
  ...categories.map((category) => ({ path: category.path, component: CategoryPage })),
  { path: "/json-tools", component: lazy(() => import("./pages/topic")) },
  { path: "/about", component: lazy(() => import("./pages/about")) },
  { path: "/privacy", component: lazy(() => import("./pages/privacy")) },
  { path: "/terms", component: lazy(() => import("./pages/terms")) },
  { path: "/contact", component: lazy(() => import("./pages/contact")) },
  { path: "/notices", component: lazy(() => import("./pages/notices")) },
  { path: "/:slug", component: lazy(() => import("./pages/tool")) },
  { path: "*404", component: lazy(() => import("./pages/not-found")) },
];

export const Router = createRouter({
  routes,
  preloadLinks: intentPreload(),
});
