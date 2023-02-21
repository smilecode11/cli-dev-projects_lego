import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/home/index.vue";
import LoginView from "../views/login/index.vue";
import TemplateView from "../views/template/index.vue";

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
    path: "/template",
    name: "template",
    component: TemplateView,
  },
  {
    path: "/template-detail/:id",
    name: "template-detail",
    component: () => import("../views/template/detail/index.vue"),
  },
  {
    path: "/editor/:id",
    name: "editor",
    meta: {
      withoutFooter: true,
      withoutHeader: true,
    },
    component: () => import("../views/editor/index.vue"),
  },
  {
    path: "/setting",
    name: "setting",
    component: () => import("../views/setting/index.vue"),
  },
  {
    path: "/works",
    name: "works",
    component: () => import("../views/works/index.vue"),
  },
  {
    path: "/login",
    name: "login",
    meta: {
      withoutHeader: true,
      withoutFooter: true,
    },
    component: LoginView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export const writeRouterFullPath = ["/login", "/home"];

router.beforeEach((to, from, next) => {
  console.log("_router beforeEach", to, from);
  //  TODO: 排除白名单, 其他路由需要验证登录
  if (writeRouterFullPath.includes(to.fullPath)) {
    next();
  } else {
    //  验证登录态
    console.log("TODO: 验证登录态");
    next();
  }
});

export default router;
