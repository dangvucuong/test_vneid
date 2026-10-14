<template>
  <div class="flex">
    <div class="flex-none w-[240px] content-center h-screen bg-white p-2">
      <a-select
        ref="select"
        v-model:value="formData.userId"
        :options="listUser"
        :placeholder="'Chọn thư mục'"
        class="custom-select w-[224px]"
      >
        <template #option="{ value: val, label }">
          <div class="flex gap-4">
            <div class="rounded-full w-[16px] h-[16px] bg-[#F9AA92]"></div>
            {{ label }}
          </div>
        </template>
      </a-select>
      <a-divider />
      <div class="flex justify-center items-center">
        <a-button
          type="text"
          @click="enableDrawing"
          class="flex items-center text-[#0055E6] border-none"
        >
          <template #icon>
            <plus-outlined />
          </template>
          Thêm vùng ký
        </a-button>
      </div>
    </div>
    <div class="grow">
      <div
        class="flex items-center justify-center divide-x-4 h-[40px] bg-[#E7ECEF] gap-6"
      >
        <div class="flex items-center justify-center gap-4">
          <a-button
            @click="scale = scale > 0.25 ? scale - 0.25 : scale"
            shape="circle"
            :size="'small'"
            class="flex items-center justify-center"
          >
            <MinusOutlined />
          </a-button>
          <div>{{ scale * 100 }}%</div>
          <a-button
            @click="scale = scale < 2 ? scale + 0.25 : scale"
            shape="circle"
            :size="'small'"
            class="flex items-center justify-center"
          >
            <PlusOutlined />
          </a-button>
        </div>
        <div class="flex gap-2">
          <a-button
            @click="page = page > 1 ? page - 1 : page"
            shape="circle"
            :size="'small'"
            class="flex items-center justify-center"
          >
            <LeftOutlined />
          </a-button>
          <span>Trang {{ page }} / Tổng {{ pages }} trang</span>
          <a-button
            @click="page = page < pages ? page + 1 : page"
            shape="circle"
            :size="'small'"
            class="flex items-center justify-center"
          >
            <RightOutlined />
          </a-button>
        </div>
        <div class="flex gap-4">
          <HandIcon />
          <PrintIcon />
        </div>
      </div>
      <div class="relative flex flex-col items-center">
        <!-- <VuePDF :pdf="pdf" :page="page" :scale="scale" class="z-10" />
        <div class="absolute z-50 top-0 left-0">
          <v-stage
            ref="stageRef"
            :config="stageConfig"
            @mousedown="handleMouseDown"
            @mouseup="handleMouseUp"
            @mousemove="handleMouseMove"
            class="z-50"
          >
            <v-layer>
              <v-rect
                v-if="drawing"
                :x="startX"
                :y="startY"
                :width="currentWidth"
                :height="currentHeight"
                fill="rgba(0, 0, 255, 0.3)"
              />
              <v-rect
                v-if="rec"
                :x="rec.x"
                :y="rec.y"
                :width="rec.width"
                :height="rec.height"
                fill="rgba(0, 0, 255, 0.3)"
              />
            </v-layer>
          </v-stage>
        </div> -->
        <!-- <VuePdf
          src="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf"
          :page="page"
          enableTextSelection
          enableAnnotations
        /> -->
      </div>
    </div>
    <div class="flex-none w-[240px] bg-white h-screen p-2">
      <div class="flex justify-between">
        <div>Tài liệu</div>
        <div>01</div>
      </div>
      <a-divider />
      <div class="flex gap-1 items-center">
        <div
          class="border bg-[#0055E6] w-[24px] h-[24px] flex items-center justify-center"
        >
          <TextSniperIcon
            class="fill-[#0055E6] text-white w-[16px] h-[16px]"
          ></TextSniperIcon>
        </div>
        <a-select
          ref="select"
          v-model:value="formData.fileId"
          :options="listFile"
          :placeholder="'Chọn thư mục'"
          class="custom-select w-[224px] border-none"
          :bordered="false"
        >
        </a-select>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  PlusOutlined,
  MinusOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons-vue";
import { VuePdf, createLoadingTask } from "vue3-pdfjs/esm";
import TextSniperIcon from "@/assets/img/text_sniper.svg?component";
import HandIcon from "@/assets/img/hand.svg?component";
import PrintIcon from "@/assets/img/print.svg?component";
import { VuePDF, usePDF } from "@tato30/vue-pdf";
const formData = reactive<any>({
  userId: 1,
  fileId: 1,
});
const listUser = ref<any>([
  {
    value: 1,
    label: "Nguyễn Văn A",
  },
  {
    value: 2,
    label: "Nguyễn Văn B",
  },
  {
    value: 3,
    label: "Nguyễn Văn C",
  },
]);
const listFile = ref<any>([
  {
    value: 1,
    label: "File 1",
  },
  {
    value: 2,
    label: "File 2",
  },
  {
    value: 3,
    label: "File 3",
  },
]);
// Vùng chọn chữ ký
const scale = ref(1);
const page = ref(1);
const { pdf, pages } = usePDF(
  "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
);

const stageConfig = {
  width: 2560,
  height: 1230,
};

const stageRef = ref();
const drawing = ref(false);
const startX = ref(0);
const startY = ref(0);
const currentWidth = ref(0);
const currentHeight = ref(0);
const rec = ref<any>();

const handleMouseDown = (e: any) => {
  if (startDrawing.value) {
    drawing.value = true;
    const pos = getPointerPosition();
    startX.value = pos.x;
    startY.value = pos.y;
  }
};

const handleMouseUp = () => {
  if (drawing.value) {
    drawing.value = false;
    const pos = getPointerPosition();
    const width = pos.x - startX.value;
    const height = pos.y - startY.value;
    rec.value = { x: startX.value, y: startY.value, width, height };
  }

  currentWidth.value = 0;
  currentHeight.value = 0;
};

const handleMouseMove = (e: any) => {
  if (!drawing.value) return;

  const pos = getPointerPosition();
  const width = pos.x - startX.value;
  const height = pos.y - startY.value;
  console.log(width);
  console.log(height);
  console.log(pos.x);
  console.log(startX.value);
  currentWidth.value = width;
  currentHeight.value = height;
};

const getPointerPosition = () => {
  return stageRef.value.getStage().getPointerPosition();
};

const saveRectangles = () => {
  // Đây là nơi bạn có thể xử lý lưu hình đã vẽ (ví dụ: gửi lên server, lưu vào cơ sở dữ liệu, ...)
  console.log("Hình đã vẽ:", rec.value);
};
const startDrawing = ref(false);
const enableDrawing = () => {
  startDrawing.value = true;
};
</script>
