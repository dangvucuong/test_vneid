<script setup lang="ts">
/**
 * Viewer PDF + khoanh vùng ký (STT đỏ giữa ô).
 * Dùng cho tab Thiết lập tùy chỉnh - Đẩy lô 2026.
 */
import {
  PlusOutlined,
  MinusOutlined,
  LeftOutlined,
  RightOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { pdfjsLib } from "@/utils/pdfjsSetup";

export interface ZoneKyItem {
  STT: number;
  Trangky: number;
  VTCKy: string;
  rec: { x: number; y: number; width: number; height: number };
  scale: number;
  stageWidth: number;
  stageHeight: number;
}

const props = defineProps<{
  /** PDF ArrayBuffer hoặc Uint8Array */
  pdfData: ArrayBuffer | Uint8Array | null;
}>();

const emit = defineEmits<{
  (e: "update:zones", zones: ZoneKyItem[]): void;
  (e: "ready", totalPages: number): void;
}>();

const isLoading = ref(false);
const scale = ref(1);
const totalPage = ref(0);
const Trangky = ref(1);
const stageConfig = reactive({ width: 800, height: 800 });
const pdfCanvas = ref<HTMLCanvasElement | null>(null);
const stageRef = ref();
const image = ref<HTMLImageElement | null>(null);
const pdfDocument = ref<any>(null);

const drawing = ref(false);
const startDrawing = ref(false);
const startX = ref(0);
const startY = ref(0);
const currentWidth = ref(0);
const currentHeight = ref(0);

const zones = ref<ZoneKyItem[]>([]);
const zonesOnCurrentPage = computed(() =>
  zones.value.filter((z) => z.Trangky === Trangky.value)
);

const getPointerPosition = () =>
  stageRef.value?.getStage()?.getPointerPosition() || { x: 0, y: 0 };

const getImageData = async () => {
  if (!pdfDocument.value || !pdfCanvas.value) return;
  const page = await toRaw(pdfDocument.value).getPage(Trangky.value);
  const canvas = pdfCanvas.value;
  const viewport = page.getViewport({ scale: scale.value });
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  stageConfig.height = viewport.height;
  stageConfig.width = viewport.width;
  const canvasContext = canvas.getContext("2d");
  if (!canvasContext) return;
  await page.render({ canvasContext, viewport }).promise;
  const img = new window.Image();
  img.src = canvas.toDataURL();
  image.value = img;
};

const loadPdf = async () => {
  if (!props.pdfData) return;
  try {
    isLoading.value = true;
    const data =
      props.pdfData instanceof ArrayBuffer
        ? props.pdfData.slice(0)
        : props.pdfData.buffer.slice(
            props.pdfData.byteOffset,
            props.pdfData.byteOffset + props.pdfData.byteLength
          );
    pdfDocument.value = await pdfjsLib.getDocument({ data }).promise;
    totalPage.value = pdfDocument.value.numPages;
    Trangky.value = 1;
    await nextTick();
    await getImageData();
    emit("ready", totalPage.value);
  } catch (err) {
    console.error(err);
    message.error("Không xem được PDF để khoanh vùng ký");
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.pdfData,
  async () => {
    zones.value = [];
    emit("update:zones", []);
    await loadPdf();
  },
  { immediate: true }
);

const enableDrawing = () => {
  startDrawing.value = true;
  message.info("Kéo chuột trên tài liệu để khoanh vùng ký");
};

const buildVTCKy = (rec: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  const x1 = rec.x / scale.value;
  const y1 = (stageConfig.height - rec.y) / scale.value;
  const x2 = (rec.x + rec.width) / scale.value;
  const y2 = (y1 - rec.height) / scale.value;
  // Trangky trong VTCKy: khi tách trang sẽ chuẩn hóa về 1
  return `${x1} ${y1} ${x2} ${y2} ${Trangky.value}`;
};

const handleMouseDown = () => {
  if (!startDrawing.value) return;
  drawing.value = true;
  const pos = getPointerPosition();
  startX.value = pos.x;
  startY.value = pos.y;
};

const handleMouseMove = () => {
  if (!drawing.value) return;
  const pos = getPointerPosition();
  currentWidth.value = pos.x - startX.value;
  currentHeight.value = pos.y - startY.value;
};

const handleMouseUp = () => {
  if (!drawing.value) return;
  drawing.value = false;
  const pos = getPointerPosition();
  let x = startX.value;
  let y = startY.value;
  let width = pos.x - startX.value;
  let height = pos.y - startY.value;
  // Chuẩn hóa nếu kéo ngược
  if (width < 0) {
    x += width;
    width = Math.abs(width);
  }
  if (height < 0) {
    y += height;
    height = Math.abs(height);
  }
  currentWidth.value = 0;
  currentHeight.value = 0;
  startDrawing.value = false;

  if (width < 8 || height < 8) {
    message.warning("Vùng ký quá nhỏ, hãy khoanh lại");
    return;
  }

  const rec = { x, y, width, height };
  const stt = zones.value.length + 1;
  const item: ZoneKyItem = {
    STT: stt,
    Trangky: Trangky.value,
    VTCKy: buildVTCKy(rec),
    rec,
    scale: scale.value,
    stageWidth: stageConfig.width,
    stageHeight: stageConfig.height,
  };
  zones.value.push(item);
  emit("update:zones", [...zones.value]);
  message.success(`Đã thêm vùng ký #${stt}`);
};

const removeZone = (stt: number) => {
  zones.value = zones.value
    .filter((z) => z.STT !== stt)
    .map((z, idx) => ({ ...z, STT: idx + 1 }));
  emit("update:zones", [...zones.value]);
};

const clearZones = () => {
  zones.value = [];
  emit("update:zones", []);
};

const backTrangky = async () => {
  if (Trangky.value <= 1) return;
  Trangky.value -= 1;
  await getImageData();
};
const nextTrangky = async () => {
  if (Trangky.value >= totalPage.value) return;
  Trangky.value += 1;
  await getImageData();
};
const scaleUp = async () => {
  if (scale.value >= 2) return;
  scale.value += 0.25;
  await getImageData();
};
const scaleDown = async () => {
  if (scale.value <= 0.25) return;
  scale.value -= 0.25;
  await getImageData();
};

defineExpose({ zones, totalPage, clearZones });
</script>

<template>
  <a-spin :spinning="isLoading">
    <div class="flex gap-3">
      <div class="flex-none w-[200px] bg-white border rounded p-2">
        <a-button
          type="primary"
          class="w-full mb-2 bg-[#0055E6]"
          :disabled="!pdfData"
          @click="enableDrawing"
        >
          <template #icon><PlusOutlined /></template>
          Thêm vùng ký
        </a-button>
        <a-button class="w-full mb-3" :disabled="!zones.length" @click="clearZones">
          Xóa tất cả vùng
        </a-button>
        <div class="text-[13px] font-semibold mb-1">
          Danh sách vùng ký ({{ zones.length }})
        </div>
        <div class="max-h-[360px] overflow-auto flex flex-col gap-1">
          <div
            v-for="z in zones"
            :key="z.STT"
            class="flex justify-between items-center border rounded px-2 py-1 text-[12px]"
          >
            <span>
              #{{ z.STT }} — Trang {{ z.Trangky }}
            </span>
            <DeleteOutlined
              class="cursor-pointer text-red-500"
              @click="removeZone(z.STT)"
            />
          </div>
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <div
          class="flex items-center justify-center divide-x-4 h-[40px] bg-[#E7ECEF] gap-6 mb-2"
        >
          <div class="flex items-center justify-center gap-4 px-2">
            <a-button shape="circle" size="small" @click="scaleDown">
              <MinusOutlined />
            </a-button>
            <div>{{ scale * 100 }}%</div>
            <a-button shape="circle" size="small" @click="scaleUp">
              <PlusOutlined />
            </a-button>
          </div>
          <div class="flex gap-2 items-center px-2">
            <a-button shape="circle" size="small" @click="backTrangky">
              <LeftOutlined />
            </a-button>
            <span>Trang {{ Trangky }} / {{ totalPage || 0 }}</span>
            <a-button shape="circle" size="small" @click="nextTrangky">
              <RightOutlined />
            </a-button>
          </div>
        </div>

        <div class="flex flex-col items-center overflow-auto max-h-[70vh] bg-[#f5f5f5]">
          <canvas ref="pdfCanvas" style="display: none" />
          <v-stage
            v-if="image"
            ref="stageRef"
            :config="stageConfig"
            @mousedown="handleMouseDown"
            @mouseup="handleMouseUp"
            @mousemove="handleMouseMove"
          >
            <v-layer>
              <v-image :image="image" />
              <v-rect
                v-if="drawing"
                :x="Math.min(startX, startX + currentWidth)"
                :y="Math.min(startY, startY + currentHeight)"
                :width="Math.abs(currentWidth)"
                :height="Math.abs(currentHeight)"
                fill="rgba(0, 0, 255, 0.25)"
                stroke="blue"
                :strokeWidth="1"
              />
              <v-group v-for="z in zonesOnCurrentPage" :key="z.STT">
                <v-rect
                  :x="z.rec.x"
                  :y="z.rec.y"
                  :width="z.rec.width"
                  :height="z.rec.height"
                  fill="rgba(0, 0, 255, 0.2)"
                  stroke="#0055E6"
                  :strokeWidth="1"
                />
                <v-text
                  :x="z.rec.x"
                  :y="z.rec.y + z.rec.height / 2 - 10"
                  :width="z.rec.width"
                  :text="String(z.STT)"
                  fill="red"
                  fontStyle="bold"
                  fontSize="20"
                  align="center"
                />
              </v-group>
            </v-layer>
          </v-stage>
        </div>
      </div>
    </div>
  </a-spin>
</template>
