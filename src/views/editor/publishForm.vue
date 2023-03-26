<template>
  <div class="publish-channel-container">
    <a-row :style="{ marginBottom: '20px' }">
      <a-col :span="8" class="left-col">
        封面图
        <img :src="page.coverImg" :alt="page.title" />
      </a-col>
      <a-col :span="16" class="right-col">
        <a-row>
          <a-col :span="6">
            <img
              src="http://vue-maker.oss-cn-hangzhou.aliyuncs.com/vue-marker/5f79389d4737571e2e1dc7cb.png"
              :alt="page.title"
            />
          </a-col>
          <a-col :span="18" class="left-gap">
            <h4>{{ page.title }}</h4>
            <p>{{ page.desc }}</p>
          </a-col>
        </a-row>
        <a-tabs type="card" :style="{ marginTop: '20px' }">
          <a-tab-pane key="channels" tab="发布为作品">
            <a-row
              v-for="channel in channels"
              :key="channel.uuid"
              class="channel-item"
            >
              <a-col :span="6">
                <canvas
                  class="barcode-container"
                  :id="`channel-barcode-${channel.uuid}`"
                />
              </a-col>
              <a-col :span="18" class="left-gap">
                <h4>{{ channel.name }}</h4>
                <a-row>
                  <a-col :span="18">
                    <a-input
                      :value="generateChannelURL(channel.uuid)"
                      :readonly="true"
                      :id="`channel-url-${channel.uuid}`"
                    />
                  </a-col>
                  <a-col :span="6">
                    <a-button
                      class="copy-button"
                      :data-clipboard-target="`#channel-url-${channel.uuid}`"
                      >复制</a-button
                    >
                  </a-col>
                </a-row>
              </a-col>
              <div class="delete-area">
                <a-button
                  type="danger"
                  size="small"
                  @click="deleteChannel(channel.uuid)"
                  :disabled="deleteDisabled"
                  >删除渠道</a-button
                >
              </div>
            </a-row>
            <a-form
              layout="inline"
              :style="{ marginTop: '20px' }"
              :model="form"
              :rules="rules"
            >
              <a-form-item name="channelName">
                <a-input
                  placeholder="渠道名称"
                  v-model:value="form.channelName"
                ></a-input>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="createChannel">
                  创建新渠道
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>
          <a-tab-pane key="template" tab="发布为模版"> </a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { Form, message as AntdMessage } from "ant-design-vue";
import { GlobalDataProps } from "@/store";
import { baseH5URL } from "@/axios";
import { last } from "lodash-es";
import Clipboard from "clipboard";
import { generateQRCode } from "@/helper";
const useForm = Form.useForm;
export default defineComponent({
  setup() {
    const store = useStore<GlobalDataProps>();
    const route = useRoute();
    const page = computed(() => store.state.editor.page);
    const channels = computed(() => store.state.editor.channels);
    const currentWorkId = route.params.id as string;
    const form = reactive({
      channelName: "",
    });
    const rules = reactive({
      channelName: [
        { required: true, message: "渠道名不能为空", trigger: "blur" },
      ],
    });
    const { validate } = useForm(form, rules);
    //  生成完整 h5 访问链接
    const generateChannelURL = (id) =>
      `${baseH5URL}/p/${page.value.id}-${page.value.uuid}?channel=${id}`;
    //  创建作品渠道
    const createChannel = async () => {
      const payload = {
        name: form.channelName,
        id: currentWorkId,
      };
      try {
        await validate();
        await store.dispatch("editor/createChannel", payload);
        form.channelName = "";
      } catch (error) {
        console.error(error);
      }
    };
    //  是否可操作删除按钮
    const deleteDisabled = computed(
      () => store.state.editor.channels.length <= 1
    );
    //  删除作品渠道
    const deleteChannel = async (uuid: string) => {
      await store.dispatch("editor/deleteChannel", {
        id: uuid,
      });
    };
    onMounted(() => {
      //  剪切实例化
      const clipboard = new Clipboard(".copy-button");
      clipboard.on("success", (e) => {
        AntdMessage.success("复制成功", 1);
        e.clearSelection(); //  清除选中
      });

      //  生成二维码
      channels.value.forEach(async (channel) => {
        await generateQRCode(
          `channel-barcode-${channel.uuid}`,
          generateChannelURL(channel.uuid)
        );
      });
    });

    watch(
      () => [...channels.value],
      async (newChannels, oldChannels) => {
        if (newChannels.length > oldChannels.length) {
          const createChannel = last(newChannels);
          if (createChannel) {
            await generateQRCode(
              `channel-barcode-${createChannel.uuid}`,
              generateChannelURL(createChannel.uuid)
            );
          }
        }
      },
      {
        deep: true, //  深度监听数组或对象
        flush: "post", //  dom 渲染之后执行
      }
    );

    return {
      form,
      rules,
      createChannel,
      page,
      channels,
      generateChannelURL,
      deleteChannel,
      deleteDisabled,
    };
  },
});
</script>

<style scoped>
.left-col img {
  width: 80%;
}
.right-col img {
  width: 80px;
}
.left-gap {
  padding-left: 5px;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.delete-area {
  position: absolute;
  top: 10px;
  right: 20px;
}
.channel-item {
  padding: 10px 0;
  border-bottom: 1px solid #efefef;
  position: relative;
}
.barcode-container {
  height: 80px;
  width: 80px;
}
.template-submit {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
