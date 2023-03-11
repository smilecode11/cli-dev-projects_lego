import {
  textDefaultProps,
  AllComponentProps,
  imageDefaultProps,
} from "@/defaultProps";
import { v4 as uuidv4 } from "uuid";
import { Module } from "vuex";
import store, { GlobalDataProps } from "../index";
import { cloneDeep } from "lodash-es";
import { message as antdMessage } from "ant-design-vue";

export interface EditorProps {
  //    供中间便器渲染的组件
  components: ComponentProps[];
  //    当前编辑的元素 id
  currentElement?: string;
  //    保存项目的其他信息
  page: PageData;
  //    保存拷贝组件
  copiedComponent?: ComponentProps;
}

export type AllFormProps = AllComponentProps & PageProps;

export interface PageProps {
  backgroundColor: string;
  backgroundImage: string;
  backgroundRepeat: string;
  backgroundSize: string;
  height: string;
}

export interface PageData {
  title: string;
  props: PageProps;
}

export interface ComponentProps {
  //    元素属性
  //   props: { [key: string]: unknown };
  // props: { [key in keyof AllComponentProps]?: AllComponentProps[key] };
  props: Partial<AllComponentProps>;
  //    元素 id: uuidv4 生成
  id: string;
  //    元素名称, 如 l-text, l-image 等
  name: string;
  //  图层是否锁定
  isLocked?: boolean;
  //  图层是否隐藏
  isHidden?: boolean;
  //  图层名称
  layerName?: string;
}

//  测试数据
export const testComponents: ComponentProps[] = [
  {
    id: uuidv4(),
    props: {
      ...textDefaultProps,
      text: "hello",
      fontFamily: "'SimSun','STSong'",
      fontSize: "25px",
      color: "#333333",
      lineHeight: "1",
      textAlign: "right",
    },
    name: "l-text",
    layerName: "图层1",
  },
  {
    id: uuidv4(),
    props: {
      ...textDefaultProps,
      text: "hello2",
      fontFamily: "'KaiTi','STKaiti'",
      fontSize: "15px",
      fontWeight: "bold",
      lineHeight: "2",
      textAlign: "center",
    },
    name: "l-text",
    layerName: "图层2",
  },
  {
    id: uuidv4(),
    props: {
      ...textDefaultProps,
      text: "hello3",
      fontFamily: "'SimHei','STHei'",
      fontSize: "10px",
      actionType: "url",
      url: "https://www.baidu.com",
      textDecoration: "underline",
      color: "blue",
      cursor: "pointer",
      lineHeight: "1.5",
      textAlign: "left",
    },
    layerName: "图层3",
    name: "l-text",
  },
  {
    id: uuidv4(),
    name: "l-image",
    layerName: "图层4",
    props: {
      ...imageDefaultProps,
      src: "http://vue-maker.oss-cn-hangzhou.aliyuncs.com/vue-marker/5f3e3a17c305b1070f455202.jpg",
      width: "100px",
    },
  },
];

const pageDefaultProps = {
  backgroundColor: "#ffffff",
  backgroundImage:
    "url('https://static.imooc-lego.com/upload-files/%E5%B9%BC%E5%84%BF%E5%9B%AD%E8%83%8C%E6%99%AF%E5%9B%BE-994372.jpg')",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  height: "560px",
};

export type MoveDirection = "Up" | "Down" | "Left" | "Right";

const editor: Module<EditorProps, GlobalDataProps> = {
  namespaced: true, //  启动命名空间
  state: {
    components: testComponents,
    currentElement: "",
    page: {
      props: pageDefaultProps,
      title: "test title",
    },
  },
  mutations: {
    addComponent: (state, component: ComponentProps) => {
      state.components.push(component);
    },
    setActive: (state, id) => {
      state.currentElement = id;
    },
    copyComponent: (state, id) => {
      const currentComponent = state.components.find(
        (component) => component.id === id
      );
      if (currentComponent) {
        state.copiedComponent = currentComponent;
        antdMessage.success("已拷贝当前图层", 1);
      }
    },
    pasteCopiedComponent: (state) => {
      if (state.copiedComponent) {
        const newComponent = cloneDeep(state.copiedComponent);
        newComponent.id = uuidv4();
        newComponent.layerName = `${newComponent.layerName}副本`;
        state.components.push(newComponent);
        antdMessage.success("已黏贴当前图层", 1);
      }
    },
    deleteComponent: (state, id) => {
      const currentComponent = state.components.find(
        (component) => component.id === id
      );
      if (currentComponent) {
        state.components = state.components.filter(
          (component) => component.id !== id
        );
        antdMessage.success("删除当前图层成功", 1);
      }
    },
    moveComponent: (
      state,
      data: { direction: MoveDirection; amount: number; id: string }
    ) => {
      const currentComponent = state.components.find(
        (component) => component.id === data.id
      );
      if (currentComponent) {
        const oldTop = parseInt(currentComponent.props.top || "0");
        const oldLeft = parseInt(currentComponent.props.left || "0");
        const { direction, amount } = data;
        switch (direction) {
          case "Up": {
            const newValue = `${oldTop - amount}px`;
            store.commit("editor/updateComponent", {
              key: "top",
              value: newValue,
              id: data.id,
            });
            break;
          }
          case "Down": {
            const newValue = `${oldTop + amount}px`;
            store.commit("editor/updateComponent", {
              key: "top",
              value: newValue,
              id: data.id,
            });
            break;
          }
          case "Left": {
            const newValue = `${oldLeft - amount}px`;
            store.commit("editor/updateComponent", {
              key: "left",
              value: newValue,
              id: data.id,
            });
            break;
          }
          case "Right": {
            const newValue = `${oldLeft + amount}px`;
            store.commit("editor/updateComponent", {
              key: "left",
              value: newValue,
              id: data.id,
            });
            break;
          }
          default:
            break;
        }
      }
    },
    updateComponent: (state, { key, value, id, isRoot }) => {
      const updateComponent = state.components.find(
        (component) => component.id === (id || state.currentElement)
      );
      if (updateComponent) {
        if (isRoot) {
          updateComponent[key] = value;
        } else {
          updateComponent.props[key as keyof AllComponentProps] = value;
        }
      }
    },
    updatePage: (state, { key, value }) => {
      state.page.props[key as keyof PageProps] = value;
    },
  },
  getters: {
    getCurrentElement: (state) =>
      state.components.find(
        (component) => component.id === state.currentElement
      ),
  },
};

export default editor;
