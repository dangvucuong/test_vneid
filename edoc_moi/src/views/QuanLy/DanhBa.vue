<template>
  <div class="py-[6px] gap-1 px-3 bg-white h-full">
    <div class="page-header flex items-center justify-between text-[#343436]">
      <h3 class="font-nunito text-[24px] leading-8 flex font-bold">
        Quản lý danh bạ
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
          @click="moModalThemMoiDanhBa"
        >
          <div class="flex items-center justify-center space-x-2">
            <span>
              <AddIcon />
            </span>
            <span>Thêm mới liên lạc</span>
          </div>
        </a-button>
      </div>
    </div>

    <div>
      <a-spin :spinning="isLoading">
        <a-table
          :columns="columns"
          :data-source="data"
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
                  title="Cập nhật danh bạ"
                  arrow-point-at-center
                >
                  <ModeIcon @click="xuLyCapNhatDanhBa(record.key)"></ModeIcon>
                </a-tooltip>
                <a-tooltip
                  placement="topLeft"
                  title="Xóa danh bạ"
                  arrow-point-at-center
                >
                  <TrashIcon @click="xuLyXoaDanhBa(record.key)"></TrashIcon>
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
      v-model:open="modalThemMoiDanhBa"
      :title="modalFolderTitle"
      centered
      @ok="xuLyThemMoiDanhBa"
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
          @click="xuLyThemMoiDanhBa"
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
          <a-form-item label="Họ và tên" name="HotenTKDB">
            <a-input
              v-model:value="formState.HotenTKDB"
              placeholder="Nhập họ và tên"
              :class="'w-full'"
            />
          </a-form-item>
          <a-form-item label="Tài khoản danh bạ (Email)" name="TaikhoanDB">
            <a-input
              v-model:value="formState.TaikhoanDB"
              placeholder="Nhập email"
              :class="'w-full'"
            />
          </a-form-item>
          <a-form-item label="Số điện thoại" name="sodienthoai">
            <a-input
              v-model:value="formState.SodienthoaiTKDB"
              placeholder="Nhập số điện thoại"
              :class="'w-full'"
            />
          </a-form-item>
          <a-form-item label="Mã số thuế" name="masothue">
            <a-input
              v-model:value="formState.MasothueTKDB"
              placeholder="Nhập mã số thuế của bạn"
              :class="'w-full'"
            />
          </a-form-item>
          <a-form-item label="Tên tổ chức" name="tentochuc">
            <a-input
              v-model:value="formState.TentochucTKDB"
              placeholder="Nhập tên tổ chức"
              :class="'w-full'"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
    <a-modal
      v-model:open="modalXoaDanhBa"
      title=""
      centered
      @ok="thucHienXuLyXoaDanhBa"
      class="!w-[540px] h-[256px] !font-nunito !text-[14px] !leading-5 font-semibold"
      :closable="false"
    >
      <template #footer>
        <div class="flex items-center justify-center">
          <a-button
            key="back"
            @click="cancelXuLyXoaDanhBa"
            class="w-[140px] h-[36px] text-[#1E1E1E]"
            >Hủy</a-button
          >
          <a-button
            key="submit"
            type="primary"
            @click="thucHienXuLyXoaDanhBa"
            class="w-[140px] h-[36px] bg-[#0055E6] text-white"
            >Xác nhận</a-button
          >
        </div>
      </template>
      <div class="grid grid-col-1 gap-[16px] content-start w-full">
        <h3 class="font-nunito text-[24px] leading-8 font-bold text-center">
          Xóa liên lạc
        </h3>
        <div
          class="font-nunito text-[13px] leading-[20px] font-semibold text-center px-10"
        >
          Thông tin của liên hệ “<span class="text-blue-600">{{
            HotenTKDBCanXoa
          }}</span
          >” sẽ bị xóa và không thể hoàn tác Bạn có chắc chắn muốn tiếp tục?
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
const modalThemMoiDanhBa = ref(false);
const bottom = ref<number>(20);
const isLoading = ref(false);
const modalFolderTitle = ref("Liên lạc mới");
const moModalThemMoiDanhBa = (id: any) => {
  modalThemMoiDanhBa.value = true;
};
const HotenTKDBCanXoa = ref("");
const xuLyCapNhatDanhBa = async (id: any) => {
  const danhBa = find(data.value, { idDanhba: id });
  Object.assign(formState, danhBa);
  modalThemMoiDanhBa.value = true;
};
const modalXoaDanhBa = ref(false);
const idDanhbaCanXoa = ref();
const xuLyXoaDanhBa = async (id: any) => {
  const danhBa: any = find(data.value, { idDanhba: id });
  if (danhBa) {
    HotenTKDBCanXoa.value = danhBa.HotenTKDB;
    modalXoaDanhBa.value = true;
    idDanhbaCanXoa.value = danhBa.idDanhba;
  }
};

interface FormState {
  idDanhba: string | undefined;
  Taikhoantao: string;
  TaikhoanDB: string;
  HotenTKDB: string;
  MasothueTKDB: string | undefined;
  SodienthoaiTKDB: string | undefined;
  TentochucTKDB: string | undefined;
}
const formState: UnwrapRef<FormState> = reactive({
  idDanhba: undefined,
  Taikhoantao: "",
  TaikhoanDB: "",
  HotenTKDB: "",
  MasothueTKDB: undefined,
  SodienthoaiTKDB: undefined,
  TentochucTKDB: undefined,
});
const email = Storage.get("Email");
onMounted(async () => {
  isLoading.value = true;
  await LayDSDanhba();
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
    title: "Email tài khoản",
    dataIndex: "TaikhoanDB",
    key: "TaikhoanDB",
    customFilterDropdown: true,
    onFilter: (value: any, record: any) =>
      record.TaikhoanDB.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible: any) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: "Tên khách hàng",
    dataIndex: "HotenTKDB",
    key: "HotenTKDB",
    customFilterDropdown: true,
    onFilter: (value: any, record: any) =>
      record.HotenTKDB.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible: any) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: "Số điện thoại",
    dataIndex: "SodienthoaiTKDB",
    key: "SodienthoaiTKDB",
    customFilterDropdown: true,
    onFilter: (value: any, record: any) =>
      record.SodienthoaiTKDB.toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible: any) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: "Mã số thuế",
    dataIndex: "MasothueTKDB",
    key: "MasothueTKDB",
    customFilterDropdown: true,
    onFilter: (value: any, record: any) =>
      record.MasothueTKDB.toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible: any) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: "Tên tổ chức",
    dataIndex: "TentochucTKDB",
    key: "TentochucTKDB",
    customFilterDropdown: true,
    onFilter: (value: any, record: any) =>
      record.TentochucTKDB.toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
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
const xuLyThemMoiDanhBa = async () => {
  try {
    await formRef.value.validate();
    if (formState.idDanhba) {
      await SuaDanhBa();
    } else {
      await Themmoidanhba();
    }
  } catch (error) {
    console.log("error", error);
  }
};
const Themmoidanhba = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Themmoidanhba xmlns="http://tempuri.org/">
          <Taikhoantao>${email}</Taikhoantao>
          <TaikhoanDB>${formState.TaikhoanDB}</TaikhoanDB>
          <HotenTKDB>${formState.HotenTKDB}</HotenTKDB>
          <MasothueTKDB>${formState.MasothueTKDB || ""}</MasothueTKDB>
          <SodienthoaiTKDB>${formState.SodienthoaiTKDB || ""}</SodienthoaiTKDB>
          <TentochucTKDB>${formState.TentochucTKDB || ""}</TentochucTKDB>
        </Themmoidanhba>
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
      "ThemmoidanhbaResult"
    )[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    if (Number(resultValue) === -2) {
      message.error("Thông tin danh bạ đã tồn tại");
    } else if (Number(resultValue) === -1) {
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) >= 1) {
      message.success("Thêm mới danh bạ thành công");
      await LayDSDanhba();
      modalThemMoiDanhBa.value = false;
      resetForm();
    }
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const SuaDanhBa = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Suadanhba xmlns="http://tempuri.org/">
          <idDanhba>${formState.idDanhba}</idDanhba>
          <TaikhoanDB>${formState.TaikhoanDB}</TaikhoanDB>
          <HotenTKDB>${formState.HotenTKDB}</HotenTKDB>
          <MasothueTKDB>${formState.MasothueTKDB || ""}</MasothueTKDB>
          <SodienthoaiTKDB>${formState.SodienthoaiTKDB || ""}</SodienthoaiTKDB>
          <TentochucTKDB>${formState.TentochucTKDB || ""}</TentochucTKDB>
        </Suadanhba>
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
    const resultNode: any = xmlDoc.getElementsByTagName("SuadanhbaResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    if (Number(resultValue) === -2) {
      message.error("Thông tin danh bạ đã tồn tại");
    } else if (Number(resultValue) === -1) {
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) === 1) {
      message.success("Thành công");
      await LayDSDanhba();
      resetForm();
      modalThemMoiDanhBa.value = false;
    }
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const Xoadanhba = async (id: Number) => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <Xoadanhba xmlns="http://tempuri.org/">
              <idDanhba>${id}</idDanhba>
            </Xoadanhba>
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
    const resultNode: any = xmlDoc.getElementsByTagName("XoadanhbaResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    if (Number(resultValue) === -1) {
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) === 1) {
      message.success("Thành công");
      await LayDSDanhba();
      modalXoaDanhBa.value = false;
    }
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const LayDSDanhba = async () => {
  // URL của API server SOAP
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  // Envelope của SOAP request
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <LayDSDanhba xmlns="http://tempuri.org/">
          <Email>${email}</Email>
        </LayDSDanhba>
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
    dataJson["soap:Envelope"]["soap:Body"]["LayDSDanhbaResponse"][
      "LayDSDanhbaResult"
    ]["diffgr:diffgram"]["DocumentElement"];
  if (DocumentElement) {
    arrayData = DocumentElement["DB"];
  }
  if (arrayData) {
    if (isArray(arrayData)) {
      arrayData.forEach((obj: { key: any; idDanhba: any }) => {
        obj.key = obj.idDanhba;
      });
    } else {
      arrayData.key = arrayData.idDanhba;
      arrayData = [arrayData];
    }
  } else {
    arrayData = [];
  }

  data.value = arrayData;
};
const handleCanceladdNewContact = () => {
  resetForm();
  modalThemMoiDanhBa.value = false;
};
const thucHienXuLyXoaDanhBa = async () => {
  await Xoadanhba(idDanhbaCanXoa.value);
};

const cancelXuLyXoaDanhBa = () => {
  modalXoaDanhBa.value = false;
};
const resetForm = () => {
  const defaultValue = {
    idDanhba: undefined,
    Taikhoantao: "",
    TaikhoanDB: "",
    HotenTKDB: "",
    MasothueTKDB: undefined,
    SodienthoaiTKDB: undefined,
    TentochucTKDB: undefined,
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
  TaikhoanDB: [
    {
      required: true,
      message: "Hãy nhập tài khoản danh bạ",
      trigger: "change",
    },
    { validator: checkEmail, trigger: "change" },
  ],
  HotenTKDB: [
    { required: true, message: "Hãy nhập họ và tên", trigger: "change" },
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
