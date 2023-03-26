<template>
  <div class="preview-form" v-if="visible">
    <div class="final-preview">
      <div class="final-preview-inner">
        <div class="preview-title">
          {{ page.title }}
        </div>
        <div class="iframe-container">
          <iframe
            :src="previewURL"
            width="375"
            frameborder="0"
            class="iframe-placeholder"
            :height="
              page.props && page.props.height ? page.props.height : '560'
            "
          ></iframe>
        </div>
      </div>
    </div>
    <a-drawer
      title="设置面板"
      placement="right"
      width="400"
      :closable="true"
      :visible="visible"
      @close="onCancel"
    >
      <div class="publish-form-container">
        <a-row type="flex" align="middle" :style="{ marginBottom: '20px' }">
          <a-col :span="6">扫码预览</a-col>
          <a-col :span="10">
            <canvas id="preview-barcode-container"></canvas>
          </a-col>
        </a-row>
        <a-row type="flex" align="middle" :style="{ marginBottom: '20px' }">
          <a-col :span="6"> 上传封面： </a-col>
          <a-col :span="10">
            <styled-upload
              text="上传封面"
              :uploaded="form.uploaded"
              action="http://127.0.0.1:7001/api/utils/upload-img"
              @success="settingShareImgUpload"
              showUploaded
            >
            </styled-upload>
          </a-col>
        </a-row>
        <a-form
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
          :model="form"
          :rules="rules"
        >
          <a-form-item label="标题" required name="title">
            <a-input v-model:value="form.title" />
          </a-form-item>
          <a-form-item label="描述" required name="desc">
            <a-input v-model:value="form.desc" />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 18, offset: 4 }">
            <a-button
              type="primary"
              style="margin-left: 10px"
              @click="validateAndSave"
              :loading="saveWorkLoading"
            >
              保存
            </a-button>
            <a-button style="margin-left: 10px" @click="onCancel">
              取消
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import { Form } from "ant-design-vue";
import { GlobalDataProps } from "@/store";
import { baseH5URL } from "@/axios";
import { generateQRCode, timeout } from "@/helper";
import { RespUploadData } from "@/store/respTypes";
import { forEach } from "lodash-es";
import useSaveWork from "@/hooks/useSaveWork";

import StyledUpload from "@/components/StyledUpload.vue";

const useForm = Form.useForm;
export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:visible"],
  setup(props, { emit }) {
    const store = useStore<GlobalDataProps>();
    const page = computed(() => store.state.editor.page);
    const previewURL = computed(
      () => `${baseH5URL}/p/preview/${page.value.id}-${page.value.uuid}`
    );
    const { saveWork, saveWorkLoading } = useSaveWork();

    const onCancel = () => {
      emit("update:visible", false);
    };

    const { title, desc, setting } = page.value;
    const form = reactive({
      title: title || "",
      desc: desc || "",
      uploaded: {
        data: {
          url:
            (setting && setting.shareImg) ||
            "http://vue-maker.oss-cn-hangzhou.aliyuncs.com/vue-marker/5f79389d4737571e2e1dc7cb.png",
        },
      },
    });

    //  封面图上传
    const settingShareImgUpload = ({ resp }: { resp: RespUploadData }) => {
      const url = resp.data.urls[0];
      form.uploaded = {
        data: {
          url,
        },
      };
    };

    const rules = {
      title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
      desc: [{ required: true, message: "描述不能为空", trigger: "blur" }],
    };
    const { validate } = useForm(form, rules);

    const validateAndSave = async () => {
      try {
        await validate();
        forEach(form, (value, key) => {
          if (key === "uploaded" && typeof value !== "string") {
            store.commit("editor/updatePage", {
              key: "shareImg",
              value: value.data.url,
              isSetting: true,
            });
          } else {
            store.commit("editor/updatePage", { key, value, isRoot: true });
          }
        });
        await saveWork();
        // emit("update:visible", false);
      } catch (e) {
        console.error(e);
      }
    };

    onMounted(async () => {
      try {
        await timeout(100);
        await generateQRCode("preview-barcode-container", previewURL.value);
      } catch (e) {
        console.error(e);
      }
    });

    return {
      page,
      previewURL,
      onCancel,
      form,
      rules,
      validateAndSave,
      saveWorkLoading,
      settingShareImgUpload,
    };
  },
  components: {
    StyledUpload,
  },
});
</script>

<style scoped>
.final-preview {
  position: absolute;
  width: calc(100% - 400px);
  height: 100%;
  background: transparent;
  top: 0;
  left: 0;
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
}
.final-preview-inner {
  width: 430px;
  height: 870px;
  padding: 60px 28px;
  position: relative;
  background: url("~@/assets/phone-back.png") no-repeat;
  background-size: cover;
}

.final-preview-inner .preview-title {
  height: 44px;
  line-height: 44px;
  text-align: center;
  font-weight: bold;
}
.iframe-container {
  width: 100%;
  height: 706px;
  overflow-y: auto;
  overflow-x: hidden;
}
.iframe-placeholder {
  background: url("~@/assets/loading.svg") 50% 50% no-repeat;
  background-size: 50px;
}
.publish-form-container .file-upload-container {
  height: 130px;
}
.publish-form-container .ant-form-item-label {
  text-align: left;
}
#preview-barcode-container {
  border: 2px dotted #efefef;
  padding: 10px;
}
</style>
