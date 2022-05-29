import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/home/index.vue";
import LoginView from "../views/login/index.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/editor",
    name: "Editor",
    component: () => import("../views/editor/index.vue"),
  },
  {
    path: "/about",
    name: "about",
    component: () => import("../views/about/index.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
