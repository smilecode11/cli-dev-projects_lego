import { Module } from "vuex";
import { message as antdMessage } from "ant-design-vue";
import { v4 as uuidv4 } from "uuid";
import { cloneDeep } from "lodash-es";
import store, { GlobalDataProps } from "../index";
import { insertAt } from "@/helper";
import {
  textDefaultProps,
  AllComponentProps,
  imageDefaultProps,
} from "@/defaultProps";

export interface HistoryProps {
  id: string;
  componentId: string;
  type: "add" | "delete" | "modify";
  data: any;
  index?: number;
}

export interface EditorProps {
  //    供中间便器渲染的组件
  components: ComponentProps[];
  //    当前编辑的元素 id
  currentElement?: string;
  //    保存项目的其他信息
  page: PageData;
  //    保存拷贝组件
  copiedComponent?: ComponentProps;
  histories: HistoryProps[];
  historyIndex: number;
  maxHistoryNumber: number;
  cachedOldValues?: any; //  开始更新的缓存值
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

export interface updateComponentData {
  key: keyof AllComponentProps | Array<keyof AllComponentProps>;
  value: string | string[];
  id: string;
  isRoot?: boolean;
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

/** 属性变化防抖函数*/
const debounceChange = (callback: (...args: any) => void, timeout = 1000) => {
  let timer = 0;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = 0;
      callback(...args);
    }, timeout);
  };
};

/** 添加/删除/更新组件等界面操作添加历史记录*/
const pushHistory = (state: EditorProps, historyRecord: HistoryProps) => {
  if (state.historyIndex !== -1) {
    // 历史记录移动过, 删除大于索引的所有操作记录
    state.histories = state.histories.slice(0, state.historyIndex);
    // 重置历史记录索引
    state.historyIndex = -1;
  }
  // 保存历史记录长度限制处理
  if (state.histories.length < state.maxHistoryNumber) {
    state.histories.push(historyRecord);
  } else {
    state.histories.shift();
    state.histories.push(historyRecord);
  }
};

//  更新记录
const pushModifyHistory = (
  state: EditorProps,
  { key, value, id }: updateComponentData
) => {
  pushHistory(state, {
    id: uuidv4(),
    componentId: id || (state.currentElement as string),
    type: "modify",
    data: {
      oldValue: state.cachedOldValues,
      newValue: value,
      key,
    },
  });
  state.cachedOldValues = null; //  更新记录后重置开始的缓存值
};

const pushHistoryDebounce = debounceChange(pushModifyHistory);

/** 历史记录 - 属性更新*/
const modifyHistory = (
  state: EditorProps,
  history: HistoryProps,
  type: "undo" | "redo"
) => {
  const { componentId, data } = history;
  const { key, oldValue, newValue } = data;
  const newKey = key as
    | keyof AllComponentProps
    | Array<keyof AllComponentProps>;
  const updatedComponent = state.components.find(
    (component) => component.id === componentId
  );
  if (updatedComponent) {
    if (Array.isArray(newKey)) {
      newKey.forEach((kName, index) => {
        updatedComponent.props[kName] =
          type === "undo" ? oldValue[index] : newValue[index];
      });
    } else {
      updatedComponent.props[key] = type === "undo" ? oldValue : newValue;
    }
  }
};

const editor: Module<EditorProps, GlobalDataProps> = {
  namespaced: true, //  启动命名空间
  state: {
    components: testComponents,
    currentElement: "",
    page: {
      props: pageDefaultProps,
      title: "test title",
    },
    histories: [],
    historyIndex: -1,
    maxHistoryNumber: 5,
    cachedOldValues: null,
  },
  mutations: {
    addComponent: (state, component: ComponentProps) => {
      component.layerName = "图层" + (state.components.length + 1);
      state.components.push(component);

      pushHistory(state, {
        id: uuidv4(),
        componentId: component.id,
        type: "add",
        data: cloneDeep(component),
      });
    },
    setActive: (state, id) => {
      state.currentElement = id;
    },
    // 撤销
    undo(state) {
      //  没有进行撤销操作时, 记录的历史记录索引是最后一位
      if (state.historyIndex === -1) {
        state.historyIndex = state.histories.length - 1;
      } else {
        state.historyIndex--;
      }
      //  获取正确历史记录
      const history = state.histories[state.historyIndex];
      switch (history.type) {
        case "add": //  如果历史记录的是新增, 我们需要对其进行删除操作
          state.components = state.components.filter(
            (component) => component.id !== history.componentId
          );
          break;
        case "delete": //  如果历史记录的是删除, 我们需要在指定位置新增数据
          state.components = insertAt(
            state.components,
            history.index as number,
            history.data
          );
          break;
        case "modify": {
          modifyHistory(state, history, "undo");
          break;
        }
        default:
          break;
      }
    },
    // 恢复(重做)
    redo(state) {
      if (state.historyIndex === -1) return;
      const history = state.histories[state.historyIndex];
      switch (history.type) {
        case "add":
          state.components.push(history.data);
          break;
        case "delete":
          state.components = state.components.filter(
            (component) => component.id !== history.componentId
          );
          break;
        case "modify": {
          modifyHistory(state, history, "redo");
          break;
        }
      }
      state.historyIndex++;
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

        pushHistory(state, {
          id: uuidv4(),
          componentId: newComponent.id,
          type: "add",
          data: cloneDeep(newComponent),
        });
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

        const currentIndex = state.components.findIndex(
          (component) => component.id === id
        );
        pushHistory(state, {
          id: uuidv4(),
          componentId: currentComponent.id,
          type: "delete",
          index: currentIndex,
          data: currentComponent,
        });
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
    updateComponent: (
      state,
      { key, value, id, isRoot }: updateComponentData
    ) => {
      const updateComponent = state.components.find(
        (component) => component.id === (id || state.currentElement)
      );
      if (updateComponent) {
        if (isRoot) {
          updateComponent[key as string] = value;
        } else {
          //  区分处理传入的 key 和 value 是 array 情况
          const oldValue = Array.isArray(key)
            ? key.map((k) => updateComponent.props[k])
            : updateComponent.props[key];
          if (!state.cachedOldValues) {
            state.cachedOldValues = oldValue;
          }
          //  添加到历史记录
          pushHistoryDebounce(state, { key, value, id });
          if (Array.isArray(key) && Array.isArray(value)) {
            key.forEach((kName, index) => {
              updateComponent.props[kName] = value[index];
            });
          } else if (typeof key === "string" && typeof value === "string") {
            updateComponent.props[key] = value;
          }
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
    checkUndoDisable: (state) => {
      //  撤销不能使用: 无历史记录/已经是历史记录第一个
      if (state.histories.length === 0 || state.historyIndex === 0) {
        return true;
      }
      return false;
    },
    checkRedoDisable: (state) => {
      if (
        state.histories.length === 0 ||
        state.historyIndex === -1 ||
        state.histories.length === state.historyIndex
      ) {
        return true;
      }
      return false;
    },
  },
};

export default editor;
