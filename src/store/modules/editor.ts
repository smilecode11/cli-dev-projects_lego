import {
  textDefaultProps,
  AllComponentProps,
  imageDefaultProps,
} from "@/defaultProps";
import { v4 as uuidv4 } from "uuid";
import { Module } from "vuex";
import { GlobalDataProps } from "../index";

export interface EditorProps {
  //    供中间便器渲染的组件
  components: ComponentProps[];
  //    当前编辑的元素 id
  currentElement?: string;
}

export interface ComponentProps {
  //    元素属性
  //   props: { [key: string]: unknown };
  props: { [key in keyof AllComponentProps]?: AllComponentProps[key] };
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

const editor: Module<EditorProps, GlobalDataProps> = {
  namespaced: true, //  启动命名空间
  state: {
    components: testComponents,
    currentElement: "",
  },
  mutations: {
    addComponent: (state, component: ComponentProps) => {
      state.components.push(component);
    },
    setActive: (state, id) => {
      state.currentElement = id;
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
  },
  getters: {
    getCurrentElement: (state) =>
      state.components.find(
        (component) => component.id === state.currentElement
      ),
  },
};

export default editor;
