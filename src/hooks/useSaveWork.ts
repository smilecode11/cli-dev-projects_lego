import { computed, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRoute, onBeforeRouteLeave } from "vue-router";
import { GlobalDataProps } from "@/store";
import { Modal } from "ant-design-vue";

/** 保存 edit work 的一些操作*/
const useSaveWork = (disableCondition = false) => {
  const store = useStore<GlobalDataProps>();
  const route = useRoute();
  const currentWorkId = route.params.id;
  const isDirty = computed(() => store.state.editor.isDirty);
  const page = computed(() => store.state.editor.page);
  const components = computed(() => store.state.editor.components);
  const saveWorkLoading = computed(() => store.getters.isOpLoading("saveWork"));
  //  保存
  const saveWork = () => {
    const { title, props } = page.value;
    const payload = {
      title,
      content: {
        components: components.value,
        props,
      },
    };
    store.dispatch("editor/saveWork", { id: currentWorkId, payload });
  };

  if (!disableCondition) {
    //  每隔 1 分钟自动保存
    let timer;
    onMounted(() => {
      timer = setInterval(() => {
        if (isDirty.value) {
          saveWork();
        }
      }, 60 * 1000);
    });
    onUnmounted(() => {
      clearInterval(timer);
    });
    //  退出检测变更提醒保存
    onBeforeRouteLeave((to, from, next) => {
      if (isDirty.value) {
        Modal.confirm({
          title: "作品还未保存，是否保存？",
          okText: "保存",
          okType: "primary",
          cancelText: "不保存",
          onOk: async () => {
            await saveWork();
            next();
          },
          onCancel: () => {
            next();
          },
        });
      } else {
        next();
      }
    });
  }
  return {
    saveWorkLoading,
    saveWork,
  };
};

export default useSaveWork;
