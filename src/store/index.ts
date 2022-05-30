import { createStore } from "vuex";
import { TemplatesProps } from "./modules/templates";
import { UserProps } from "./modules/user";
import templates from "./modules/templates";
import user from "./modules/user";

export interface GlobalDataProps {
  user: UserProps;
  templates: TemplatesProps;
}

const store = createStore({
  modules: {
    templates,
    user,
  },
});

export default store;
