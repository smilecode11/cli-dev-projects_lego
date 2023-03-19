import { createStore } from "vuex";
import { UserProps } from "./modules/user";
import { TemplatesProps } from "./modules/templates";
import { EditorProps } from "./modules/editor";
import { GlobalStatus } from "./modules/global";
import user from "./modules/user";
import templates from "./modules/templates";
import editor from "./modules/editor";
import global from "./modules/global";

export interface GlobalDataProps {
  user: UserProps;
  templates: TemplatesProps;
  editor: EditorProps;
  global: GlobalStatus;
}

const store = createStore({
  modules: {
    templates,
    user,
    editor,
    global,
  },
});

export default store;
