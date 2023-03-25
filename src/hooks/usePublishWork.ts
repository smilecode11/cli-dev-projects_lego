import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { takeScreenshotAndUpdate } from "@/helper";
import { GlobalDataProps } from "@/store";
import useSaveWork from "@/hooks/useSaveWork";

/** 作品发布程序步骤*/
function usePublishWork() {
  const store = useStore<GlobalDataProps>();
  const route = useRoute();
  const channels = computed(() => store.state.editor.channels);
  const isPublishing = ref(false);
  const currentWorkId = route.params.id;
  const { saveWork } = useSaveWork(true);

  const publishWork = async (el: HTMLElement) => {
    try {
      isPublishing.value = true;
      const resp = await takeScreenshotAndUpdate(el);
      if (resp) {
        //  2. 更新 coverImg
        store.dispatch("editor/updatePage", {
          key: "coverImg",
          value: resp.data.urls[0],
          isRoot: true,
        });
        //  3. 保存作品
        await saveWork();
        //  4.发布作品
        await store.dispatch("editor/publishWork", { id: currentWorkId });
        //  5.获取作品的渠道
        await store.dispatch("editor/fetchChannels", { id: currentWorkId });
        //  6.如果作品没有渠道, 新建一个默认渠道
        if (channels.value.length <= 0) {
          await store.dispatch("editor/createChannel", { id: currentWorkId });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      isPublishing.value = false;
    }
  };

  return {
    publishWork,
    isPublishing,
  };
}

export default usePublishWork;
