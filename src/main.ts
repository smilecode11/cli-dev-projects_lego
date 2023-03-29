import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// import Antd from "ant-design-vue";
import Antd from "./configAntD";
import LegoBricks from "lego-bricks";
const app = createApp(App);

import "ant-design-vue/dist/antd.less";
import "lego-bricks/dist/bundle.css";
import "cropperjs/dist/cropper.css";

// eslint-disable-next-line
// @ts-ignore
app.use(Antd).use(LegoBricks).use(router).use(store);
app.mount("#app"); //  mount 返回 component instance
