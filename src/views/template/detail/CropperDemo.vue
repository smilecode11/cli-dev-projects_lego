<template>
  <div class="cropper-wrapper">
    <div class="cropper-control">
      <input
        type="file"
        accept="image/*"
        class="imgReader"
        ref="inputUploadRef"
        @change="loadingImg"
      />
      <img class="cropImg" ref="imageViewRef" :src="imageViewURL" />
      <div @click="handleUploadEvent" class="cover-text">更换头像</div>
    </div>
    <a-modal
      v-model:visible="modalShow"
      title="cropper 裁剪"
      @ok="handleOk"
      @cancel="($event) => (modalShow = false)"
      class="modal-control"
      width="680px"
    >
      <div class="control">
        <div class="image-cropper">
          <img
            :src="baseImageUrl"
            class="processed-image"
            ref="cropperImgRef"
          />
        </div>
        <div class="image-view">
          <div class="previewText">效果预览</div>
          <div class="previewBox" ref="previewBoxRef"></div>
          <div class="previewBoxRound" ref="previewBoxRoundRef"></div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick, watch } from "vue";
import axios from "axios";
import { message as AntdVMessage } from "ant-design-vue";
import Cropper from "cropperjs";
export default defineComponent({
  setup() {
    const modalShow = ref(false);
    const imageViewURL = ref(
      "http://smile-backend2.oss-cn-hangzhou.aliyuncs.com/backend2/El51CZ.png"
    );
    const inputUploadRef = ref<null | HTMLInputElement>(null);
    const cropperImgRef = ref<null | HTMLImageElement>(null);
    const previewBoxRef = ref<null | HTMLImageElement>(null);
    const previewBoxRoundRef = ref<null | HTMLImageElement>(null);
    let baseImageUrl = ref("");
    let dataURL = ref<any>("");
    let CROPPER: Cropper;
    let uploadFile: File;

    const handleUploadEvent = async () => {
      await inputUploadRef.value?.click();
    };

    const loadingImg = async (event) => {
      let reader = new FileReader();
      uploadFile = event.target.files[0];
      if (uploadFile) {
        //readAsDataURL方法可以将File对象转化为data:URL格式的字符串（base64编码）
        reader.readAsDataURL(uploadFile);
        reader.onload = () => {
          dataURL = reader.result;
          // 触发弹窗展示, 侦听弹窗的显示时, 写入图片地址
          baseImageUrl.value = dataURL;
          modalShow.value = true;
        };
      }
    };

    watch(modalShow, async (newValue) => {
      await nextTick();
      if (newValue) {
        if (cropperImgRef.value) {
          // eslint-disable-next-line
          // @ts-ignore
          CROPPER = new Cropper(cropperImgRef.value, {
            aspectRatio: 16 / 16, //固定裁剪框的比例（横/竖）,此处16/16则固定为正方形
            minContainerWidth: 500, //容器最小的宽度
            minContainerHeight: 500, //容器最小的高度
            dragMode: "move", //设置裁剪框为可以移动
            preview: [previewBoxRef.value, previewBoxRoundRef.value],
          });
        }
      } else {
        if (CROPPER) {
          CROPPER.destroy();
        }
      }
    });

    const handleOk = () => {
      //  裁剪数据转化为 blob 传输给后端
      CROPPER.getCroppedCanvas({
        maxWidth: 460,
        maxHeight: 460,
        fillColor: "#fff",
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high", //  中等质量 medium 高质量 high
      }).toBlob((blob) => {
        const formData = new FormData();
        // 第三个参数为文件名，可选填.
        formData.append("file", blob as Blob, uploadFile.name);

        axios
          .post(`http://127.0.0.1:7001/api/upload-img2`, formData, {
            headers: {
              "Content-Type": "mutipart/form-data",
            },
            timeout: 10000,
          })
          .then((resp) => {
            console.log("_then", resp);
            if (resp.data.errno !== 0) {
              return Promise.reject(resp);
            }
            AntdVMessage.success(`上传成功: ${resp.data.data.url}`);

            //  赋值展示头像 & 关闭弹窗
            imageViewURL.value = resp.data.data.url;
            modalShow.value = false;
          })
          .catch((error) => {
            AntdVMessage.error(error.data.message);
          })
          .finally(() => {
            //  重置 input value 值, 保证 input change 事件正常触发
            if (inputUploadRef.value) {
              inputUploadRef.value.value = "";
            }
          });
      });
    };

    return {
      modalShow,
      imageViewURL,
      inputUploadRef,
      cropperImgRef,
      previewBoxRef,
      previewBoxRoundRef,
      baseImageUrl,
      handleUploadEvent,
      loadingImg,
      handleOk,
    };
  },
});
</script>

<style scoped>
.cropper-control {
  position: relative;
  width: 100px;
  height: 100px;
  background: bisque;
  border-radius: 50%;
  overflow: hidden;
}
.cropper-control:hover .cover-text {
  /* display: block; */
  opacity: 1;
}
.cropper-control .cropImg {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}
.cover-text {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  line-height: 100px;
  text-align: center;
  color: palevioletred;
  background: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  opacity: 0;
  transition: 0.3s;
}

.imgReader {
  display: none;
}

.processed-image {
  display: block;
  /* This rule is very important, please don't ignore this */
  max-width: 100%;
}

.control {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.control .image-view {
  min-width: 120px;
  margin-left: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.image-view .previewBox,
.image-view .previewBoxRound {
  overflow: hidden; /*这个超出设置为隐藏很重要，否则就会整个显示出来了*/
  margin-top: 30px;
  box-shadow: 0 0 5px #adadad;
  width: 100px;
  height: 100px;
  border: 1px solid #f2f2f2;
}
.image-view .previewBoxRound {
  border-radius: 50%;
}
</style>
