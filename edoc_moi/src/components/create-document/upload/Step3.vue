<template>
  <div class="flex items-stretch">
    <div
      class="flex-none w-[240px] content-center h-screen bg-white p-2 self-stretch"
    >
      <a-select
        ref="select"
        v-model:value="formData.TaikhoanDB"
        :options="listVungKy"
        :placeholder="'Chọn người ký'"
        class="custom-select w-[224px]"
      >
        <template #option="{ value: val, label }">
          <div class="flex gap-4">
            {{ label }}
          </div>
        </template>
      </a-select>
      <a-divider />
      <div class="flex justify-center items-center flex-col gap-2">
        <a-button
          type="text"
          @click="enableDrawing"
          v-if="drawingState === 0"
          class="flex items-center text-[#0055E6] border-none"
        >
          <template #icon>
            <plus-outlined />
          </template>
          Thêm vùng ký
        </a-button>
        <template v-if="drawingState === 1">
          <div
            class="flex justify-between text-[13px] font-nunito leading-5 w-full"
          >
            <div>Vùng ký đã khoanh</div>
            <div>{{ getTrinhTuKy() }}</div>
          </div>
          <a-button
            type="primary"
            class="w-full bg-[#0055E6] text-white"
            @click="saveRectangles"
          >
            Lưu
          </a-button>
          <a-button class="w-full" @click="cancelRectangles">Hủy </a-button>
        </template>
        <template v-if="drawingState === 2">
          <div
            class="flex justify-between text-[13px] font-nunito leading-5 w-full"
          >
            <div>Đã thiết lập vùng ký</div>
            <div>{{ getTrinhTuKy() }}</div>
          </div>
          <a-button
            type="primary"
            class="w-full bg-[#0055E6] text-white"
            @click="changeRectangles"
          >
            Thay đổi
          </a-button>
        </template>
      </div>
    </div>
    <div class="flex-1">
      <a-spin :spinning="isLoading">
        <div
          class="flex items-center justify-center divide-x-4 h-[40px] bg-[#E7ECEF] gap-6"
        >
          <div class="flex items-center justify-center gap-4">
            <a-button
              @click="scaleDown"
              shape="circle"
              :size="'small'"
              class="flex items-center justify-center"
            >
              <MinusOutlined />
            </a-button>
            <div>{{ scale * 100 }}%</div>
            <a-button
              @click="scaleUp"
              shape="circle"
              :size="'small'"
              class="flex items-center justify-center"
            >
              <PlusOutlined />
            </a-button>
          </div>
          <div class="flex gap-2">
            <a-button
              @click="backTrangky"
              shape="circle"
              :size="'small'"
              class="flex items-center justify-center"
            >
              <LeftOutlined />
            </a-button>
            <span>Trang {{ Trangky }} / Tổng {{ totalPage }} trang</span>
            <a-button
              @click="nextTrangky"
              shape="circle"
              :size="'small'"
              class="flex items-center justify-center"
            >
              <RightOutlined />
            </a-button>
          </div>
          <div class="flex gap-4">
            <!-- <HandIcon />
            <PrintIcon /> -->
          </div>
        </div>
        <div class="flex flex-col items-center">
          <div>
            <canvas ref="pdfCanvas" style="display: none"></canvas>
            <v-stage
              ref="stageRef"
              :config="stageConfig"
              @mousedown="handleMouseDown"
              @mouseup="handleMouseUp"
              @mousemove="handleMouseMove"
              class="z-50"
            >
              <v-layer>
                <v-image :image="image" />
                <v-rect
                  v-if="drawing"
                  :x="startX"
                  :y="startY"
                  :width="currentWidth"
                  :height="currentHeight"
                  fill="rgba(0, 0, 255, 0.3)"
                />

                <v-group v-for="(rec, index) in recs">
                  <v-rect
                    :x="rec[`x${index + 1}`]"
                    :y="rec[`y${index + 1}`]"
                    :width="rec[`width${index + 1}`]"
                    :height="rec[`height${index + 1}`]"
                    fill="rgba(0, 0, 255, 0.3)"
                  />
                  <!-- <v-text
                    v-if="rec[`x${index + 1}`] && rec[`y${index + 1}`]"
                    :x="rec[`x${index + 1}`] + rec[`width${index + 1}`] / 2"
                    :y="rec[`y${index + 1}`] + rec[`height${index + 1}`] / 2"
                    fill="black"
                    :text="index + 1"
                    align="center"
                    verticalAlign="middle"
                  /> -->
                </v-group>
              </v-layer>
            </v-stage>
          </div>
        </div>
      </a-spin>
    </div>
    <div class="flex-none w-[240px] bg-white h-screen p-2 self-stretch">
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
        <div>{{ fileStore.tenFile }}</div>
        <!-- <a-select
          ref="select"
          v-model:value="formData.fileId"
          :options="listFile"
          :placeholder="'Chọn thư mục'"
          class="custom-select w-[224px] border-none"
          :bordered="false"
        >
        </a-select> -->
      </div>
    </div>
  </div>
  <div
    class="flex justify-end gap-4 p-2 bg-white fixed bottom-[16px] right-0 left-[256px]"
  >
    <a-button
      class="w-[140px] h-[36px] border rounded-md bg-white text-[#1E1E1E]"
      @click="backStep"
      >Quay lại</a-button
    >
    <a-button
      class="w-[140px] h-[36px] border rounded-md bg-[#0055E6] text-white mr-[30px]"
      @click="nextStep"
      >Tiếp tục</a-button
    >
  </div>
</template>
<script lang="ts" setup>
import {
  PlusOutlined,
  MinusOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons-vue";
import TextSniperIcon from "@/assets/img/text_sniper.svg?component";
import HandIcon from "@/assets/img/hand.svg?component";
import PrintIcon from "@/assets/img/print.svg?component";
import { useFileStoreHook } from "@/store/modules/file";
import { convertXmlToJson } from "@/utils/common";
import { Storage } from "@/utils/Storage";

import axios from "axios";
import {
  cloneDeep,
  each,
  filter,
  find,
  forEach,
  isArray,
  map,
} from "lodash-es";
import { message } from "ant-design-vue";
import { pdfjsLib } from "@/utils/pdfjsSetup";
import { fetchUploadResultBlob } from "@/utils/fileStorage";

const props = defineProps({
  /** Giữ prop để tương thích TaoMoiTaiLieu2026 */
  preferLocalFile: { type: Boolean, default: false },
});

const fileStore = useFileStoreHook();
const Email = Storage.get("email");

const drawingState = ref(0);
const formData = reactive<any>({
  TaikhoanDB: null,
});
const listUser = ref<any>([]);
// Vùng chọn chữ ký
const listVungKy = ref<any>([]);
const scale = ref(1);
const totalPage = ref();
const Trangky = ref(1);
const stageConfig = reactive({
  width: 800,
  height: 800,
});
const pdfCanvas = ref(null);
const startDrawing = ref(false);
const stageRef = ref();
const drawing = ref(false);
const startX = ref(0);
const startY = ref(0);
const currentWidth = ref(0);
const currentHeight = ref(0);
const rec = ref<any>([]);
const recs = ref<any>([]);
const image = ref<any>();
const pdfDocument = ref<any>();
const pdfSource = ref();
const isLoading = ref(false);

/**
 * View PDF bước 3:
 * - Lấy path từ Linkfile / sourcefile (API Upload bước 1)
 * - Tải qua GetFile khi FE ở domain khác ca2sp (edoc_test...) để tránh CORS
 */
const loadPdfFromUploadResult = async () => {
  const link = String(fileStore.LinkFile || "");
  const source = String(fileStore.sourcefile || "");
  const vitri = String(fileStore.Vitriluu || "");

  console.log("Step3 upload paths:", { link, source, vitri, host: location.host });

  const { blob, viewUrl, sourcePath } = await fetchUploadResultBlob({
    LinkFile: link,
    sourcefile: source,
    Vitriluu: vitri,
  });

  pdfSource.value = viewUrl || link;
  console.log("Step3 loaded via", viewUrl, "sourcePath=", sourcePath, "size=", blob.size);

  if (!blob.size) {
    throw new Error("File PDF rỗng");
  }

  const data = await blob.arrayBuffer();
  return await pdfjsLib.getDocument({ data }).promise;
};

onMounted(async () => {
  setListVungKy();
  try {
    isLoading.value = true;
    pdfDocument.value = await loadPdfFromUploadResult();
    totalPage.value = pdfDocument.value.numPages;
    await nextTick();
    await getImageData();
  } catch (err: any) {
    console.error("Không tải được PDF để thiết lập vùng ký:", err);
    console.error(
      "LinkFile=",
      fileStore.LinkFile,
      "sourcefile=",
      fileStore.sourcefile,
      "Vitriluu=",
      fileStore.Vitriluu
    );
    message.error(
      `Không xem được file PDF: ${err?.message || "lỗi không xác định"}`
    );
  } finally {
    isLoading.value = false;
  }
});
const setListVungKy = () => {
  const ListTaiKhoanKy = filter(fileStore.ListTaiKhoanKy, (obj) => {
    return obj.Hinhthucky !== 2;
  });
  forEach(ListTaiKhoanKy, (obj, index) => {
    if (obj.Hinhthucky !== 2) {
      listVungKy.value.push({
        TaikhoanDB: obj.TaikhoanDB,
        Trinhtuky: index + 1,
        Hinhthucky: obj.Hinhthucky,
        label: `${obj.TaikhoanDB}(Trình tự ký ${index + 1})`,
        value: `${obj.TaikhoanDB}_${index + 1}`,
      });
      listUser.value.push({
        label: `${obj.TaikhoanDB}(Trình tự ký ${index + 1})`,
        value: `${obj.TaikhoanDB}_${index + 1}`,
        HotenTKDB: obj.HotenTKDB,
        idDanhba: obj.idDanhba,
      });
      recs.value.push({
        [`x${index + 1}`]: 0,
        [`y${index + 1}`]: 0,
        [`width${index + 1}`]: 0,
        [`height${index + 1}`]: 0,
      });
    }
  });
};
const getTrinhTuKy = () => {
  let splitArray = formData.TaikhoanDB.split("_");
  return splitArray[splitArray.length - 1];
};
const viewportConst = reactive<any>({});
const getImageData = async () => {
  if (!pdfDocument.value) return;
  const page = await toRaw(pdfDocument.value).getPage(Trangky.value);
  const canvas: any = pdfCanvas.value;
  if (!canvas) {
    throw new Error("pdfCanvas chưa sẵn sàng");
  }
  const viewport = page.getViewport({ scale: scale.value });
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  canvas.style.height = `${viewport.width * window.devicePixelRatio}px`;
  canvas.style.width = `${viewport.width * window.devicePixelRatio}px`;
  viewportConst.height = viewport.height;
  viewportConst.width = viewport.width;
  stageConfig.height = viewport.height;
  stageConfig.width = viewport.width;
  const canvasContext = canvas.getContext("2d");
  const renderContext = {
    canvasContext,
    viewport,
  };
  await page.render(renderContext).promise;

  const imageDataURL = canvas.toDataURL();
  image.value = new window.Image();
  image.value.src = imageDataURL;
};
const backTrangky = async () => {
  Trangky.value = Trangky.value > 1 ? Trangky.value - 1 : Trangky.value;
  await getImageData();
};
const nextTrangky = async () => {
  Trangky.value =
    Trangky.value < totalPage.value ? Trangky.value + 1 : Trangky.value;
  await getImageData();
};
const scaleUp = async () => {
  scale.value = scale.value < 2 ? scale.value + 0.25 : scale.value;
  await getImageData();
};
const scaleDown = async () => {
  scale.value = scale.value > 0.25 ? scale.value - 0.25 : scale.value;
  await getImageData();
};
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
    recs.value[getTrinhTuKy() - 1] = {
      [`x${getTrinhTuKy()}`]: startX.value,
      [`y${getTrinhTuKy()}`]: startY.value,
      [`width${getTrinhTuKy()}`]: width,
      [`height${getTrinhTuKy()}`]: height,
    };
  }

  currentWidth.value = 0;
  currentHeight.value = 0;
};

const handleMouseMove = (e: any) => {
  if (!drawing.value) return;

  const pos = getPointerPosition();
  console.log(pos);
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
const enableDrawing = () => {
  if (!formData.TaikhoanDB) {
    message.error("Hãy chọn người ký");
    return;
  }
  const dataKy: any = find(listVungKy.value, {
    value: formData.TaikhoanDB,
  });

  if (dataKy && dataKy.daKyNhap === 1) {
    rec.value = dataKy.rec;
    Trangky.value = dataKy.Trangky;
    Object.assign(stageConfig, dataKy.stageConfig);
    scale.value = dataKy.scale;
  }
  startDrawing.value = true;
  drawingState.value = 1;
};
const saveRectangles = () => {
  // Đây là nơi bạn có thể xử lý lưu hình đã vẽ (ví dụ: gửi lên server, lưu vào cơ sở dữ liệu, ...)
  console.log("Hình đã vẽ:", rec.value);
  console.log(
    "File - Chiều dài :" +
      stageConfig.height +
      "||  Chiều rộng :" +
      stageConfig.width
  );
  console.log("page :" + Trangky.value);
  console.log("scale :" + scale.value);
  map(listVungKy.value, (obj: any) => {
    if (obj.value === formData.TaikhoanDB) {
      obj.Trangky = cloneDeep(Trangky.value);
      obj.rec = cloneDeep(rec.value);
      obj.stageConfig = cloneDeep(stageConfig);
      obj.scale = cloneDeep(scale.value);
      obj.daKyNhap = 1;
      const x1 = rec.value.x / scale.value;
      const y1 = (stageConfig.height - rec.value.y) / scale.value;
      const x2 = (rec.value.x + rec.value.width) / scale.value;
      const y2 = (y1 - rec.value.height) / scale.value;
      obj.info = `${x1} ${y1} ${x2} ${y2} ${Trangky.value}`;
      console.log(obj.info);
    }
  });
  drawingState.value = 2;
  startDrawing.value = false;
};
watch(
  () => formData.TaikhoanDB,
  async (TaikhoanDB) => {
    const dataKy: any = find(listVungKy.value, {
      value: TaikhoanDB,
    });

    if (dataKy && dataKy.daKyNhap === 1) {
      rec.value = dataKy.rec;
      scale.value = dataKy.scale;
      Object.assign(stageConfig, dataKy.stageConfig);
      Trangky.value = dataKy.Trangky;
      drawingState.value = 2;
    } else {
      drawingState.value = 0;
      startDrawing.value = false;
      rec.value = null;
      scale.value = 1;
      stageConfig.height = viewportConst.height;
      stageConfig.width = viewportConst.width;
      Trangky.value = 1;
    }
    await getImageData();
  }
);
const cancelRectangles = () => {
  map(listVungKy.value, (obj: any) => {
    if (obj.value === formData.TaikhoanDB) {
      obj.Trangky = 1;
      obj.rec = null;
      stageConfig.height = viewportConst.height;
      stageConfig.width = viewportConst.width;
      obj.info = null;
      obj.scale = 1;
      obj.daKyNhap = 0;
    }
  });
  rec.value = null;
  recs.value[getTrinhTuKy() - 1] = {
    [`x${getTrinhTuKy()}`]: 0,
    [`y${getTrinhTuKy()}`]: 0,
    [`width${getTrinhTuKy()}`]: 0,
    [`height${getTrinhTuKy()}`]: 0,
  };
  drawingState.value = 0;
  startDrawing.value = false;
};
const changeRectangles = () => {
  startDrawing.value = true;
  drawingState.value = 1;
};
const error = ref(false);
const Thietlapvungky = async (thongTinNguoiKy: any) => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Thietlapvungky xmlns="http://tempuri.org/">
          <idFile>${fileStore.idFile}</idFile>
          <Taikhoanky>${thongTinNguoiKy.TaikhoanDB}</Taikhoanky>
          <Trinhtuky>${thongTinNguoiKy.Trinhtuky}</Trinhtuky>
          <Hinhthucky>${thongTinNguoiKy.Hinhthucky}</Hinhthucky>
          <Trangky>${thongTinNguoiKy.Trangky}</Trangky>
          <info>${thongTinNguoiKy.info}</info>
          <Toadocuoi></Toadocuoi>
          <Mamauvungky></Mamauvungky>
          <Taikhoantao>${Email}</Taikhoantao>
        </Thietlapvungky>
      </soap12:Body>
    </soap12:Envelope>
     `;

    // Thực hiện request SOAP sử dụng axios
    const response = await axios.post(apiUrl, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml;charset=UTF-8",
      },
    });

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "text/xml");
    const resultNode = xmlDoc.getElementsByTagName("ThietlapvungkyResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerHTML;
    if (Number(resultValue) === -1) {
      error.value = true;
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) >= 0) {
    }
    // Cập nhật giá trị kết quả
  } catch (err) {
    error.value = true;
    message.error("Lỗi hệ thống");
    console.error("Error calling SOAP service:", err);
  }
};
const emit = defineEmits(["changeStep"]);
const nextStep = async () => {
  try {
    isLoading.value = true;
    const taiKhoanChuaKy: any = filter(listVungKy.value, function (o) {
      return !o.info;
    });
    if (taiKhoanChuaKy.length > 0) {
      message.error("Hãy chọn vùng ký cho " + taiKhoanChuaKy[0].label);
      return;
    }
    for (const user of listVungKy.value) {
      await Thietlapvungky(user);
    }
    if (!error.value) {
      fileStore.setListVungKy(cloneDeep(listVungKy.value));
      emit("changeStep", 3);
    }
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
};
const backStep = () => {
  emit("changeStep", 0, 1);
};
</script>
