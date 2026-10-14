import { random } from 'lodash-es';
<template>
  <div class="bg-white w-[1040px] h-[526px] mx-auto mt-[24px] p-4">
    <h3 class="font-nunito text-[24px] leading-8 flex font-bold">
      Tài liệu tải lên (1)
    </h3>
    <a-divider />
    <a-spin :spinning="isLoading">
      <div class="grid grid-cols-1 w-[1008px]">
        <div
          class="flex justify-between p-[16px] border rounded-lg w-[1008px] h-[72px] gap-2"
        >
          <div class="flex gap-2 items-center">
            <DocumentUploadIcon />
            <div class="">
              <div>{{ fileStore.tenFile }}</div>
              <div>{{ Math.ceil(fileStore.sizeFile / 1000000) }}MB</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- <a-button
              class="w-[91px] h-[28px] bg-white border rounded-md text-[13px] font-nunito"
              @click="backStep"
              >Chỉnh sửa</a-button
            > -->
            <div
              class="w-[28px] h-[28px] border rounded-md flex items-center justify-center"
            >
              <TrashIcon @click="backStep"></TrashIcon>
            </div>
          </div>
        </div>
        <a-divider />
        <div class="flex flex-col justify-between p-[16px] h-[72px] gap-5">
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
                  ref="select"
                  v-model:value="formState.phanloaivb"
                  :options="DSDM"
                  class="custom-select w-[224px]"
                >
                </a-select>
                <a-button
                  key="submit"
                  type="primary"
                  @click="moDialogTaoDM"
                  class="w-[160px] h-[36px] bg-[#0055E6] text-white"
                  >Thêm mới danh mục
                </a-button>
              </div>
            </a-form-item>

            <a-form-item label="Chọn thư mục lưu trữ" name="folderthang">
              <a-select
                ref="select"
                v-model:value="formState.folderthang"
                :options="DSFolder"
                :placeholder="'Chọn thư mục'"
                class="custom-select w-full"
              >
                <template #option="{ value: val, label }">
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
                      v-model:value="name"
                      placeholder="Nhập tên thư mục"
                    />
                    <a-button type="text" @click="addItem">
                      <template #icon>
                        <plus-outlined />
                      </template>
                      Thêm thư mục
                    </a-button>
                  </a-space>
                </template>
              </a-select>
            </a-form-item>
          </a-form>
          <div class="flex flex-row-reverse">
            <a-button
              key="submit"
              type="primary"
              @click="nextStep"
              class="w-[140px] h-[36px] bg-[#0055E6] text-white"
              >Tiếp tục
            </a-button>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
  <div>
    <a-modal
      v-model:open="modalThemMoiThuMuc"
      :title="'THÊM MỚI DANH MỤC TÀI LIỆU'"
      centered
      @ok="xuLyThemMoiThuMuc"
      class="!w-[556px] h-[484px] !font-nunito !text-[14px] !leading-5 font-semibold"
    >
      <template #footer>
        <a-button
          key="back"
          @click="handleCanceladdNewContact"
          class="w-[140px] h-[36px] text-[#1E1E1E]"
          >Hủy</a-button
        >
        <a-button
          key="submit"
          type="primary"
          @click="xuLyThemMoiThuMuc"
          class="w-[140px] h-[36px] bg-[#0055E6] text-white"
          >Xác nhận</a-button
        >
      </template>
      <a-divider />
      <div class="grid grid-col-1 gap-[16px] h-[500px] content-start w-full">
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
              :class="'w-full'"
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
      </div>
    </a-modal>
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
import { isArray, map } from "lodash-es";
import { message } from "ant-design-vue";
import { UnwrapRef } from "vue";
import { useFileStoreHook } from "@/store/modules/file";
const fileStore = useFileStoreHook();
const Email = Storage.get("email");
const idtaikhoan = Storage.get("idTaikhoan");
const formState = reactive<any>({
  phanloaivb: "",
  folderthang: "",
});
const DSDM = ref([]);
const DSFolder = ref<any>([]);
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
const value = ref();
const inputRef = ref();
const name = ref();
const addItem = (e) => {
  e.preventDefault();
  console.log("addItem");
  DSFolder.value.push({
    label: name.value || `Thư mục mới ${Math.random()}`,
    value: name.value,
  });
  name.value = "";
  setTimeout(() => {
    inputRef.value?.focus();
  }, 0);
};
const props = defineProps(["file"]);
watch(
  () => props.file,
  (value: any) => {
    console.log(value);
  }
);
const isLoading = ref(false);
onMounted(async () => {
  try {
    isLoading.value = true;
    await GetDMTailieu();
    await GetFolder();
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
});
const xuLyThemMoiThuMuc = async () => {
  try {
    await ThemmoiDMTailieu();
    await GetDMTailieu();
    modalThemMoiThuMuc.value = false;
  } catch (error) {
    console.log("error", error);
  }
};
const modalThemMoiThuMuc = ref(false);
const moDialogTaoDM = () => {
  modalThemMoiThuMuc.value = true;
};
const formState1: UnwrapRef<any> = reactive({
  MaDM: undefined,
  idtaikhoan: idtaikhoan,
  TenDM: "",
  Ghichu: undefined,
});
const handleCanceladdNewContact = () => {
  resetFormThemMoiDM();
  modalThemMoiThuMuc.value = false;
};
const ThemmoiDMTailieu = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <ThemmoiDMTailieu xmlns="http://tempuri.org/">
          <idtaikhoan>${idtaikhoan}</idtaikhoan>
          <TenDM>${formState1.TenDM}</TenDM>
          <Ghichu>${formState1.Ghichu}</Ghichu>
        </ThemmoiDMTailieu>
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
    const resultNode = xmlDoc.getElementsByTagName("ThemmoiDMTailieuResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    if (Number(resultValue) === -2) {
      message.error("Danh mục đã tồn tại");
    } else if (Number(resultValue) === -1) {
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) >= 1) {
      message.success("Thêm mới danh mục thành công");
      modalThemMoiThuMuc.value = false;
      resetFormThemMoiDM();
    }
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const GetDMTailieu = async () => {
  // URL của API server SOAP
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  // Envelope của SOAP request
  const soapEnvelope = `
   <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <GetDMTailieu xmlns="http://tempuri.org/">
          <idtaikhoan>${idtaikhoan}</idtaikhoan>
        </GetDMTailieu>
      </soap12:Body>
    </soap12:Envelope>
     `;

  // Thực hiện request SOAP sử dụng axios
  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: {
      "Content-Type": "application/soap+xml;charset=UTF-8",
    },
  });
  let dataJson = convertXmlToJson(response.data);
  let arrayData;
  const DocumentElement =
    dataJson["soap:Envelope"]["soap:Body"]["GetDMTailieuResponse"][
      "GetDMTailieuResult"
    ]["diffgr:diffgram"]["DocumentElement"];
  if (DocumentElement) {
    arrayData = DocumentElement["dsDanhmuc"];
  }
  if (arrayData) {
    if (isArray(arrayData)) {
      arrayData.forEach((obj: { key: any; MaDM: any }) => {
        obj.key = obj.MaDM;
      });
    } else {
      arrayData.key = arrayData.MaDM;
      arrayData = [arrayData];
    }
  } else {
    arrayData = [];
  }
  const convertArrayData: any = map(arrayData, (obj) => {
    return {
      value: obj.MaDM,
      label: obj.TenDM,
    };
  });
  DSDM.value.push(...convertArrayData);
};
const GetFolder = async () => {
  try {
    const url = `${import.meta.env.VITE_APP_BASE_URL_API || "https://apiuploadedoc.nacencomm.vn"}/api/data/GetFolder?taikhoan=${Email}`;
    let response =await axios.post(url);
    DSFolder.value = await map(response.data, (obj) => {
        return {
          value: obj,
          label: obj,
        };
      });
  } catch (error) {
    message.error("Lỗi hệ thống");
      console.log("Không gọi được API GetFolder");
  }
};
const GanDMTailieu = async () => {
  // URL của API server SOAP
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  // Envelope của SOAP request
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

  // Thực hiện request SOAP sử dụng axios
  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: {
      "Content-Type": "application/soap+xml;charset=UTF-8",
    },
  });
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");
  const resultNode = xmlDoc.getElementsByTagName("GanDMTailieuResult")[0];
  const resultValue = resultNode.textContent || resultNode.innerText;
  // Cập nhật giá trị kết quả
  if (Number(resultValue) === -1) {
    error.value = true;
    message.error("Lỗi hệ thống");
  } else if (Number(resultValue) === 1) {
  }
};
const TaoVB = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
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

    // Thực hiện request SOAP sử dụng axios
    const response = await axios.post(apiUrl, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml;charset=UTF-8",
      },
    });

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "text/xml");
    const resultNode = xmlDoc.getElementsByTagName("TaoVBResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    console.log(resultValue);
    if (Number(resultValue) === -1) {
      error.value = true;
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) >= 1) {
      fileStore.idFile = resultValue;
    }
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const UploadFile = async () => {
  try {
    isLoading.value = true;
    const url = `${import.meta.env.VITE_APP_BASE_URL_API || "https://apiuploadedoc.nacencomm.vn"}/api/data/Upload?taikhoan=${Email}&thumucluu=${formState.folderthang}`;
    const file = fileStore.fileInfo;
    const formData = new FormData();
    formData.append("file", file);
    const response: any = await axios.post(url, formData);
    const result = response.data[0];
    if (result.kq === 1) {
      fileStore.setVitriLuu(result);
    }
  } catch (err) {
    error.value = true;
    message.error("Lỗi hệ thống");
    console.error("Error uploading file:", err);
  } finally {
    isLoading.value = false;
  }
};
const formRef = ref();
const emit = defineEmits(["changeStep"]);
const error = ref(false);
const nextStep = async () => {
  try {
    error.value = false;
    await formRef.value.validate();
    await UploadFile();
    if (error.value) {
      return;
    }
    await TaoVB();
    if (error.value) {
      return;
    }
    await GanDMTailieu();
    if (error.value) {
      return;
    }
    console.log(error.value);
    emit("changeStep", 1);
  } catch (error) {}
};
const backStep = () => {
  emit("changeStep", 0, 1);
};
const resetFormThemMoiDM = () => {
  formState1.TenDM = "";
  formState1.Ghichu = "";
};
const rules: Record<string, Rule[]> = {
  phanloaivb: [
    {
      required: true,
      message: "Hãy chọn danh mục tài liệu",
      trigger: "change",
    },
  ],
  folderthang: [
    {
      required: true,
      message: "Hãy chọn thư mục",
      trigger: "change",
    },
  ],
};
const rules1: Record<string, Rule[]> = {
  TenDM: [
    {
      required: true,
      message: "Hãy nhập tên thư mục",
      trigger: "change",
    },
  ],
};
</script>
