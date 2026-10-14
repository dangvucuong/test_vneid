<template>
  <div class="bg-white w-[1040px] mx-auto mt-[24px] p-4 mb-8">
    <h3 class="font-nunito text-[24px] leading-8 flex font-bold">
      Thiết lập tùy chỉnh
    </h3>
    <a-divider />
    <a-spin :spinning="isLoading">
      <!-- 1. Upload file dữ liệu tổng -->
      <div class="mb-4">
        <div class="font-semibold mb-2">1. Upload file dữ liệu tổng (Word / PDF)</div>
        <a-upload
          :before-upload="beforeUploadMaster"
          :show-upload-list="false"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        >
          <a-button type="primary" class="bg-[#0055E6]">Chọn file dữ liệu tổng</a-button>
        </a-upload>
        <div v-if="masterFileName" class="mt-2 text-[13px]">
          Đã chọn: <b>{{ masterFileName }}</b>
          <span v-if="totalPages"> — {{ totalPages }} trang</span>
        </div>
        <div class="text-[12px] text-[#7C7C7E] mt-1">
          File Word sẽ được upload lên server để convert sang PDF trước khi xem / khoanh vùng.
        </div>
      </div>

      <!-- 2. Khoanh vùng -->
      <div v-if="pdfBytes" class="mb-6">
        <div class="font-semibold mb-2">
          2. Khoanh vùng chữ ký trên tài liệu ({{ zones.length }} vùng)
        </div>
        <ZoneDrawPdfViewer
          :pdf-data="pdfBytes"
          @update:zones="onZonesUpdate"
          @ready="onPdfReady"
        />
      </div>

      <!-- 3. Excel -->
      <div class="mb-4">
        <div class="font-semibold mb-2">
          3. Upload Excel người ký (cột A = STT trang, B/C/... = tài khoản ký)
        </div>
        <a-upload
          :before-upload="beforeUploadExcel"
          :show-upload-list="false"
          accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        >
          <a-button :disabled="!pdfBytes || !zones.length">Chọn file Excel</a-button>
        </a-upload>
        <div v-if="excelFileName" class="mt-2 text-[13px]">
          Đã chọn: <b>{{ excelFileName }}</b>
          — {{ excelRows.length }} dòng, {{ signerColCount }} cột người ký
        </div>
        <div v-if="excelPreviewRows.length" class="mt-2 overflow-auto">
          <a-table
            size="small"
            bordered
            :pagination="{ pageSize: 5 }"
            :columns="excelColumns"
            :data-source="excelPreviewRows"
            row-key="pageStt"
          />
        </div>
      </div>

      <!-- 4. Danh mục + thư mục -->
      <div v-if="excelValidated" class="mb-4">
        <div class="font-semibold mb-2">4. Chọn danh mục &amp; thư mục lưu trữ</div>
        <a-form
          ref="formRef"
          layout="vertical"
          :model="formState"
          :rules="rules"
          class="m-0"
        >
          <a-form-item label="Chọn danh mục tài liệu" name="phanloaivb">
            <div class="flex gap-2">
              <a-select
                v-model:value="formState.phanloaivb"
                :options="DSDM"
                class="custom-select w-[224px]"
              />
              <a-button
                type="primary"
                class="bg-[#0055E6]"
                @click="modalThemMoiThuMuc = true"
              >
                Thêm mới danh mục
              </a-button>
            </div>
          </a-form-item>
          <a-form-item label="Chọn thư mục lưu trữ" name="folderthang">
            <a-select
              v-model:value="formState.folderthang"
              :options="DSFolder"
              placeholder="Chọn thư mục"
              class="custom-select w-full"
            />
          </a-form-item>
        </a-form>

        <div class="flex flex-row-reverse gap-4 mt-4">
          <a-button
            type="primary"
            class="w-[220px] h-[36px] bg-[#0055E6] text-white"
            @click="taoYeuCauKy"
          >
            Tạo yêu cầu ký ({{ excelRows.length }})
          </a-button>
        </div>
      </div>
    </a-spin>

    <a-modal
      v-model:open="modalThemMoiThuMuc"
      title="THÊM MỚI DANH MỤC TÀI LIỆU"
      centered
      class="!w-[556px]"
    >
      <template #footer>
        <a-button @click="handleCanceladdNewDM">Hủy</a-button>
        <a-button type="primary" class="bg-[#0055E6]" @click="xuLyThemMoiDM"
          >Xác nhận</a-button
        >
      </template>
      <a-divider />
      <a-form layout="vertical" :model="formState1" :rules="rules1" ref="formRef1">
        <a-form-item label="Tên danh mục" name="TenDM">
          <a-input v-model:value="formState1.TenDM" placeholder="Nhập tên danh mục" />
        </a-form-item>
        <a-form-item label="Ghi chú" name="Ghichu">
          <a-textarea
            v-model:value="formState1.Ghichu"
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { Modal, message } from "ant-design-vue";
import axios from "axios";
import { isArray, map } from "lodash-es";
import { Storage } from "@/utils/Storage";
import { convertXmlToJson } from "@/utils/common";
import { useFileStoreHook } from "@/store/modules/file";
import { fetchUploadResultBlob } from "@/utils/fileStorage";
import {
  parseSignerExcel,
  type ExcelSignerRow,
} from "@/utils/excelSigners";
import { extractPdfPage, normalizeVTCKyToPage1 } from "@/utils/pdfSplit";
import ZoneDrawPdfViewer, {
  type ZoneKyItem,
} from "@/components/daylo/ZoneDrawPdfViewer.vue";
import router from "@/router";

const fileStore = useFileStoreHook();
const Email = Storage.get("email");
const Hoten = Storage.get("Hoten");
const idtaikhoan = Storage.get("idTaikhoan");

const isLoading = ref(false);
const error = ref(false);
const formRef = ref();
const formRef1 = ref();
const modalThemMoiThuMuc = ref(false);

const masterFileName = ref("");
const pdfBytes = ref<ArrayBuffer | null>(null);
const totalPages = ref(0);
const zones = ref<ZoneKyItem[]>([]);

const excelFileName = ref("");
const excelRows = ref<ExcelSignerRow[]>([]);
const signerColCount = ref(0);
const excelValidated = ref(false);
const allowExtraSignersAsCopy = ref(false);

const DSDM = ref<any[]>([]);
const DSFolder = ref<any[]>([]);
const formState = reactive({
  phanloaivb: "",
  folderthang: "",
});
const formState1 = reactive({
  TenDM: "",
  Ghichu: "",
});

const rules = {
  phanloaivb: [
    { required: true, message: "Hãy chọn danh mục tài liệu", trigger: "change" },
  ],
  folderthang: [
    { required: true, message: "Hãy chọn thư mục", trigger: "change" },
  ],
};
const rules1 = {
  TenDM: [{ required: true, message: "Hãy nhập tên danh mục", trigger: "change" }],
};

const excelColumns = computed(() => {
  const cols: any[] = [
    { title: "STT trang", dataIndex: "pageStt", key: "pageStt", width: 100 },
  ];
  for (let i = 0; i < signerColCount.value; i++) {
    cols.push({
      title: `Người ký ${i + 1}`,
      dataIndex: `s${i}`,
      key: `s${i}`,
    });
  }
  return cols;
});

const excelPreviewRows = computed(() =>
  excelRows.value.map((r) => {
    const row: any = { pageStt: r.pageStt };
    r.signers.forEach((s, i) => {
      row[`s${i}`] = s;
    });
    return row;
  })
);

const onZonesUpdate = (list: ZoneKyItem[]) => {
  zones.value = list;
  // Đổi vùng ký → cần validate lại excel
  excelValidated.value = false;
};

const onPdfReady = (pages: number) => {
  totalPages.value = pages;
};

const isWordFile = (file: File) => {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".doc") ||
    name.endsWith(".docx") ||
    file.type.includes("word") ||
    file.type.includes("msword")
  );
};

const isPdfFile = (file: File) => {
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || file.type === "application/pdf";
};

/** Word → upload server → lấy PDF qua Linkfile/GetFile */
const convertWordToPdfBytes = async (file: File): Promise<ArrayBuffer> => {
  const folder = formState.folderthang || "temp_convert";
  const url = `${import.meta.env.VITE_APP_BASE_URL_API || "https://apiuploadedoc.nacencomm.vn"}/api/data/Upload?taikhoan=${Email}&thumucluu=${encodeURIComponent(folder)}`;
  const fd = new FormData();
  fd.append("file", file);
  const response: any = await axios.post(url, fd);
  const result = response.data?.[0];
  if (!result || result.kq !== 1) {
    throw new Error("Upload/convert Word thất bại");
  }
  fileStore.setVitriLuu(result);
  const { blob } = await fetchUploadResultBlob({
    LinkFile: result.Linkfile,
    sourcefile: result.sourcefile,
  });
  // Kiểm tra có phải PDF không
  const head = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
  const magic = String.fromCharCode(...head);
  if (!magic.startsWith("%PDF")) {
    throw new Error(
      "Server chưa trả về PDF sau khi upload Word. Vui lòng convert Word sang PDF rồi upload lại."
    );
  }
  return blob.arrayBuffer();
};

const beforeUploadMaster = async (file: File) => {
  try {
    isLoading.value = true;
    excelValidated.value = false;
    excelRows.value = [];
    excelFileName.value = "";
    zones.value = [];
    pdfBytes.value = null;
    masterFileName.value = file.name;

    if (isPdfFile(file)) {
      pdfBytes.value = await file.arrayBuffer();
    } else if (isWordFile(file)) {
      message.loading("Đang convert Word sang PDF...", 0);
      pdfBytes.value = await convertWordToPdfBytes(file);
      message.destroy();
      message.success("Đã convert Word sang PDF");
    } else {
      message.error("Chỉ hỗ trợ file PDF hoặc Word (.doc, .docx)");
      masterFileName.value = "";
    }
  } catch (err: any) {
    message.destroy();
    console.error(err);
    message.error(err?.message || "Không xử lý được file dữ liệu tổng");
    masterFileName.value = "";
    pdfBytes.value = null;
  } finally {
    isLoading.value = false;
  }
  return false;
};

const validateExcelAgainstMaster = async (
  rows: ExcelSignerRow[],
  colCount: number
): Promise<boolean> => {
  allowExtraSignersAsCopy.value = false;

  if (!totalPages.value) {
    message.error("Chưa có số trang file dữ liệu tổng");
    return false;
  }
  if (!zones.value.length) {
    message.error("Hãy khoanh ít nhất một vùng ký trước khi upload Excel");
    return false;
  }

  if (totalPages.value > rows.length) {
    message.error(
      `Thiếu thiết lập người ký: file tổng có ${totalPages.value} trang nhưng Excel chỉ có ${rows.length} dòng thiết lập`
    );
    return false;
  }

  const zoneCount = zones.value.length;

  // Số cột Excel > số vùng ký → confirm
  if (colCount > zoneCount) {
    const ok = await new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: "Số lượng tài khoản ký nhiều hơn số vùng ký",
        content:
          "Số lượng tài khoản ký nhiều hơn số vùng ký đã khoanh, các tài khoản thừa sẽ đẩy vào chế độ xem văn bản không có quyền ký. Bạn có muốn tiếp tục?",
        okText: "Xác nhận",
        cancelText: "Không",
        centered: true,
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
    // Xác nhận: tài khoản thừa = hình thức ký 2 (xem bản sao)
    // Không xác nhận: chỉ dùng cặp tài khoản ↔ vùng ký tương ứng, bỏ tài khoản thừa
    allowExtraSignersAsCopy.value = ok;
    if (!ok) {
      message.info(
        "Sẽ chỉ dùng số tài khoản khớp với số vùng ký đã khoanh; tài khoản thừa bị bỏ qua"
      );
    }
  }

  // Số vùng ký > số cột Excel → dùng vùng STT 1..colCount, bỏ vùng thừa (không lỗi)

  const invalidPage = rows.find(
    (r) => r.pageStt < 1 || r.pageStt > totalPages.value
  );
  if (invalidPage) {
    message.error(
      `STT trang ${invalidPage.pageStt} trong Excel không hợp lệ (file tổng có ${totalPages.value} trang)`
    );
    return false;
  }

  return true;
};

const beforeUploadExcel = async (file: File) => {
  try {
    isLoading.value = true;
    excelValidated.value = false;
    const parsed = await parseSignerExcel(file);
    const ok = await validateExcelAgainstMaster(
      parsed.rows,
      parsed.signerColCount
    );
    if (!ok) {
      excelFileName.value = "";
      excelRows.value = [];
      signerColCount.value = 0;
      return false;
    }
    excelFileName.value = file.name;
    excelRows.value = parsed.rows;
    signerColCount.value = parsed.signerColCount;
    excelValidated.value = true;
    message.success("File Excel hợp lệ");
  } catch (err: any) {
    console.error(err);
    message.error(err?.message || "Không đọc được file Excel");
  } finally {
    isLoading.value = false;
  }
  return false;
};

/** ===== API giống DayLo có sẵn ===== */
const GetDMTailieu = async () => {
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  const soapEnvelope = `
   <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <GetDMTailieu xmlns="http://tempuri.org/">
          <idtaikhoan>${idtaikhoan}</idtaikhoan>
        </GetDMTailieu>
      </soap12:Body>
    </soap12:Envelope>
  `;
  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
  });
  const dataJson = convertXmlToJson(response.data);
  let arrayData;
  const DocumentElement =
    dataJson["soap:Envelope"]["soap:Body"]["GetDMTailieuResponse"][
      "GetDMTailieuResult"
    ]["diffgr:diffgram"]["DocumentElement"];
  if (DocumentElement) arrayData = DocumentElement["dsDanhmuc"];
  if (arrayData) {
    if (isArray(arrayData)) {
      arrayData.forEach((obj: any) => {
        obj.key = obj.MaDM;
      });
    } else {
      arrayData.key = arrayData.MaDM;
      arrayData = [arrayData];
    }
  } else arrayData = [];
  DSDM.value = map(arrayData, (obj) => ({
    value: obj.MaDM,
    label: obj.TenDM,
  }));
};

const GetFolder = async () => {
  try {
    const url = `${import.meta.env.VITE_APP_BASE_URL_API || "https://apiuploadedoc.nacencomm.vn"}/api/data/GetFolder?taikhoan=${Email}`;
    const response = await axios.post(url);
    DSFolder.value = map(response.data, (obj) => ({
      value: obj,
      label: obj,
    }));
  } catch {
    message.error("Lỗi lấy thư mục");
  }
};

const handleCanceladdNewDM = () => {
  formState1.TenDM = "";
  formState1.Ghichu = "";
  modalThemMoiThuMuc.value = false;
};

const ThemmoiDMTailieu = async () => {
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <ThemmoiDMTailieu xmlns="http://tempuri.org/">
          <idtaikhoan>${idtaikhoan}</idtaikhoan>
          <TenDM>${formState1.TenDM}</TenDM>
          <Ghichu>${formState1.Ghichu || ""}</Ghichu>
        </ThemmoiDMTailieu>
      </soap12:Body>
    </soap12:Envelope>
  `;
  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
  });
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");
  const resultNode = xmlDoc.getElementsByTagName("ThemmoiDMTailieuResult")[0];
  const resultValue = Number(resultNode?.textContent || resultNode?.innerText);
  if (resultValue === -2) message.error("Danh mục đã tồn tại");
  else if (resultValue === -1) message.error("Lỗi hệ thống");
  else if (resultValue >= 1) {
    message.success("Thêm mới danh mục thành công");
    handleCanceladdNewDM();
  }
};

const xuLyThemMoiDM = async () => {
  try {
    await formRef1.value?.validate?.();
    await ThemmoiDMTailieu();
    await GetDMTailieu();
  } catch (err) {
    console.log(err);
  }
};

const UploadFileBlob = async (file: File) => {
  const url = `${import.meta.env.VITE_APP_BASE_URL_API || "https://apiuploadedoc.nacencomm.vn"}/api/data/Upload?taikhoan=${Email}&thumucluu=${formState.folderthang}`;
  const formData = new FormData();
  formData.append("file", file);
  const response: any = await axios.post(url, formData);
  const result = response.data[0];
  if (result.kq === 1) {
    fileStore.setVitriLuu(result);
    fileStore.setThongTinFile(file);
  } else {
    error.value = true;
    message.error(`Upload thất bại: ${file.name}`);
  }
};

const TaoVB = async () => {
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <TaoVB xmlns="http://tempuri.org/">
          <TenVBGoc>${fileStore.tenFile}</TenVBGoc>
          <Vitriluu>${fileStore.Vitriluu}</Vitriluu>
          <Taikhoantao>${Email}</Taikhoantao>
          <phanloaivb>${formState.phanloaivb}</phanloaivb>
          <folderthang>${formState.folderthang}</folderthang>
        </TaoVB>
      </soap12:Body>
    </soap12:Envelope>
  `;
  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
  });
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");
  const resultNode = xmlDoc.getElementsByTagName("TaoVBResult")[0];
  const resultValue = Number(resultNode?.textContent || resultNode?.innerText);
  if (resultValue === -1) {
    error.value = true;
    message.error(`Lỗi tạo VB: ${fileStore.tenFile}`);
  } else if (resultValue >= 1) {
    fileStore.idFile = resultValue;
  }
};

const GanDMTailieu = async () => {
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  const soapEnvelope = `
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <GanDMTailieu xmlns="http://tempuri.org/">
          <Taikhoantao>${Email}</Taikhoantao>
          <MaDM>${formState.phanloaivb}</MaDM>
          <idFile>${fileStore.idFile}</idFile>
        </GanDMTailieu>
      </soap12:Body>
    </soap12:Envelope>
  `;
  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
  });
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");
  const resultNode = xmlDoc.getElementsByTagName("GanDMTailieuResult")[0];
  const resultValue = Number(resultNode?.textContent || resultNode?.innerText);
  if (resultValue === -1) {
    error.value = true;
    message.error(`Lỗi gán danh mục: ${fileStore.tenFile}`);
  }
};

const Thietlaptaikhoanky = async (
  TaikhoanDB: string,
  Trinhtuky: number,
  Hinhthucky: number
) => {
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Thietlaptaikhoanky xmlns="http://tempuri.org/">
          <idFile>${fileStore.idFile}</idFile>
          <Taikhoanky>${TaikhoanDB}</Taikhoanky>
          <Trinhtuky>${Trinhtuky}</Trinhtuky>
          <Hinhthucky>${Hinhthucky}</Hinhthucky>
          <Taikhoantao>${Email}</Taikhoantao>
        </Thietlaptaikhoanky>
      </soap12:Body>
    </soap12:Envelope>
  `;
  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
  });
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");
  const resultNode = xmlDoc.getElementsByTagName("ThietlaptaikhoankyResult")[0];
  const resultValue = Number(resultNode?.textContent || resultNode?.innerHTML);
  if (resultValue === -2) {
    error.value = true;
    message.error("Tài khoản ký đã được thiết lập với trình tự khác");
  } else if (resultValue === -1) {
    error.value = true;
    message.error("Lỗi hệ thống");
  }
};

const Thietlapvungky = async (params: {
  TaikhoanDB: string;
  Trinhtuky: number;
  Hinhthucky: number;
  Trangky: number | string;
  info: string;
}) => {
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Thietlapvungky xmlns="http://tempuri.org/">
          <idFile>${fileStore.idFile}</idFile>
          <Taikhoanky>${params.TaikhoanDB}</Taikhoanky>
          <Trinhtuky>${params.Trinhtuky}</Trinhtuky>
          <Hinhthucky>${params.Hinhthucky}</Hinhthucky>
          <Trangky>${params.Trangky}</Trangky>
          <info>${params.info}</info>
          <Toadocuoi></Toadocuoi>
          <Mamauvungky></Mamauvungky>
          <Taikhoantao>${Email}</Taikhoantao>
        </Thietlapvungky>
      </soap12:Body>
    </soap12:Envelope>
  `;
  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
  });
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");
  const resultNode = xmlDoc.getElementsByTagName("ThietlapvungkyResult")[0];
  const resultValue = Number(resultNode?.textContent || resultNode?.innerHTML);
  if (resultValue === -1) {
    error.value = true;
    message.error("Lỗi thiết lập vùng ký");
  }
};

const sendEmail = async (firstSigner: string, tenFile: string) => {
  if (!firstSigner) return;
  const htmlData = await fetch("/template/NotificationSign.html");
  const htmlContent = await htmlData.text();
  const replacedHtmlContent = htmlContent
    .replace("{url}", `https://ca2sp.nacencomm.vn`)
    .replace("{nameSend}", Hoten)
    .replace("{nameFile}", tenFile)
    .replace("{noidung}", "");
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <SendMail xmlns="http://tempuri.org/">
          <emailnhan>${firstSigner}</emailnhan>
          <Subject>${tenFile}</Subject>
          <body><![CDATA[${replacedHtmlContent}]]></body>
          <CCMail></CCMail>
          <tieude>CA2.SignPlatform</tieude>
        </SendMail>
      </soap12:Body>
    </soap12:Envelope>
  `;
  await axios.post(apiUrl, soapEnvelope, {
    headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
  });
};

const Capnhattieudeguimail = async (tenFile: string) => {
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <Capnhattieudeguimail xmlns="http://tempuri.org/">
            <idFile>${fileStore.idFile}</idFile>
            <tieude>CA2.SignPlatform</tieude>
            <subject>${tenFile}</subject>
          </Capnhattieudeguimail>
        </soap12:Body>
      </soap12:Envelope>
  `;
  await axios.post(apiUrl, soapEnvelope, {
    headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
  });
};

const GuiVB = async () => {
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <GuiVB xmlns="http://tempuri.org/">
            <idFile>${fileStore.idFile}</idFile>
            <taikhoanthuchien>${Email}</taikhoanthuchien>
          </GuiVB>
        </soap12:Body>
      </soap12:Envelope>
  `;
  await axios.post(apiUrl, soapEnvelope, {
    headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
  });
};

/**
 * Mapping 1 dòng Excel + zones → danh sách thiết lập ký
 * - Cột B ↔ vùng STT 1, C ↔ STT 2, ...
 * - Vùng ký thừa (nhiều hơn cột Excel): bỏ qua
 * - Tài khoản thừa: nếu xác nhận → Hinhthucky=2, toạ độ/trang = 0; nếu không → bỏ qua
 */
const buildSignerSetupForRow = (row: ExcelSignerRow) => {
  const sortedZones = [...zones.value].sort((a, b) => a.STT - b.STT);
  const zoneCount = sortedZones.length;
  let signers = row.signers.map((s) => String(s || "").trim()).filter(Boolean);

  if (signers.length > zoneCount && !allowExtraSignersAsCopy.value) {
    signers = signers.slice(0, zoneCount);
  }

  return signers.map((email, idx) => {
    const zone = sortedZones[idx];
    if (zone) {
      return {
        TaikhoanDB: email,
        Trinhtuky: idx + 1,
        Hinhthucky: 1,
        Trangky: 1,
        info: normalizeVTCKyToPage1(zone.VTCKy),
      };
    }
    return {
      TaikhoanDB: email,
      Trinhtuky: idx + 1,
      Hinhthucky: 2,
      Trangky: 0,
      info: "0 0 0 0 0",
    };
  });
};

const xuLyMotTrang = async (row: ExcelSignerRow) => {
  error.value = false;
  if (!pdfBytes.value) return false;

  const pageBytes = await extractPdfPage(pdfBytes.value, row.pageStt);
  const baseName = masterFileName.value.replace(/\.[^.]+$/, "") || "tailieu";
  const tenFile = `${baseName}_trang${row.pageStt}.pdf`;
  const uploadFile = new File(
    [new Blob([pageBytes], { type: "application/pdf" })],
    tenFile,
    { type: "application/pdf" }
  );

  fileStore.idFile = undefined;
  fileStore.Vitriluu = undefined;

  await UploadFileBlob(uploadFile);
  if (error.value) return false;
  await TaoVB();
  if (error.value) return false;
  await GanDMTailieu();
  if (error.value) return false;

  const setups = buildSignerSetupForRow(row);
  for (const s of setups) {
    await Thietlaptaikhoanky(s.TaikhoanDB, s.Trinhtuky, s.Hinhthucky);
    if (error.value) return false;
  }
  for (const s of setups) {
    // Chỉ gọi Thietlapvungky cho người có vùng (hoặc copy với toạ độ mặc định theo yêu cầu)
    await Thietlapvungky(s);
    if (error.value) return false;
  }

  const firstSigner = setups.find((s) => s.Hinhthucky === 1)?.TaikhoanDB || setups[0]?.TaikhoanDB;
  await sendEmail(firstSigner, tenFile);
  await Capnhattieudeguimail(tenFile);
  await GuiVB();
  return true;
};

const taoYeuCauKy = async () => {
  try {
    await formRef.value.validate();
    if (!excelValidated.value || !excelRows.value.length) {
      message.error("Hãy upload và validate file Excel trước");
      return;
    }
    if (!zones.value.length) {
      message.error("Hãy khoanh vùng ký trước");
      return;
    }

    isLoading.value = true;
    let successCount = 0;
    const failed: string[] = [];

    // Chỉ xử lý các dòng có pageStt <= totalPages
    const rowsToProcess = excelRows.value.filter(
      (r) => r.pageStt >= 1 && r.pageStt <= totalPages.value
    );

    for (const row of rowsToProcess) {
      const ok = await xuLyMotTrang(row);
      if (ok) successCount += 1;
      else failed.push(`Trang ${row.pageStt}`);
    }

    if (successCount > 0 && failed.length === 0) {
      message.success(`Tạo yêu cầu ký thành công ${successCount} tài liệu`);
      router.push({ path: "/quan-ly/tai-lieu" });
    } else if (successCount > 0) {
      message.warning(
        `Thành công ${successCount}/${rowsToProcess.length}. Lỗi: ${failed.join(", ")}`
      );
      router.push({ path: "/quan-ly/tai-lieu" });
    } else {
      message.error("Tạo yêu cầu ký thất bại");
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  try {
    isLoading.value = true;
    await GetDMTailieu();
    await GetFolder();
  } finally {
    isLoading.value = false;
  }
});
</script>
