<template>
  <div>
    <div class="bg-white w-[1040px] mx-auto mt-[16px] px-4 pt-2">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="cosan" tab="Thiết lập có sẵn" />
        <a-tab-pane key="tuychinh" tab="Thiết lập tùy chỉnh" />
      </a-tabs>
    </div>

    <!-- Tab: Thiết lập tùy chỉnh -->
    <DayLoTuyChinhTab v-if="activeTab === 'tuychinh'" />

    <!-- Tab: Thiết lập có sẵn (form cũ) -->
    <template v-else>
    <!-- Phase 1: Upload nhiều file -->
    <template v-if="phase === 1">
      <Step1P1 multiple @uploadFiles="onUploadFiles" />
    </template>

    <!-- Phase 2: Thông tin + chọn template -->
    <template v-else>
      <div class="bg-white w-[1040px] mx-auto mt-[24px] p-4 mb-8">
        <h3 class="font-nunito text-[24px] leading-8 flex font-bold">
          Đẩy lô tài liệu 2026
        </h3>
        <a-divider />
        <a-spin :spinning="isLoading">
          <div class="grid grid-cols-1 w-[1008px]">
            <div class="flex flex-col gap-2">
              <div
                v-for="(item, index) in pendingFiles"
                :key="`${item.name}_${item.size}_${index}`"
                class="flex justify-between p-[16px] border rounded-lg w-[1008px] min-h-[72px] gap-2"
              >
                <div class="flex gap-2 items-center">
                  <DocumentUploadIcon />
                  <div>
                    <div>{{ item.name }}</div>
                    <div>
                      {{
                        item.size >= 1000000
                          ? Math.ceil(item.size / 1000000) + "MB"
                          : (item.size / 1000).toFixed(0) + "KB"
                      }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="w-[28px] h-[28px] border rounded-md flex items-center justify-center cursor-pointer"
                  >
                    <TrashIcon @click="removeFile(index)" />
                  </div>
                </div>
              </div>
              <div class="text-[13px] text-[#7C7C7E]">
                Đã chọn {{ pendingFiles.length }} file
              </div>
            </div>
            <a-divider />
            <div class="flex flex-col p-[16px] gap-5">
              <a-form
                ref="formRef"
                :layout="'vertical'"
                :model="formState"
                :class="'m-4'"
                :rules="rules"
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
                      @click="modalThemMoiThuMuc = true"
                      class="w-[160px] h-[36px] bg-[#0055E6] text-white"
                    >
                      Thêm mới danh mục
                    </a-button>
                  </div>
                </a-form-item>

                <a-form-item label="Chọn thư mục lưu trữ" name="folderthang">
                  <a-select
                    v-model:value="formState.folderthang"
                    :options="DSFolder"
                    :placeholder="'Chọn thư mục'"
                    class="custom-select w-full"
                  >
                    <template #option="{ label }">
                      <div class="flex gap-4">
                        <FolderOpenIcon />
                        {{ label }}
                      </div>
                    </template>
                    <template #dropdownRender="{ menuNode: menu }">
                      <v-nodes :vnodes="menu" />
                      <a-divider style="margin: 4px 0" />
                      <a-space style="padding: 4px 8px">
                        <a-input
                          ref="inputRef"
                          v-model:value="nameFolder"
                          placeholder="Nhập tên thư mục"
                        />
                        <a-button type="text" @click="addFolderItem">
                          <template #icon>
                            <plus-outlined />
                          </template>
                          Thêm thư mục
                        </a-button>
                      </a-space>
                    </template>
                  </a-select>
                </a-form-item>

                <a-form-item
                  label="Chọn template thiết lập ký"
                  name="templateStt"
                >
                  <a-select
                    v-model:value="formState.templateStt"
                    :options="DSTemplateOptions"
                    :placeholder="'Chọn template thiết lập ký'"
                    class="custom-select w-full"
                    @change="onTemplateChange"
                  />
                </a-form-item>

                <div
                  v-if="selectedTemplate"
                  class="text-[13px] text-[#7C7C7E] mb-2"
                >
                  Tên thiết lập:
                  <b>{{ selectedTemplate.tenTLap || `Template #${selectedTemplate.stt}` }}</b>
                </div>

                <div v-if="selectedTemplateRows.length" class="mt-2">
                  <div class="text-[13px] text-[#7C7C7E] mb-2">
                    Có thể sửa cột Tài khoản ký cho lần đẩy này. Thay đổi chỉ áp
                    dụng cho các tài liệu đang khởi tạo, không cập nhật template.
                  </div>
                  <a-table
                    :columns="templateColumns"
                    :data-source="selectedTemplateRows"
                    :pagination="false"
                    size="small"
                    :row-key="(record) => String(record.STT)"
                    bordered
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.key === 'TKKy'">
                        <a-input
                          v-model:value="record.TKKy"
                          placeholder="Nhập tài khoản ký (email)"
                          allow-clear
                        />
                      </template>
                    </template>
                  </a-table>
                </div>
              </a-form>

              <div class="flex flex-row-reverse gap-4">
                <a-button
                  type="primary"
                  @click="khoiTaoYeuCau"
                  class="w-[220px] h-[36px] bg-[#0055E6] text-white"
                >
                  Khởi tạo yêu cầu ({{ pendingFiles.length }})
                </a-button>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
    </template>

    <a-modal
      v-model:open="modalThemMoiThuMuc"
      :title="'THÊM MỚI DANH MỤC TÀI LIỆU'"
      centered
      class="!w-[556px] h-[484px] !font-nunito !text-[14px] !leading-5 font-semibold"
    >
      <template #footer>
        <a-button
          @click="handleCanceladdNewDM"
          class="w-[140px] h-[36px] text-[#1E1E1E]"
          >Hủy</a-button
        >
        <a-button
          type="primary"
          @click="xuLyThemMoiDM"
          class="w-[140px] h-[36px] bg-[#0055E6] text-white"
          >Xác nhận</a-button
        >
      </template>
      <a-divider />
      <a-form
        ref="formRef1"
        :layout="'vertical'"
        :model="formState1"
        :class="'m-4'"
        :rules="rules1"
      >
        <a-form-item label="Tên danh mục" name="TenDM">
          <a-input
            v-model:value="formState1.TenDM"
            placeholder="Nhập tên danh mục"
            class="w-full"
          />
        </a-form-item>
        <a-form-item label="Ghi chú" name="Ghichu">
          <a-textarea
            v-model:value="formState1.Ghichu"
            placeholder="Nhập ghi chú của danh mục"
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    </template>
  </div>
</template>

<script setup lang="ts">
import DocumentUploadIcon from "@/assets/img/document_upload.svg?component";
import TrashIcon from "@/assets/img/trash.svg?component";
import FolderOpenIcon from "@/assets/img/folder_open.svg?component";
import { PlusOutlined } from "@ant-design/icons-vue";
import { Storage } from "@/utils/Storage";
import { convertXmlToJson } from "@/utils/common";
import axios from "axios";
import { isArray, map, cloneDeep } from "lodash-es";
import { message } from "ant-design-vue";
import { UnwrapRef } from "vue";
import { useFileStoreHook } from "@/store/modules/file";
import Step1P1 from "@/components/create-document/upload/Step1P1.vue";
import DayLoTuyChinhTab from "@/components/daylo/DayLoTuyChinhTab.vue";
import router from "@/router";
import {
  dstemplate_thietlap,
  type TemplateThietLap,
  type TrinhTuKyItem,
} from "@/services/templateThietLap";

const fileStore = useFileStoreHook();
const Email = Storage.get("email");
const Hoten = Storage.get("Hoten");
const idtaikhoan = Storage.get("idTaikhoan");

const activeTab = ref<"cosan" | "tuychinh">("cosan");
const phase = ref(1);
const isLoading = ref(false);
const error = ref(false);
const formRef = ref();
const formRef1 = ref();
const inputRef = ref();
const nameFolder = ref("");
const modalThemMoiThuMuc = ref(false);
const pendingFiles = ref<File[]>([]);
const currentFileName = ref("");

const formState = reactive<any>({
  phanloaivb: "",
  folderthang: "",
  templateStt: undefined,
});

const formState1: UnwrapRef<any> = reactive({
  TenDM: "",
  Ghichu: undefined,
});

const DSDM = ref<any[]>([]);
const DSFolder = ref<any[]>([]);
const DSTemplate = ref<TemplateThietLap[]>([]);
const selectedTemplateRows = ref<TrinhTuKyItem[]>([]);
const selectedTemplate = ref<TemplateThietLap | null>(null);

const DSTemplateOptions = computed(() =>
  DSTemplate.value.map((t) => ({
    value: t.stt,
    label: `${t.tenTLap || `Template #${t.stt}`} (${t.items?.length || 0} người ký)`,
  }))
);

const templateColumns = [
  { title: "Trình tự ký", dataIndex: "STT", key: "STT", width: 120 },
  {
    title: "Tài khoản ký",
    dataIndex: "TKKy",
    key: "TKKy",
    width: 280,
  },
  { title: "Trang ký", dataIndex: "Trangky", key: "Trangky", width: 100 },
  { title: "Vị trí chữ ký", dataIndex: "VTCKy", key: "VTCKy" },
];

const VNodes = defineComponent({
  props: {
    vnodes: {
      type: Object,
      required: true,
    },
  },
  render() {
    return this.vnodes;
  },
});

const rules: Record<string, any[]> = {
  phanloaivb: [
    {
      required: true,
      message: "Hãy chọn danh mục tài liệu",
      trigger: "change",
    },
  ],
  folderthang: [
    { required: true, message: "Hãy chọn thư mục", trigger: "change" },
  ],
  templateStt: [
    {
      required: true,
      message: "Hãy chọn template thiết lập ký",
      trigger: "change",
    },
  ],
};

const rules1: Record<string, any[]> = {
  TenDM: [
    { required: true, message: "Hãy nhập tên thư mục", trigger: "change" },
  ],
};

const onUploadFiles = (files: File[]) => {
  pendingFiles.value = files;
  phase.value = 2;
};

const removeFile = (index: number) => {
  pendingFiles.value.splice(index, 1);
  if (!pendingFiles.value.length) {
    backToUpload();
  }
};

const backToUpload = () => {
  phase.value = 1;
  pendingFiles.value = [];
  formState.templateStt = undefined;
  selectedTemplateRows.value = [];
  selectedTemplate.value = null;
};

const addFolderItem = (e: Event) => {
  e.preventDefault();
  DSFolder.value.push({
    label: nameFolder.value || `Thư mục mới ${Math.random()}`,
    value: nameFolder.value,
  });
  nameFolder.value = "";
  setTimeout(() => inputRef.value?.focus(), 0);
};

const onTemplateChange = (stt: number) => {
  const found = DSTemplate.value.find((t) => t.stt === stt) || null;
  selectedTemplate.value = found;
  // Clone để sửa TKKy không làm thay đổi template gốc
  selectedTemplateRows.value = cloneDeep(found?.items || []).map((item) => ({
    ...item,
    TKKy: String(item.TKKy || "").trim(),
  }));
};

onMounted(async () => {
  try {
    isLoading.value = true;
    await GetDMTailieu();
    await GetFolder();
    await loadTemplates();
  } finally {
    isLoading.value = false;
  }
});

const loadTemplates = async () => {
  try {
    DSTemplate.value = await dstemplate_thietlap(Email);
  } catch (err) {
    console.error("dstemplate_thietlap error", err);
    DSTemplate.value = [];
    message.error("Không tải được danh sách template thiết lập ký");
  }
};

const handleCanceladdNewDM = () => {
  formState1.TenDM = "";
  formState1.Ghichu = "";
  modalThemMoiThuMuc.value = false;
};

const xuLyThemMoiDM = async () => {
  try {
    await ThemmoiDMTailieu();
    DSDM.value = [];
    await GetDMTailieu();
    modalThemMoiThuMuc.value = false;
  } catch (err) {
    console.log(err);
  }
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
    message.error("Lỗi hệ thống");
  }
};

/** ===== Các hàm xử lý giống Step1P2 / Step2 / Step3 / Step4 ===== */

const UploadFile = async (file: File) => {
  try {
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
  } catch (err) {
    error.value = true;
    message.error(`Lỗi upload: ${file.name}`);
    console.error("Error uploading file:", err);
  }
};

const TaoVB = async () => {
  try {
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
      message.error(`Lỗi tạo VB: ${currentFileName.value}`);
    } else if (resultValue >= 1) {
      fileStore.idFile = resultValue;
    }
  } catch (err) {
    error.value = true;
    console.error("Error calling SOAP service:", err);
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
    message.error(`Lỗi gán danh mục: ${currentFileName.value}`);
  }
};

const Thietlaptaikhoanky = async (
  thongTinNguoiKy: { TaikhoanDB: string; Hinhthucky: number },
  Trinhtuky: number
) => {
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Thietlaptaikhoanky xmlns="http://tempuri.org/">
          <idFile>${fileStore.idFile}</idFile>
          <Taikhoanky>${thongTinNguoiKy.TaikhoanDB}</Taikhoanky>
          <Trinhtuky>${Trinhtuky}</Trinhtuky>
          <Hinhthucky>${thongTinNguoiKy.Hinhthucky}</Hinhthucky>
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

const Thietlapvungky = async (thongTinNguoiKy: {
  TaikhoanDB: string;
  Trinhtuky: number | string;
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
  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
  });
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");
  const resultNode = xmlDoc.getElementsByTagName("ThietlapvungkyResult")[0];
  const resultValue = Number(resultNode?.textContent || resultNode?.innerHTML);
  if (resultValue === -1) {
    error.value = true;
    message.error("Lỗi hệ thống");
  }
};

const sendEmail = async () => {
  const users = selectedTemplateRows.value;
  if (!users.length) return;
  const htmlData = await fetch("/template/NotificationSign.html");
  const htmlContent = await htmlData.text();
  const replacedHtmlContent = htmlContent
    .replace("{url}", `https://ca2sp.nacencomm.vn`)
    .replace("{nameSend}", Hoten)
    .replace("{nameFile}", fileStore.tenFile)
    .replace("{noidung}", "");
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <SendMail xmlns="http://tempuri.org/">
          <emailnhan>${users[0].TKKy}</emailnhan>
          <Subject>${fileStore.tenFile}</Subject>
          <body><![CDATA[${replacedHtmlContent}]]></body>
          <CCMail></CCMail>
          <tieude>CA2.SignPlatform</tieude>
        </SendMail>
      </soap12:Body>
    </soap12:Envelope>
  `;
  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
  });
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");
  const resultNode = xmlDoc.getElementsByTagName("SendMailResult")[0];
  const resultValue = Number(resultNode?.textContent || resultNode?.innerHTML);
  if (resultValue !== 1) {
    message.error(`Gửi email thất bại: ${currentFileName.value}`);
  }
};

const Capnhattieudeguimail = async () => {
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <Capnhattieudeguimail xmlns="http://tempuri.org/">
            <idFile>${fileStore.idFile}</idFile>
            <tieude>CA2.SignPlatform</tieude>
            <subject>${fileStore.tenFile}</subject>
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
 * Khởi tạo từng file trong lô với cùng danh mục / thư mục / template
 */
const xuLyMotFile = async (file: File) => {
  error.value = false;
  currentFileName.value = file.name;
  fileStore.idFile = undefined;
  fileStore.Vitriluu = undefined;

  await UploadFile(file);
  if (error.value) return false;

  await TaoVB();
  if (error.value) return false;

  await GanDMTailieu();
  if (error.value) return false;

  for (const row of selectedTemplateRows.value) {
    await Thietlaptaikhoanky(
      { TaikhoanDB: String(row.TKKy), Hinhthucky: 1 },
      Number(row.STT)
    );
    if (error.value) return false;
  }

  for (const row of selectedTemplateRows.value) {
    await Thietlapvungky({
      TaikhoanDB: String(row.TKKy),
      Trinhtuky: row.STT,
      Hinhthucky: 1,
      Trangky: row.Trangky,
      info: String(row.VTCKy),
    });
    if (error.value) return false;
  }

  await sendEmail();
  await Capnhattieudeguimail();
  await GuiVB();
  return true;
};

const khoiTaoYeuCau = async () => {
  try {
    await formRef.value.validate();
    if (!pendingFiles.value.length) {
      message.error("Hãy chọn ít nhất một file");
      return;
    }
    if (!selectedTemplateRows.value.length) {
      message.error("Template không có dữ liệu người ký");
      return;
    }

    const missingSigner = selectedTemplateRows.value.find(
      (row) => !String(row.TKKy || "").trim()
    );
    if (missingSigner) {
      message.error(
        `Hãy nhập tài khoản ký cho trình tự ký ${missingSigner.STT}`
      );
      return;
    }

    // Chuẩn hóa email/tài khoản vừa sửa — chỉ dùng cho lần đẩy này
    selectedTemplateRows.value = selectedTemplateRows.value.map((row) => ({
      ...row,
      TKKy: String(row.TKKy || "").trim(),
    }));

    isLoading.value = true;
    let successCount = 0;
    const failed: string[] = [];

    for (const file of pendingFiles.value) {
      const ok = await xuLyMotFile(file);
      if (ok) successCount += 1;
      else failed.push(file.name);
    }

    if (successCount > 0 && failed.length === 0) {
      message.success(`Khởi tạo thành công ${successCount} tài liệu`);
      router.push({ path: "/quan-ly/tai-lieu" });
    } else if (successCount > 0) {
      message.warning(
        `Thành công ${successCount}/${pendingFiles.value.length}. Lỗi: ${failed.join(", ")}`
      );
      router.push({ path: "/quan-ly/tai-lieu" });
    } else {
      message.error("Khởi tạo yêu cầu thất bại");
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};
</script>
