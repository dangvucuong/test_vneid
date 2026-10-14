<template>
  <div class="pt-[6px] gap-1 px-3 bg-white h-full">
    <div class="page-header flex items-center justify-between text-[#343436]">
      <h3 class="font-nunito text-[24px] leading-8 flex font-bold">
        Quản lý danh mục
      </h3>
      <div class="flex items-center space-x-4 py-[12px]">
        <!-- <div class="search text-[#343436] flex justify-start gap-1">
          <BaseInputSearch
            v-model="formState.HotenTKDB"
            :dataSearch="listTextSearch"
            :placeholder="'Tìm kiếm liên lạc'"
            :style="'w-[360px]'"
          >
          </BaseInputSearch>
        </div> -->
        <a-button
          class="w-[156px] h-[36px] border rounded-md bg-[#0055E6] text-white"
          @click="moModalThemMoiThuMuc"
        >
          <div class="flex items-center justify-center space-x-2">
            <span>
              <AddIcon />
            </span>
            <span>Tạo danh mục mới</span>
          </div>
        </a-button>
      </div>
    </div>

    <div>
      <a-spin :spinning="isLoading">
        <a-table
          :columns="columns"
          :data-source="data"
          bordered
          :pagination="pagination"
          @change="handleTableChange"
        >
          <template
            #customFilterDropdown="{
              setSelectedKeys,
              selectedKeys,
              confirm,
              clearFilters,
              column,
            }"
          >
            <div style="padding: 8px">
              <a-input
                ref="searchInput"
                :placeholder="`Tìm kiếm ${column.title}`"
                :value="selectedKeys[0]"
                style="width: 188px; margin-bottom: 8px; display: block"
                @change="
                  (e) => setSelectedKeys(e.target.value ? [e.target.value] : [])
                "
                @pressEnter="
                  handleSearch(selectedKeys, confirm, column.dataIndex)
                "
              />
              <div class="flex items-center">
                <a-button
                  type="primary"
                  size="small"
                  style="width: 90px; margin-right: 8px"
                  @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
                  class="bg-[#1677ff]"
                >
                  <template #icon>
                    <div class="flex items-center justify-center">
                      <SearchOutlined />Tìm kiếm
                    </div>
                  </template>
                </a-button>
                <a-button
                  size="small"
                  style="width: 90px"
                  @click="handleReset(clearFilters)"
                >
                  <div class="flex items-center justify-center">Đặt lại</div>
                </a-button>
              </div>
            </div>
          </template>
          <template #customFilterIcon="{ filtered }">
            <search-outlined
              :style="{ color: filtered ? '#108ee9' : undefined }"
            />
          </template>
          <template #bodyCell="{ text, record, index, column }">
            <span
              v-if="
                searchState.searchText &&
                searchState.searchedColumn === column.dataIndex
              "
            >
              <template
                v-for="(fragment, i) in text
                  .toString()
                  .split(
                    new RegExp(
                      `(?<=${searchState.searchText})|(?=${searchState.searchText})`,
                      'i'
                    )
                  )"
              >
                <mark
                  v-if="
                    fragment.toLowerCase() ===
                    searchState.searchText.toLowerCase()
                  "
                  :key="i"
                  class="highlight"
                >
                  {{ fragment }}
                </mark>
                <template v-else>{{ fragment }}</template>
              </template>
            </span>
            <template v-if="column.key === 'action'">
              <div class="flex gap-6">
                <a-tooltip
                  placement="topLeft"
                  title="Cập nhật danh mục"
                  arrow-point-at-center
                >
                  <ModeIcon @click="xuLyCapNhatThuMuc(record.key)"></ModeIcon>
                </a-tooltip>
                <a-tooltip
                  placement="topLeft"
                  title="Xóa danh mục"
                  arrow-point-at-center
                >
                  <TrashIcon @click="xuLyXoaThuMuc(record.key)"></TrashIcon>
                </a-tooltip>
              </div>
            </template>
          </template>
        </a-table>
      </a-spin>
    </div>
  </div>
  <div>
    <a-modal
      v-model:open="modalThemMoiThuMuc"
      :title="modalFolderTitle"
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
          ref="formRef"
          :layout="'vertical'"
          :model="formState"
          :class="'m-4'"
          :rules="rules"
        >
          <a-form-item label="Tên danh mục" name="TenDM">
            <a-input
              v-model:value="formState.TenDM"
              placeholder="Nhập tên danh mục"
              :class="'w-full'"
            />
          </a-form-item>
          <a-form-item label="Ghi chú" name="Ghichu">
            <a-textarea
              v-model:value="formState.Ghichu"
              placeholder="Nhập ghi chú của danh mục"
              :auto-size="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
    <a-modal
      v-model:open="modalXoaThuMuc"
      title=""
      centered
      @ok="thucHienXuLyXoaThuMuc"
      class="!w-[540px] h-[256px] !font-nunito !text-[14px] !leading-5 font-semibold"
      :closable="false"
    >
      <template #footer>
        <div class="flex items-center justify-center">
          <a-button
            key="back"
            @click="cancelXuLyXoaThuMuc"
            class="w-[140px] h-[36px] text-[#1E1E1E]"
            >Hủy</a-button
          >
          <a-button
            key="submit"
            type="primary"
            @click="thucHienXuLyXoaThuMuc"
            class="w-[140px] h-[36px] bg-[#0055E6] text-white"
            >Xác nhận</a-button
          >
        </div>
      </template>
      <div class="grid grid-col-1 gap-[16px] content-start w-full">
        <h3 class="font-nunito text-[24px] leading-8 font-bold text-center">
          Xóa danh mục
        </h3>
        <div
          class="font-nunito text-[13px] leading-[20px] font-semibold text-center px-10"
        >
          Danh mục “<span class="text-blue-600">{{ TenThuMucCanXoa }}</span
          >” sẽ bị xoá và không thể hoàn tác. Bạn chắc chắn muốn xóa danh mục
          này?
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import AddIcon from "@/assets/img/add.svg?component";
import TrashIcon from "@/assets/img/trash.svg?component";
import ModeIcon from "@/assets/img/mode.svg?component";
import CheckCircleOutlineIcon from "@/assets/img/check_circle_outline.svg?component";
import { SearchOutlined } from "@ant-design/icons-vue";
import { Storage } from "@/utils/Storage";
import { UnwrapRef } from "vue";
import { Rule } from "ant-design-vue/es/form";
import axios from "axios";
import { message } from "ant-design-vue";
import { convertXmlToJson } from "@/utils/common";
import { find, isArray } from "lodash-es";
const modalThemMoiThuMuc = ref(false);
const bottom = ref<number>(20);
const isLoading = ref(false);
const modalFolderTitle = ref("Liên lạc mới");
const moModalThemMoiThuMuc = (id: any) => {
  modalThemMoiThuMuc.value = true;
};
const TenThuMucCanXoa = ref("");
const xuLyCapNhatThuMuc = async (id: any) => {
  const thuMuc = find(data.value, { MaDM: id });
  Object.assign(formState, thuMuc);
  modalThemMoiThuMuc.value = true;
};
const modalXoaThuMuc = ref(false);
const MaDMCanXoa = ref();
const xuLyXoaThuMuc = async (id: any) => {
  const thuMuc: any = find(data.value, { MaDM: id });
  if (thuMuc) {
    TenThuMucCanXoa.value = thuMuc.TenDM;
    modalXoaThuMuc.value = true;
    MaDMCanXoa.value = thuMuc.MaDM;
  }
};
const idtaikhoan = Storage.get("idTaikhoan");

interface FormState {
  MaDM: number | undefined;
  idtaikhoan: number;
  TenDM: string;
  Ghichu: string | undefined;
}
const formState: UnwrapRef<FormState> = reactive({
  MaDM: undefined,
  idtaikhoan: idtaikhoan,
  TenDM: "",
  Ghichu: undefined,
});
onMounted(async () => {
  isLoading.value = true;
  await LayDSThuMuc();
  isLoading.value = false;
});

const searchState = reactive({
  searchText: "",
  searchedColumn: "",
});
const handleSearch = (
  selectedKeys: string[],
  confirm: () => void,
  dataIndex: string
) => {
  confirm();
  searchState.searchText = selectedKeys[0];
  searchState.searchedColumn = dataIndex;
};
const handleReset = (clearFilters: (arg0: { confirm: boolean }) => void) => {
  clearFilters({ confirm: true });
  searchState.searchText = "";
};
const searchInput = ref();
const columns = [
  {
    title: "STT",
    dataIndex: "STT",
    key: "STT",
  },
  {
    title: "Tên danh mục",
    dataIndex: "TenDM",
    key: "TenDM",
    customFilterDropdown: true,
    onFilter: (value: any, record: any) =>
      record.TenDM.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible: any) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: "Ghi Chú",
    dataIndex: "Ghichu",
    key: "Ghichu",
    customFilterDropdown: true,
    onFilter: (value: any, record: any) =>
      record.Ghichu.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible: any) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: "",
    dataIndex: "action",
    key: "action",
  },
];
const data = ref<any[]>();

const pagination = reactive<any>({
  showQuickJumper: true,
  showLessItems: true,
  showSizeChanger: true,
  position: ["topLeft"],
});
const formRef = ref();
const xuLyThemMoiThuMuc = async () => {
  try {
    await formRef.value.validate();
    if (formState.MaDM) {
      await SuaThuMuc();
    } else {
      await ThemmoiDMTailieu();
    }
  } catch (error) {
    console.log("error", error);
  }
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
          <idtaikhoan>${formState.idtaikhoan}</idtaikhoan>
          <TenDM>${formState.TenDM}</TenDM>
          <Ghichu>${formState.Ghichu}</Ghichu>
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
    const resultNode: any = xmlDoc.getElementsByTagName(
      "ThemmoiDMTailieuResult"
    )[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    if (Number(resultValue) === -2) {
      message.error("Danh mục đã tồn tại");
    } else if (Number(resultValue) === -1) {
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) >= 1) {
      message.success("Thêm mới danh mục thành công");
      await LayDSThuMuc();
      modalThemMoiThuMuc.value = false;
      resetForm();
    }
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const SuaThuMuc = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <SuaDMTailieu xmlns="http://tempuri.org/">
              <MaDM>${formState.MaDM}</MaDM>
              <TenDM>${formState.TenDM}</TenDM>
              <Ghichu>${formState.Ghichu}</Ghichu>
            </SuaDMTailieu>
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
    const resultNode: any =
      xmlDoc.getElementsByTagName("SuaDMTailieuResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    if (Number(resultValue) === -2) {
      message.error("Thông tin danh bạ đã tồn tại");
    } else if (Number(resultValue) === -1) {
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) === 1) {
      message.success("Thành công");
      await LayDSThuMuc();
      resetForm();
      modalThemMoiThuMuc.value = false;
    }
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const XoaDMTailieu = async (id: Number) => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <XoaDMTailieu xmlns="http://tempuri.org/">
          <MaDM>${MaDMCanXoa.value}</MaDM>
        </XoaDMTailieu>
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
    const resultNode: any =
      xmlDoc.getElementsByTagName("XoaDMTailieuResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    if (Number(resultValue) === -1) {
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) === 1) {
      message.success("Thành công");
      await LayDSThuMuc();
      modalXoaThuMuc.value = false;
    }
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const LayDSThuMuc = async () => {
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
  console.log(dataJson);
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
  console.log(arrayData);
  data.value = arrayData;
};
const handleCanceladdNewContact = () => {
  resetForm();
  modalThemMoiThuMuc.value = false;
};
const thucHienXuLyXoaThuMuc = async () => {
  await XoaDMTailieu(MaDMCanXoa.value);
};

const cancelXuLyXoaThuMuc = () => {
  modalXoaThuMuc.value = false;
};
const resetForm = () => {
  const defaultValue = {
    MaDM: undefined,
    TenDM: "",
    Ghichu: "",
  };
  formRef.value.resetFields();
  Object.assign(formState, defaultValue);
};
const checkEmail = async (_rule: Rule, value: string) => {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (value && !emailRegex.test(value)) {
    return Promise.reject("Email không hợp lệ");
  }
};
const rules: Record<string, Rule[]> = {
  TenDM: [
    {
      required: true,
      message: "Hãy nhập tên thư mục",
      trigger: "change",
    },
  ],
};
const handleTableChange: TableProps["onChange"] = (pag: {
  pageSize: number;
  current: number;
}) => {
  pagination.pageSize = pag.pageSize;
};
</script>
<style scoped>
.custom-select .ant-select-selector {
  height: 36px !important;
}
</style>
