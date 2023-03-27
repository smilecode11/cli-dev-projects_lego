import { message } from "ant-design-vue";
import html2canvas from "html2canvas";
import axios from "axios";
import { RespUploadData } from "@/store/respTypes";
import QRCode from "qrcode";
interface CheckCondition {
  format?: string[];
  size?: number; //  使用多少 M 为单位
}
type ErrorType = "size" | "format" | null;

export function beforeUploadCheck(file: File, condition: CheckCondition) {
  const { format, size } = condition;
  const isValidFormat = format ? format.includes(file.type) : true;
  const isValidSize = size ? file.size / 1024 / 1024 < size : true;
  let error: ErrorType = null;
  if (!isValidFormat) {
    error = "format";
  }
  if (!isValidSize) {
    error = "size";
  }
  return {
    passed: isValidFormat && isValidSize,
    error,
  };
}

export const commonUploadCheck = (file: File) => {
  const result = beforeUploadCheck(file, {
    format: ["image/jpeg", "image/png"],
    size: 2,
  });
  const { passed, error } = result;
  if (error === "format") {
    message.error("上传图片只能是 JPG/PNG 格式");
  }
  if (error === "size") {
    message.error("上传图片大小不能超过 2MB");
  }
  // console.log("_commonUploadCheck", passed);
  return passed;
};

export const getImageDimension = (url: string | File) => {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.src = typeof url === "string" ? url : URL.createObjectURL(url);
    img.addEventListener("load", () => {
      const { naturalWidth: width, naturalHeight: height } = img;
      resolve({
        width,
        height,
      });
    });
    img.addEventListener("error", () => {
      reject(new Error(`There was some problem with the img`));
    });
  });
};

export const getParentElement = (element: HTMLElement, className: string) => {
  while (element) {
    if (element.classList && element.classList.contains(className)) {
      return element;
    } else {
      element = element.parentNode as HTMLElement;
    }
  }
  return null;
};

/** 在数组指定索引位添加数据*/
export const insertAt = (arr: any[], index: number, newItem: any) => {
  return [...arr.slice(0, index), newItem, ...arr.slice(index)];
};

/** 上传图片到服务器*/
export async function uploadFile<R = any>(
  file: Blob,
  url = "http://127.0.0.1:7001/api/utils/upload-img",
  fileName = "screenshot.png"
) {
  const newFile = file instanceof File ? file : new File([file], fileName);
  const formData = new FormData();
  formData.append(newFile.name, newFile);
  const { data } = await axios.post<R>(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return data;
}
function getCanvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resove) => {
    canvas.toBlob((blob) => {
      resove(blob);
    });
  });
}
/** 截取图片并上传*/
export async function takeScreenshotAndUpdate(ele: HTMLElement) {
  const canvas = await html2canvas(ele, {
    width: 375,
    useCORS: true,
    scale: 1,
  });
  const canvasBlob = await getCanvasBlob(canvas);
  if (canvasBlob) {
    //  上传 blob 到服务器
    const data = await uploadFile<RespUploadData>(canvasBlob);
    return data;
  }
}

/** 生成二维码*/
export function generateQRCode(id: string, url, width = 100) {
  const ele = document.getElementById(id) as HTMLCanvasElement;
  return QRCode.toCanvas(ele, url, { width });
}

/** 拷贝到剪贴板*/
export function copyToClipboard(text: string) {
  // 创建文本域节点, 设置需要拷贝的值
  const textarea = document.createElement("textarea");
  textarea.value = text;
  // 设置该节点不可见
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-99999px";
  // 将节点插入到 body, 并使其选中内容
  document.body.appendChild(textarea);
  textarea.select();
  // 使用 document.execCommand 完成拷贝命令
  try {
    document.execCommand("copy");
  } catch (error) {
    console.error("copy failed", error);
  } finally {
    // 删除节点
    document.body.removeChild(textarea);
  }
}

/** 睡眠函数*/
export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** objectToQueryString*/
export function objectToQueryString(obj: { [key: string]: any }) {
  return Object.keys(obj)
    .map((key) => `${key}=${obj[key]}`)
    .join("&");
}
