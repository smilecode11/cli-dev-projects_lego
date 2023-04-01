import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import IndexView from "../layout/index.vue";
import HomeView from "../views/home/index.vue";
import store from "@/store";
import { message } from "ant-design-vue";

const LoginView = () => import("../views/login/index.vue");
const EditorView = () => import("../views/editor/index.vue");
const TemplateView = () => import("../views/template/index.vue");
const TemplateDetailView = () => import("../views/template/detail/index.vue");

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "IndexPage",
    component: IndexView,
    redirect: "/home",
    children: [
      {
        path: "home",
        name: "HomePage",
        component: HomeView,
        meta: { title: "欢迎到来!", keepAlive: true },
      },
      {
        path: "template-detail/:id",
        name: "TemplateDetailPage",
        component: TemplateDetailView,
        meta: { title: "模版详情", keepAlive: true },
      },
    ],
  },
  {
    path: "/template",
    name: "template",
    component: TemplateView,
  },
  {
    path: "/editor/:id",
    name: "EditorPage",
    meta: {
      withoutFooter: true,
      withoutHeader: true,
      requiredLogin: true,
      title: "编辑我的设计",
    },
    component: EditorView,
  },
  {
    path: "/setting",
    name: "setting",
    meta: {
      requiredLogin: true,
      title: "我的设置",
    },
    component: () => import("../views/setting/index.vue"),
  },
  {
    path: "/works",
    name: "WorksPage",
    meta: {
      requiredLogin: true,
      title: "我的模板",
      keepAlive: true,
    },
    component: () => import("../views/works/index.vue"),
  },
  {
    path: "/login",
    name: "login",
    meta: {
      withoutHeader: true,
      withoutFooter: true,
      disableLoading: true,
      redirectAlreadyLogin: true, //  已登录时需要去首页
      title: "登录到慕课乐高",
    },
    component: LoginView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  // next 逻辑在 vue-router 已经有替代的更好的方案
  //  return '/login' 表示跳转到login页面
  //  return undefined 或者 true 或者没有 return 即表示正常进入下一个路由*
  const { user } = store.state;
  const { token, isLogin } = user;
  const { redirectAlreadyLogin, requiredLogin, title } = to.meta;
  if (title) {
    (document as { [key: string]: any }).title = title;
  }
  if (!isLogin) {
    //  存在 token 时
    if (token) {
      try {
        // 1. 获取用户信息
        await store.dispatch("fetchCurrentUser");
        // 1.1 获取成功, 如果需要跳转首页
        if (redirectAlreadyLogin) {
          return "/";
        }
      } catch (error) {
        // 1.2 获取失败, 清除登录态
        message.error("登陆状态已过期 请重新登陆", 2);
        store.commit("logout");
        return "/login";
      }
    } else {
      if (requiredLogin) {
        return "/login";
      }
    }
  } else {
    if (redirectAlreadyLogin) {
      return "/";
    }
  }
});

export default router;
