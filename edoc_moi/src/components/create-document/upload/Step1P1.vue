<template>
  <div class="bg-white w-[1040px] mx-auto mt-[24px] p-4" :class="multiple ? 'mb-8' : 'h-[526px]'">
    <h3 class="font-nunito text-[24px] leading-8 flex font-bold">
      {{ multiple ? "Tải lên tài liệu hàng loạt" : "Tải lên tài liệu mới" }}
    </h3>
    <a-divider />
    <a-spin :spinning="isLoading">
      <a-upload-dragger
        :accept="listFileType.join(', ')"
        name="file"
        :file-list="fileList"
        :multiple="multiple"
        :max-count="multiple ? undefined : 1"
        :beforeUpload="beforeUpload"
        :showUploadList="multiple"
        @change="handleChange"
        @remove="handleRemove"
        @drop="handleDrop"
        class="!w-[992px]"
        :class="multiple ? '!min-h-[320px]' : '!h-[382px]'"
      >
        <div class="flex items-center justify-center h-full min-h-[280px]">
          <div class="grid grid-cols-1 content-center justify-center">
            <p class="ant-upload-drag-icon flex justify-center">
              <UploadFileIcon />
            </p>
            <div class="ant-upload-text flex gap-3 items-center justify-center">
              {{
                multiple
                  ? "Kéo và thả nhiều tài liệu ở đây hoặc"
                  : "Kéo và thả tài liệu ở đây hoặc"
              }}
              <a-button
                key="submit"
                type="primary"
                @click=""
                class="w-[140px] h-[36px] bg-[#0055E6] text-white"
                >Tải lên từ thiết bị
              </a-button>
            </div>
            <p class="ant-upload-hint">
              Định dạng được hỗ trợ: pdf, docx, doc, txt, xml, xls, xlsx, png,
              jpeg, jpg
            </p>
            <p class="ant-upload-hint">Kích thước file nhỏ hơn 4MB</p>
            <p v-if="multiple" class="ant-upload-hint">
              Có thể chọn nhiều file cùng lúc
            </p>
          </div>
        </div>
      </a-upload-dragger>

      <div
        v-if="multiple && fileList.length"
        class="flex flex-row-reverse gap-4 mt-4"
      >
        <a-button
          type="primary"
          class="w-[180px] h-[36px] bg-[#0055E6] text-white"
          @click="confirmFiles"
        >
          Tiếp tục ({{ fileList.length }} file)
        </a-button>
      </div>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import UploadFileIcon from "@/assets/img/upload_file.svg?component";
import { UploadChangeParam, message } from "ant-design-vue";
import { useFileStoreHook } from "@/store/modules/file";

const props = withDefaults(
  defineProps<{
    multiple?: boolean;
  }>(),
  { multiple: false }
);

const fileStore = useFileStoreHook();
const isLoading = ref(false);
const fileList = ref<any[]>([]);

const mimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpg",
  "image/jpeg",
  "application/xml",
];

const listFileType = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/xml",
  "image/png",
  "image/jpg",
  "image/jpeg",
  "application/rtf",
];

const isValidFile = (file: any) => {
  if (!mimeTypes.includes(file.type)) {
    message.error(`${file.name} không thuộc định dạng được hỗ trợ`, 2);
    return false;
  }
  if (file.size >= 4000000) {
    message.error(`${file.name} vượt quá 4MB`, 2);
    return false;
  }
  return true;
};

const handleChange = async (info: UploadChangeParam) => {
  if (props.multiple) {
    // Chỉ validate file vừa thêm, tránh spam lỗi khi re-render list
    const latest = info.file;
    const latestRaw = latest?.originFileObj || latest;
    if (latest && latest.status !== "removed" && latestRaw) {
      if (!isValidFile(latestRaw)) {
        fileList.value = (info.fileList || []).filter(
          (f: any) => f.uid !== latest.uid
        );
        return;
      }
    }
    const seen = new Set<string>();
    fileList.value = (info.fileList || []).filter((f: any) => {
      const raw = f.originFileObj || f;
      const key = f.uid || `${raw.name}_${raw.size}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return;
  }

  if (!isValidFile(info.file)) return;
  if (info.file) {
    const rawFile = (info.file as any).originFileObj || info.file;
    fileList.value = [info.file];
    fileStore.setThongTinFile(rawFile);
    emit("uploadFile", rawFile);
  }
};

const handleRemove = (file: any) => {
  fileList.value = fileList.value.filter((f) => f.uid !== file.uid);
};

function handleDrop(e: any) {
  console.log(e);
}

const beforeUpload = () => {
  return false;
};

const confirmFiles = () => {
  if (!fileList.value.length) {
    message.warning("Hãy chọn ít nhất một file");
    return;
  }
  const files = fileList.value.map((f: any) => f.originFileObj || f);
  emit("uploadFiles", files);
};

const emit = defineEmits(["uploadFile", "uploadFiles"]);
</script>
<style scoped>
.steps-action {
  margin-top: 24px;
}
</style>
