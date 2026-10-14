<template>
  <div class="pt-[6px] gap-1 px-3 bg-white h-full">
    <div class="page-header flex items-center justify-between text-[#343436]">
      <h3 class="font-nunito text-[24px] leading-8 flex font-bold">
        Quản lý tài liệu
      </h3>
      <div class="flex items-center space-x-4">
        <a-button
          @click="GuiYCKyLo"
          class="w-[156px] h-[36px] border rounded-md border-[#D4D4D6] text-[#1E1E1E]"
          >Gửi yêu cầu ký lô
        </a-button>
        <router-link
          v-if="
            (JSON.parse(localStorageItem)?.value ||
              useUserStore.userInfo?.PhanloaiTK) === '1'
          "
          to="/quan-ly/day-lo-tai-lieu-2026"
          v-slot="{ href, navigate }"
        >
          <a-button
            :href="href"
            @click="navigate"
            class="h-[36px] border rounded-md border-[#D4D4D6] text-[#1E1E1E] px-3"
          >
            Đẩy lô tài liệu
          </a-button>
        </router-link>
        <div
          v-if="
            (JSON.parse(localStorageItem)?.value ||
              useUserStore.userInfo?.PhanloaiTK) === '1'
          "
          class="flex items-center space-x-2"
        >
          <router-link
            to="/quan-ly/tao-moi-tai-lieu-2026"
            v-slot="{ href, navigate }"
          >
            <a-button
              :href="href"
              @click="navigate"
              class="h-[36px] border rounded-md bg-[#0055E6] text-white px-3"
            >
              <div class="flex items-center justify-center space-x-2">
                <span>
                  <AddIcon />
                </span>
                <span>Tạo mới tài liệu</span>
              </div>
            </a-button>
          </router-link>
        </div>
      </div>
    </div>
    <div class="search py-[3px] text-[#343436] flex justify-start gap-1">
      <BaseInputSearch
        v-model="formState.TenVBGoc"
        :dataSearch="listTextSearch"
        :placeholder="'Tìm kiếm tài liệu'"
        :style="'w-[360px]'"
      >
      </BaseInputSearch>
      <!-- <BaseInputSelect></BaseInputSelect> -->
      <a-select
        style="width: 200px; height: 36px"
        ref="select"
        v-model:value="formState.MaDM"
        :options="DSDM"
        :placeholder="'Chọn danh mục'"
        class="custom-select"
      ></a-select>
      <a-button
        class="w-[156px] h-[36px] border rounded-md bg-white"
        @click="LayDSVB_TimKiem"
      >
        <div class="flex items-center space-x-2">
          <span>
            <FilterIcon />
          </span>
          <span>Bộ lọc</span>
        </div>
      </a-button>
      <a-button
        class="w-[156px] h-[36px] border rounded-md bg-white"
        @click="XoaBoLoc"
      >
        <div class="flex items-center space-x-2">
          <span>
            <ClearOutlined />
          </span>
          <span>Xóa Bộ Lọc</span>
        </div>
      </a-button>
    </div>
    <div class="flex w-full">
      <a-tabs v-model:activeKey="activeKey" class="w-full">
        <a-tab-pane key="1">
          <template #tab>Đang chờ ký ({{ tabCounts["1"] }})</template>
        </a-tab-pane>
        <a-tab-pane key="2">
          <template #tab>Tài liệu gửi đến ({{ tabCounts["2"] }})</template>
        </a-tab-pane>
        <a-tab-pane key="3">
          <template #tab>Đã gửi đi ({{ tabCounts["3"] }})</template>
        </a-tab-pane>
        <a-tab-pane key="4">
          <template #tab>Đã từ chối ({{ tabCounts["4"] }})</template>
        </a-tab-pane>
        <a-tab-pane key="6">
          <template #tab>Đã xóa ({{ tabCounts["6"] }})</template>
        </a-tab-pane>
        <a-tab-pane key="0">
          <template #tab>Tất cả tài liệu ({{ tabCounts["0"] }})</template>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div class="relative">
      <a-spin :spinning="isLoading">
        <div
          class="flex justify-end items-center flex-wrap gap-2 py-2 px-1 bg-white"
          v-if="state.selectedRowKeys.length > 0"
        >
          <a-button
            v-if="activeKey !== '6'"
            danger
            @click="xoaNhieuVBModal"
            class="min-w-[120px] h-[36px] border rounded-md"
            >Xóa tài liệu
          </a-button>
          <a-button
            type="primary"
            @click="handleMultiPrint(selectedRecords || [])"
            class="min-w-[120px] h-[36px] border rounded-md bg-[#0055E6] text-white"
            >In tài liệu
          </a-button>
          <a-button
            type="primary"
            @click="handleMultiDownload(selectedRecords || [])"
            class="min-w-[100px] h-[36px] border rounded-md bg-[#0055E6] text-white"
            >Tải xuống
          </a-button>
        </div>
        <a-table
          :row-selection="{
            selectedRowKeys: state.selectedRowKeys,
            onChange: onSelectChange,
            getCheckboxProps: getCheckboxProps,
            columnWidth: '4%',
            checkStrictly: false,
          }"
          :columns="columns"
          :pagination="pagination"
          :data-source="data"
          bordered
          :scroll="{ x: 1168 }"
          class="h-fit document-table"
          :rowExpandable="
            (record:any) => {
              return record.expand && !record.isChildren;
            }
          "
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
                  (e:any) => setSelectedKeys(e.target.value ? [e.target.value] : [])
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
                <template v-else
                  ><span :class="getColorRow(record)">{{
                    fragment
                  }}</span></template
                >
              </template>
            </span>
            <template v-if="column.key === 'action'">
              <div class="relative">
                <Popover v-slot="{ open }" class="relative z-50">
                  <PopoverButton
                    :class="open ? 'text-white' : 'text-white/90'"
                    class="group inline-flex items-center rounded-md px-3 py-2 text-base font-medium hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                  >
                    <MoreVertIcon></MoreVertIcon>
                  </PopoverButton>

                  <transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="translate-y-1 opacity-0"
                    enter-to-class="translate-y-0 opacity-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="translate-y-0 opacity-100"
                    leave-to-class="translate-y-1 opacity-0"
                  >
                    <PopoverPanel
                      class="absolute mt-3 w-[230px] max-w-sm sm:px-0 z-50 right-0"
                    >
                      <div
                        class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5"
                      >
                        <div
                          class="relative grid gap-1 bg-white p-7 lg:grid-cols-1"
                        >
                          <button
                            v-for="item in actions"
                            :key="item.name"
                            @click="item.click(record)"
                            class="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500/50"
                          >
                            <div
                              class="flex h-10 w-10 shrink-0 items-center justify-center text-white"
                            >
                              <div v-html="item.icon"></div>
                            </div>
                            <div class="ml-4">
                              <p class="text-sm font-medium text-gray-900">
                                {{ item.name }}
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </PopoverPanel>
                  </transition>
                </Popover>
              </div>
            </template>
            <template v-if="column.dataIndex === 'TenVBGoc'">
              <router-link
                :to="{
                  name: 'TaiLieuChiTiet',
                  query: {
                    idFile: record.idFile,
                    idthietlap: record.IDThietlap,
                    CheckKy: record.Checkky,
                    Trangthaiky: record.Trangthaiky,
                  },
                }"
                class="dark:text-blue-700 hover:underline text-blue-600 font-medium line-clamp-2 max-w-[300px]"
                :class="getColorRow(record)"
                >{{ record.TenVBGoc }}</router-link
              >
              <div
                v-if="Number(record.Trangthaiky) === 1"
                :class="getColorRow(record)"
              >
                Đã ký
              </div>
            </template>
            <template v-if="column.dataIndex === 'idFile'">
              <div :class="getColorRow(record)">
                {{ record.idFile }}
                <!-- <CaretDownOutlined v-show="record.expand" /> -->
              </div>
            </template>
            <template v-if="column.dataIndex === 'Taikhoanky'">
              <div :class="getColorRow(record)">{{ record.Taikhoanky }}</div>
              <div :class="getColorRow(record)">
                {{ getTenHinhthucky(record) }}
              </div>
            </template>
            <template v-if="column.dataIndex === 'GhiChu'">
              <template v-if="record.TKTuchoi">
                <div class="text-red-500">
                  Bị từ chối bởi: {{ record.TKTuchoi }}
                </div>
                <div class="text-red-500">Lý do: {{ record.Lydotuchoi }}</div>
              </template>
            </template>
          </template>
        </a-table>
        <contextHolder />
      </a-spin>
    </div>
  </div>
  <div>
    <ChonDuLieuTuModal
      :data-list="DSDM"
      :label="'Chọn thư mục tài liệu cần gán:'"
      :title="'GÁN DANH MỤC TÀI LIỆU'"
      :is-open="moModalGanDanhMuc"
      @xacNhanDM="xacNhanDM"
      @huyXacNhanDM="huyXacNhanDM"
    ></ChonDuLieuTuModal>
    <a-modal
      v-model:open="moModalGanDanhBaChiaSe"
      :title="'Chia sẻ tài liệu'"
      centered
      class="!w-[556px] !h-[617px] !font-nunito !text-[14px] !leading-5 font-semibold"
    >
      <template #footer>
        <div class="mt-2">
          <a-button
            key="back"
            @click="huyChiaSeTaiLieu"
            class="w-[140px] h-[36px] text-[#1E1E1E]"
            >Hủy</a-button
          >
          <a-button
            key="submit"
            type="primary"
            @click="ThucHienChiaSeTaiLieu"
            class="w-[140px] h-[36px] bg-[#0055E6] text-white"
            >Chia sẻ</a-button
          >
        </div>
      </template>
      <a-spin :spinning="isLoadingChiaSe">
        <a-form
          :layout="'vertical'"
          class="mb-3 h-[300px]"
          :model="nguoiNhanChiaSe"
        >
          <a-form-item
            :label="`Tài khoản không có trong danh bạ hoặc ngoài hệ thống`"
          >
            <a-input v-model:value="nguoiNhanChiaSe.ngoaiDanhBa"></a-input>
          </a-form-item>
          <a-form-item :label="'Chọn từ danh bạ'">
            <a-select
              ref="select"
              v-model:value="nguoiNhanChiaSe.trongDanhBa"
              :options="DSDanhba"
              class=""
              mode="multiple"
            >
              <template #option="{ value: val, label, HotenTKDB }">
                <div class="grid grid-cols-10">
                  <div class="flex items-center">
                    <UserOutlined :style="{ fontSize: '28px' }" />
                  </div>
                  <div>
                    <div>{{ HotenTKDB }}</div>
                    <div>{{ label }}</div>
                  </div>
                </div>
              </template>
            </a-select>
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
  <a-modal v-model:open="isShowVerifyResponse" :closable="false">
    <template v-if="VerifyResponse">
      <img src="@/assets/img/da_xac_thuc.png" />
    </template>
    <template v-else>
      <img src="@/assets/img/chua_xac_thuc.jpg" />
    </template>
    <template #footer> </template>
  </a-modal>
</template>
<script setup lang="ts">
import { saveAs } from "file-saver";
import AddIcon from "@/assets/img/add.svg?component";
import FilterIcon from "@/assets/img/filter.svg?component";
import MoreVertIcon from "@/assets/img/more_vert.svg?component";
import { Storage } from "@/utils/Storage";
import { convertXmlToJson, getDataFromXml } from "@/utils/common";
import {
  SearchOutlined,
  ClearOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  CaretDownOutlined,
} from "@ant-design/icons-vue";
import * as x509 from "@peculiar/x509";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import axios from "axios";
import { isArray, map, filter, includes, isEmpty, uniqBy } from "lodash-es";
import { UnwrapRef, createVNode } from "vue";
const idtaikhoan = Storage.get("idTaikhoan");
const Email = Storage.get("email");
import dayjs from "dayjs";
import { message, Modal, Tag } from "ant-design-vue";
import { encode } from "punycode";
import { url } from "inspector";
import { useUserStoreHook } from "@/store/modules/user";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { fetchFileBlob, getFileUrl, getPublicFileUrl } from "@/utils/fileStorage";

const [modal, contextHolder] = Modal.useModal();
const isLoading = ref(false);
const moModalGanDanhMuc = ref(false);
const isShareMulti = ref(false);
const useUserStore = useUserStoreHook();
const localStorageItem = localStorage.getItem("PHANLOAITK") || "";

const tenBatDauBangBL = (ten?: string) =>
  String(ten || "")
    .trim()
    .toUpperCase()
    .startsWith("BL");

const TaiXuong = async (record: any) => {
  try {
    let fileName = "file.pdf";
    if (record.TenVBGoc) {
      fileName = record.TenVBGoc.endsWith(".pdf")
        ? record.TenVBGoc
        : record.TenVBGoc + ".pdf";
    }
    if (tenBatDauBangBL(record.TenVBGoc)) {
      message.warning(
        `Tài liệu "${record.TenVBGoc}" có tên bắt đầu bằng BL, tạm thời không được tải về.`
      );
      return;
    }

    const blob = await fetchFileBlob(record.Vitriluu);
    saveAs(blob, fileName);
  } catch (error) {
    console.error("Lỗi khi tải file:", error);
    message.error("Không tải được file");
  }
};

const handleMultiDownload = async (records: string[]) => {
  const list = Array.isArray(records) ? records : [];
  const biCam = list.filter((record: any) => tenBatDauBangBL(record?.TenVBGoc));
  const duocTai = list.filter((record: any) => !tenBatDauBangBL(record?.TenVBGoc));
  if (biCam.length) {
    message.warning(
      biCam.length === list.length
        ? "Các tài liệu có tên bắt đầu bằng BL tạm thời không được tải về."
        : `Đã bỏ qua ${biCam.length} tài liệu có tên bắt đầu bằng BL.`
    );
  }
  if (!duocTai.length) return;

  isLoading.value = true;
  const urls = duocTai.map((record: any, index: number) => {
    let fileName = "file.pdf";
    if (record.TenVBGoc) {
      fileName = record.TenVBGoc.endsWith(".pdf")
        ? record.TenVBGoc
        : record.TenVBGoc + ".pdf";
    }

    return {
      url: getFileUrl(record.Vitriluu),
      fileName: fileName,
      index: index + 1,
    };
  });
  const zip = new JSZip();

  for (const { url, fileName, index } of urls) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      zip.file(index + "_" + fileName, blob);
    } catch (error) {
      console.error("Lỗi khi tải file:" + fileName, error);
    }
  }

  isLoading.value = false;
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, "tai_lieu.zip");
  });
};

/** Gộp các PDF đã chọn thành 1 file rồi mở hộp thoại in trình duyệt */
const handleMultiPrint = async (records: any[]) => {
  const list = Array.isArray(records) ? records : [];
  if (!list.length) {
    message.warning("Hãy chọn ít nhất một tài liệu để in");
    return;
  }

  try {
    isLoading.value = true;
    const mergedPdf = await PDFDocument.create();
    let mergedCount = 0;
    const failedNames: string[] = [];

    for (const record of list) {
      const tenVB = record?.TenVBGoc || "file.pdf";
      try {
        const blob = await fetchFileBlob(record.Vitriluu);
        const bytes = await blob.arrayBuffer();
        const srcPdf = await PDFDocument.load(bytes, {
          ignoreEncryption: true,
        });
        const pages = await mergedPdf.copyPages(
          srcPdf,
          srcPdf.getPageIndices()
        );
        pages.forEach((page) => mergedPdf.addPage(page));
        mergedCount += 1;
      } catch (err) {
        console.error("Lỗi khi lấy/gộp PDF:", tenVB, err);
        failedNames.push(tenVB);
      }
    }

    if (mergedCount === 0) {
      message.error(
        "Không gộp được file PDF nào để in. Kiểm tra định dạng file đã chọn."
      );
      return;
    }

    if (failedNames.length) {
      message.warning(
        `Đã bỏ qua ${failedNames.length} file không đọc được PDF: ${failedNames.join(", ")}`
      );
    }

    const mergedBytes = await mergedPdf.save();
    const printBlob = new Blob([mergedBytes], { type: "application/pdf" });
    const printUrl = URL.createObjectURL(printBlob);

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.src = printUrl;
    document.body.appendChild(iframe);

    const cleanup = () => {
      URL.revokeObjectURL(printUrl);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    iframe.onload = () => {
      try {
        const win = iframe.contentWindow;
        if (!win) {
          message.error("Không mở được cửa sổ in");
          cleanup();
          return;
        }
        win.focus();
        win.print();
        // Giữ iframe đến khi đóng hộp thoại in
        win.onafterprint = cleanup;
        setTimeout(cleanup, 60_000);
      } catch (printErr) {
        console.error(printErr);
        message.error("Không gọi được lệnh in từ trình duyệt");
        cleanup();
      }
    };
  } catch (error) {
    console.error("Lỗi in hàng loạt:", error);
    message.error("Lỗi hệ thống khi in tài liệu");
  } finally {
    isLoading.value = false;
  }
};

const radioStyle = reactive({
  display: "flex",
  height: "30px",
  lineHeight: "30px",
});
const getColorRow = (record: any) => {
  if (record.TenTT === "Chưa hoàn tất") {
    return "text-blue-700";
  } else if (record.TenTT === "Chờ ký") {
    return "text-blue-700";
  } else if (record.TenTT === "Đã hoàn tất") {
    return "text-green-600";
  } else if (record.TenTT === "Bản nháp") {
    return "text-[#000000]";
  } else if (record.TenTT === "Từ chối") {
    return "text-red-500";
  }
};
const getTenHinhthucky = (record: any) => {
  if (Number(record.Hinhthucky) === 0) {
    return "Phê duyệt và ký điện tử";
  } else if (Number(record.Hinhthucky) === 1) {
    return "Ký số";
  } else if (Number(record.Hinhthucky) === 2) {
    return "Nhận bản sao";
  }
};
const idTaiLieuChonDM = ref("");
const moModalDM = (obj: any) => {
  moModalGanDanhMuc.value = true;
  idTaiLieuChonDM.value = obj.idFile;
};
const moModalKhoiPhucTaiLieu = (obj: any) => {
  modal.confirm({
    title: "Bạn có chắc muốn khôi phục tài liệu",
    icon: h(ExclamationCircleOutlined),
    okText: "Xác nhận",
    okType: "danger",
    cancelText: "Hủy",
    async onOk() {
      try {
        isLoading.value = true;
        await UndoXoaVB(obj);
      } catch {
        return console.log("Lỗi hệ thống");
      } finally {
        isLoading.value = false;
      }
    },
    onCancel() {},
  });
};

const isLoadingChiaSe = ref(false);
const nguoiNhanChiaSe = reactive({
  ngoaiDanhBa: "",
  trongDanhBa: [],
});

const moModalGanDanhBaChiaSe = ref(false);
const huyChiaSeTaiLieu = () => {
  moModalGanDanhBaChiaSe.value = false;
  nguoiNhanChiaSe.ngoaiDanhBa = "";
  nguoiNhanChiaSe.trongDanhBa = [];
};
const recordTargetChiase = ref();
const ThucHienChiaSeTaiLieu = async () => {
  try {
    isLoadingChiaSe.value = true;
    const listNguoiNhanChiaSe = [];
    listNguoiNhanChiaSe.push(nguoiNhanChiaSe.ngoaiDanhBa);
    listNguoiNhanChiaSe.push(...nguoiNhanChiaSe.trongDanhBa);
    //
    let startIndex = recordTargetChiase.value.Vitriluu.indexOf("\\FILELUU");
    const url = recordTargetChiase.value.Vitriluu.slice(startIndex);
    const fileUrl = getPublicFileUrl(recordTargetChiase.value.Vitriluu);
    // const urlBase64 = btoa(unescape(encodeURIComponent(fileUrl)));
    // const urlForMail = `https://ca2sp.nacencomm.vn/viewfile.aspx?link=${urlBase64}`;
    for (let nguoiNhanChiaSe of listNguoiNhanChiaSe) {
      await sendEmail(
        nguoiNhanChiaSe,
        fileUrl,
        recordTargetChiase.value.TenVBGoc
      );
    }
    message.success("Chia sẻ thành công!");
    nguoiNhanChiaSe.ngoaiDanhBa = "";
    nguoiNhanChiaSe.trongDanhBa = [];
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingChiaSe.value = false;
    moModalGanDanhBaChiaSe.value = false;
  }
};

const DSDanhba = ref<any>([]);
const LayDSDanhba = async () => {
  // URL của API server SOAP
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  // Envelope của SOAP request
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <LayDSDanhba xmlns="http://tempuri.org/">
          <Email>${Email}</Email>
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
  const convertArrayData: any = map(arrayData, (obj) => {
    return {
      label: obj.TaikhoanDB,
      value: obj.TaikhoanDB,
      HotenTKDB: obj.HotenTKDB,
      idDanhba: obj.idDanhba,
    };
  });
  DSDanhba.value.push(...convertArrayData);
};
const sendEmail = async (emailNhan: any, url: any, TenVBGoc: any) => {
  try {
    const htmlData = await fetch("/template/NotificationShare.html");
    const htmlContent = await htmlData.text();
    const replacedHtmlContent = htmlContent
      .replace("{url}", url)
      .replace("{nameFile}", TenVBGoc)
      .replace("{nameSend}", Email);
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <SendMail xmlns="http://tempuri.org/">
          <emailnhan>${emailNhan}</emailnhan>
          <Subject>${`Bạn đang được chia sẻ tài liệu ${TenVBGoc}`}</Subject>
          <body><![CDATA[${replacedHtmlContent}]]></body>
          <CCMail></CCMail>
          <tieude>CA2.SignPlatform</tieude>
        </SendMail>
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
    const resultNode = xmlDoc.getElementsByTagName("SendMailResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerHTML;
    // Cập nhật giá trị kết quả
    if (Number(resultValue) === 1) {
      // Todo kichhoattaikhoan
    } else {
    }
    // router.push("/xac-nhan-email");
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const shareDocument = (record: any, multiShare: boolean = false) => {
  if (multiShare) {
    isShareMulti.value = true;
    recordTargetChiase.value = selectedRecords.value;
  } else {
    isShareMulti.value = false;
    recordTargetChiase.value = record;
  }
  moModalGanDanhBaChiaSe.value = true;

  // let startIndex = record.Vitriluu.indexOf("\\FILELUU");
  // const url = record.Vitriluu.slice(startIndex);
  // const fileUrl = `https://ca2sp.nacencomm.vn/${url.replace("\\", "/")}`;
  // const urlEncrypt = encrypt(``);
  // console.log(urlEncrypt);
  // const endcode = encodeURIComponent(
  //   urlEncrypt
  // );
  // message.success(endcode);
  // const test = "aHR0cHM6Ly9lZG9jLm5hY2VuY29tbS52blxGSUxFTFVVXHRoYW5odHJ1bmcuazU2YTIudHQua2h0bkBnbWFpbC5jb21cdDJcSERTRDFfQkVNUFdVLnBkZg==";
  // console.log(decodeURIComponent(test));
  // message.success(url);
};
const isShowVerifyResponse = ref(false);
const VerifyResponse = ref(false);
const VerifySignature = async (obj: any) => {
  try {
    isLoading.value = true;
    const url = `${import.meta.env.VITE_APP_BASE_URL_API || "https://apiuploadedoc.nacencomm.vn"}/api/data/VerifySignature?sourcefile=${obj.Vitriluu}`;
    const response: any = await axios.post(url);
    if (response.data) {
      VerifyResponse.value = true;
    } else {
      VerifyResponse.value = false;
    }
    isShowVerifyResponse.value = true;
    let secondsToGo = 2;
    const interval = setInterval(() => {
      secondsToGo -= 1;
    }, 1000);
    setTimeout(() => {
      clearInterval(interval);
      isShowVerifyResponse.value = false;
    }, secondsToGo * 1000);
  } catch (err) {
    message.error("Lỗi hệ thống");
  } finally {
    isLoading.value = false;
  }
};
const xacNhanDM = async (idDM: any) => {
  try {
    isLoading.value = true;
    await GanDMTailieu(idDM, idTaiLieuChonDM.value);
    moModalGanDanhMuc.value = false;
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};
const huyXacNhanDM = () => {
  idTaiLieuChonDM.value = "";
  moModalGanDanhMuc.value = false;
};

interface FormState {
  TenVBGoc: string | undefined;
  MaDM: number | undefined;
}
const formState: UnwrapRef<FormState> = reactive({
  TenVBGoc: undefined,
  MaDM: undefined,
});
const activeKey = ref("1");
const data = ref<any[]>([]);

/** Tổng số bản ghi (sau modifiedArray) của từng tab */
const tabCounts = reactive<Record<string, number>>({
  "0": 0,
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "6": 0,
});

const syncActiveTabCount = () => {
  tabCounts[activeKey.value] = Array.isArray(data.value) ? data.value.length : 0;
};

const matchListFilter = (obj: any) => {
  const keyword = formState.TenVBGoc;
  if (formState.MaDM && keyword) {
    return (
      obj.MaDM === formState.MaDM &&
      (String(obj.Taikhoantao || "").includes(keyword) ||
        String(obj.TenVBGoc || "").includes(keyword))
    );
  }
  if (formState.MaDM && !keyword) {
    return obj.MaDM === formState.MaDM;
  }
  if (!formState.MaDM && keyword) {
    return (
      String(obj.Taikhoantao || "").includes(keyword) ||
      String(obj.TenVBGoc || "").includes(keyword)
    );
  }
  return true;
};

const hasActiveFilter = () => !!(formState.MaDM || formState.TenVBGoc);

const normalizeListArray = (arrayData: any) => {
  if (!arrayData) return [];
  if (isArray(arrayData)) {
    arrayData.forEach((obj: { IDThietlap: any; key: any }) => {
      obj.key = obj.IDThietlap;
    });
    return arrayData;
  }
  arrayData.key = arrayData.IDThietlap;
  return [arrayData];
};

/** Lấy danh sách theo tab (không gán vào data) — dùng để đếm */
const fetchTabList = async (tabKey: string): Promise<any[]> => {
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  let soapEnvelope = "";
  let resultPath: string[] = [];
  let rowTag = "VB";

  if (tabKey === "1") {
    soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <LayDSVB_Choky xmlns="http://tempuri.org/">
          <Email>${Email}</Email>
        </LayDSVB_Choky>
      </soap12:Body>
    </soap12:Envelope>`;
    resultPath = ["LayDSVB_ChokyResponse", "LayDSVB_ChokyResult"];
    rowTag = "DSVBchoky";
  } else if (tabKey === "2") {
    soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <LayDSVBNhan xmlns="http://tempuri.org/">
          <Email>${Email}</Email>
        </LayDSVBNhan>
      </soap12:Body>
    </soap12:Envelope>`;
    resultPath = ["LayDSVBNhanResponse", "LayDSVBNhanResult"];
    rowTag = "DSVBnhan";
  } else if (tabKey === "3") {
    soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <LayDSVBDatao xmlns="http://tempuri.org/">
          <Email>${Email}</Email>
        </LayDSVBDatao>
      </soap12:Body>
    </soap12:Envelope>`;
    resultPath = ["LayDSVBDataoResponse", "LayDSVBDataoResult"];
    rowTag = "DSVBdatao";
  } else {
    const tieuchi = Number(tabKey);
    soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <LayDSVB xmlns="http://tempuri.org/">
          <Email>${Email}</Email>
          <tieuchi>${tieuchi}</tieuchi>
        </LayDSVB>
      </soap12:Body>
    </soap12:Envelope>`;
    resultPath = ["LayDSVBResponse", "LayDSVBResult"];
    rowTag = "VB";
  }

  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
  });
  const dataJson = convertXmlToJson(response.data);
  let node: any = dataJson?.["soap:Envelope"]?.["soap:Body"];
  for (const p of resultPath) {
    node = node?.[p];
  }
  const DocumentElement = node?.["diffgr:diffgram"]?.["DocumentElement"];
  const arrayData = DocumentElement ? DocumentElement[rowTag] : null;
  let list = modifiedArray(normalizeListArray(arrayData));
  if (hasActiveFilter()) {
    list = filter(list, matchListFilter);
  }
  return list;
};

const refreshAllTabCounts = async () => {
  const keys = ["1", "2", "3", "4", "6", "0"];
  await Promise.all(
    keys.map(async (key) => {
      try {
        const list = await fetchTabList(key);
        tabCounts[key] = list.length;
      } catch (e) {
        console.error("Lỗi đếm tab", key, e);
      }
    })
  );
};

watch(activeKey, async () => {
  addAction();
  state.selectedRowKeys = [];
  await reloadData();
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
const DSDM = ref<any[]>([
  {
    value: 89,
    label: "Danh mục hệ thống",
  },
]);
const selectedRecords = ref<any[]>();
const listTextSearch = ref<any[]>();
onMounted(async () => {
  isLoading.value = true;
  // Mặc định sẽ lấy danh sách đang chờ ký
  await GetDMTailieu();
  await LayDSVB_Choky();
  await LayDSDanhba();
  listTextSearch.value = map(data.value, "TenVBGoc");
  syncActiveTabCount();
  addAction();
  isLoading.value = false;
  // Đếm song song các tab còn lại (không chặn UI)
  void refreshAllTabCounts();
});
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
  const convertArrayData = map(arrayData, (obj) => {
    return {
      value: obj.MaDM,
      label: obj.TenDM,
    };
  });
  DSDM.value.push(...convertArrayData);
};

const modifiedArray = (arrayData: any) => {
  const customArray = arrayData.map((item: any, index: number, self: any) => {
    const isFirstOccurrence =
      self.findIndex((el: any) => el?.idFile === item?.idFile) === index;
    const isDuplicate =
      self.filter((el: any) => el?.idFile === item?.idFile).length > 1;

    if (isFirstOccurrence) {
      if (isDuplicate) {
        const childrens = self.filter(
          (el: any) => el.idFile === item.idFile && el !== item
        );
        return {
          ...item,
          expand: true,
          isChildren: false,
          children: childrens,
        };
      } else {
        return { ...item, expand: false, isChildren: false };
      }
    } else {
      return { ...item, expand: false, isChildren: true };
    }
  });

  return customArray.filter(
    (item: any) =>
      (!item?.expand && !item?.isChildren) ||
      (item?.expand && !item?.isChildren && item?.children.length > 0)
  );
};

const LayDSVB = async (tieuchi: number) => {
  // URL của API server SOAP
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  // Envelope của SOAP request
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <LayDSVB xmlns="http://tempuri.org/">
          <Email>${Email}</Email>
          <tieuchi>${tieuchi}</tieuchi>
        </LayDSVB>
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
    dataJson["soap:Envelope"]["soap:Body"]["LayDSVBResponse"]["LayDSVBResult"][
      "diffgr:diffgram"
    ]["DocumentElement"];
  if (DocumentElement) {
    arrayData = DocumentElement["VB"];
  }
  if (arrayData) {
    if (isArray(arrayData)) {
      arrayData.forEach((obj: { IDThietlap: any; key: any }) => {
        obj.key = obj.IDThietlap;
      });
    } else {
      arrayData.key = arrayData.IDThietlap;
      arrayData = [arrayData];
    }
  } else {
    arrayData = [];
  }

  data.value = modifiedArray(arrayData);
};

const LayDSVB_TimKiem = async () => {
  isLoading.value = true;

  if (activeKey.value === "0") {
    // Lấy tất cả
    await LayDSVB(0);
  } else if (activeKey.value === "1") {
    // Lấy danh sách chờ ký LayDSVB_Choky
    await LayDSVB_Choky();
  } else if (activeKey.value === "2") {
    // Danh sách gửi đến LayDSVBNhan
    await LayDSVBNhan();
  } else if (activeKey.value === "3") {
    // Danh sách  gửi đi LayDSVBDatao
    await LayDSVBDatao();
  } else if (activeKey.value === "4") {
    // Danh sách đã từ chối
    await LayDSVB(4);
  } else if (activeKey.value === "6") {
    // Đã xóa
    await LayDSVB(6);
  }

  data.value = filter(data.value, (obj) => {
    if (formState.MaDM && formState.TenVBGoc) {
      return (
        obj.MaDM === formState.MaDM &&
        (obj.Taikhoantao.includes(formState.TenVBGoc) ||
          obj.TenVBGoc.includes(formState.TenVBGoc))
      );
    } else if (formState.MaDM && !formState.TenVBGoc) {
      return obj.MaDM === formState.MaDM;
    } else if (!formState.MaDM && formState.TenVBGoc) {
      return (
        obj.Taikhoantao.includes(formState.TenVBGoc) ||
        obj.TenVBGoc.includes(formState.TenVBGoc)
      );
    } else {
      return obj;
    }
  });
  syncActiveTabCount();
  void refreshAllTabCounts();
  isLoading.value = false;
};
const LayDSVB_Choky = async () => {
  // URL của API server SOAP
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  // Envelope của SOAP request
  const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <LayDSVB_Choky xmlns="http://tempuri.org/">
          <Email>${Email}</Email>
        </LayDSVB_Choky>
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
    dataJson["soap:Envelope"]["soap:Body"]["LayDSVB_ChokyResponse"][
      "LayDSVB_ChokyResult"
    ]["diffgr:diffgram"]["DocumentElement"];
  if (DocumentElement) {
    arrayData = DocumentElement["DSVBchoky"];
  }
  if (arrayData) {
    if (isArray(arrayData)) {
      arrayData.forEach((obj: { IDThietlap: any; key: any }) => {
        obj.key = obj.IDThietlap;
      });
    } else {
      arrayData.key = arrayData.IDThietlap;
      arrayData = [arrayData];
    }
  } else {
    arrayData = [];
  }
  data.value = modifiedArray(arrayData);
};
const LayDSVBNhan = async () => {
  // URL của API server SOAP
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  // Envelope của SOAP request
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <LayDSVBNhan xmlns="http://tempuri.org/">
          <Email>${Email}</Email>
        </LayDSVBNhan>
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
    dataJson["soap:Envelope"]["soap:Body"]["LayDSVBNhanResponse"][
      "LayDSVBNhanResult"
    ]["diffgr:diffgram"]["DocumentElement"];
  if (DocumentElement) {
    arrayData = DocumentElement["DSVBnhan"];
  }
  if (arrayData) {
    if (isArray(arrayData)) {
      arrayData.forEach((obj: { IDThietlap: any; key: any }) => {
        obj.key = obj.IDThietlap;
      });
    } else {
      arrayData.key = arrayData.IDThietlap;
      arrayData = [arrayData];
    }
  } else {
    arrayData = [];
  }

  data.value = modifiedArray(arrayData);
};
const LayDSVBDatao = async () => {
  // URL của API server SOAP
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  // Envelope của SOAP request
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <LayDSVBDatao xmlns="http://tempuri.org/">
          <Email>${Email}</Email>
        </LayDSVBDatao>
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
    dataJson["soap:Envelope"]["soap:Body"]["LayDSVBDataoResponse"][
      "LayDSVBDataoResult"
    ]["diffgr:diffgram"]["DocumentElement"];
  if (DocumentElement) {
    arrayData = DocumentElement["DSVBdatao"];
  }
  if (arrayData) {
    if (isArray(arrayData)) {
      arrayData.forEach((obj: { IDThietlap: any; key: any }) => {
        obj.key = obj.IDThietlap;
      });
    } else {
      arrayData.key = arrayData.IDThietlap;
      arrayData = [arrayData];
    }
  } else {
    arrayData = [];
  }
  data.value = modifiedArray(arrayData);
};
const getUniqueSelectedRecords = () => {
  const records = Array.isArray(selectedRecords.value)
    ? selectedRecords.value
    : [];
  return uniqBy(records, "idFile");
};

const callXoaVBApi = async (record: any): Promise<number> => {
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <XoaVB xmlns="http://tempuri.org/">
          <idFile>${record.idFile}</idFile>
          <Taikhoantao>${record.Taikhoantao}</Taikhoantao>
          <Taikhoanky>${record.Taikhoanky}</Taikhoanky>
          <Taikhoanxoa>${Email}</Taikhoanxoa>
        </XoaVB>
      </soap12:Body>
    </soap12:Envelope>
     `;

  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: {
      "Content-Type": "application/soap+xml;charset=UTF-8",
    },
  });
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");
  const resultNode = xmlDoc.getElementsByTagName("XoaVBResult")[0];
  const resultValue = resultNode.textContent || resultNode.innerHTML;
  return Number(resultValue);
};

const xoaVBModal = async (record: any) => {
  Modal.confirm({
    title: "Bạn chắc chắn muốn xóa tài liệu?",
    icon: createVNode(ExclamationCircleOutlined),
    content: "",
    okText: "Xóa",
    okType: "danger",
    cancelText: "Hủy bỏ",
    async onOk() {
      isLoading.value = true;
      try {
        await XoaVB(record);
      } finally {
        isLoading.value = false;
      }
    },
    onCancel() {
      console.log("Cancel");
    },
  });
};

const xoaNhieuVBModal = () => {
  const records = getUniqueSelectedRecords();
  if (records.length === 0) {
    message.warning("Vui lòng chọn tài liệu cần xóa");
    return;
  }

  Modal.confirm({
    title: `Bạn chắc chắn muốn xóa ${records.length} tài liệu đã chọn?`,
    icon: createVNode(ExclamationCircleOutlined),
    content: "",
    okText: "Xóa",
    okType: "danger",
    cancelText: "Hủy bỏ",
    async onOk() {
      isLoading.value = true;
      try {
        await XoaNhieuVB(records);
      } finally {
        isLoading.value = false;
      }
    },
    onCancel() {},
  });
};

const XoaVB = async (record: any) => {
  const resultValue = await callXoaVBApi(record);
  if (resultValue === -3) {
    message.error("Email đã tồn tại");
  } else if (resultValue === -1) {
    message.error("Lỗi hệ thống");
  } else if (resultValue === 1) {
    message.success("Thành công");
    await reloadData();
  }
};

const XoaNhieuVB = async (records: any[]) => {
  let successCount = 0;
  let failCount = 0;

  for (const record of records) {
    try {
      const resultValue = await callXoaVBApi(record);
      if (resultValue === 1) {
        successCount++;
      } else {
        failCount++;
      }
    } catch {
      failCount++;
    }
  }

  state.selectedRowKeys = [];
  selectedRecords.value = [];

  if (successCount > 0) {
    message.success(`Đã xóa thành công ${successCount} tài liệu`);
    await reloadData();
  }
  if (failCount > 0) {
    message.error(
      successCount > 0
        ? `Không xóa được ${failCount} tài liệu`
        : "Không xóa được tài liệu nào"
    );
  }
};

const UndoXoaVB = async (record: any) => {
  // URL của API server SOAP
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  // Envelope của SOAP request
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <UndoXoaVB xmlns="http://tempuri.org/">
          <idFile>${record.idFile}</idFile>
          <Taikhoantao>${record.Taikhoantao}</Taikhoantao>
          <Taikhoanky>${record.Taikhoanky}</Taikhoanky>
          <Taikhoanxoa>${Email}</Taikhoanxoa>
        </UndoXoaVB>
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
  const resultNode = xmlDoc.getElementsByTagName("UndoXoaVBResult")[0];
  const resultValue = resultNode.textContent || resultNode.innerHTML;
  // Cập nhật giá trị kết quả
  if (Number(resultValue) === -1) {
    message.error("Lỗi hệ thống");
  } else if (Number(resultValue) === 1) {
    message.success("Thành công");
    await reloadData();
  }
  isLoading.value = false;
};
const GanDMTailieu = async (MaDM: any, idFile: any) => {
  // URL của API server SOAP
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  // Envelope của SOAP request
  const soapEnvelope = `
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <GanDMTailieu xmlns="http://tempuri.org/">
          <Taikhoantao>${Email}</Taikhoantao>
          <MaDM>${MaDM}</MaDM>
          <idFile>${idFile}</idFile>
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
  const resultValue = resultNode.textContent || resultNode.innerHTML;
  // Cập nhật giá trị kết quả
  if (Number(resultValue) === -1) {
    message.error("Lỗi hệ thống");
  } else if (Number(resultValue) === 1) {
    message.success("Thành công");
    await reloadData();
  }
  isLoading.value = false;
};
type Key = string | number;

const searchInput = ref();
const columns: any = [
  {
    title: "Mã VB",
    dataIndex: "idFile",
    key: "idFile",
    width: "8%",
    customFilterDropdown: true,
    onFilter: (value: any, record: any) =>
      record.idFile.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible: any) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
    customRender: ({ record }: { record: any }) => {
      if (record.TenTT === "Chưa hoàn tất") {
        return h("div", {
          innerHTML: record.idFile,
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Chờ ký") {
        return h("div", {
          innerHTML: record.idFile,
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Đã hoàn tất") {
        return h("div", {
          innerHTML: record.idFile,
          class: "text-green-600",
        });
      } else if (record.TenTT === "Bản nháp") {
        return h("div", {
          innerHTML: record.idFile,
          class: "text-[#000000]",
        });
      } else if (record.TenTT === "Từ chối") {
        return h("div", {
          innerHTML: record.idFile,
          class: "text-red-500",
        });
      }
    },
  },
  {
    title: "Tên văn bản",
    dataIndex: "TenVBGoc",
    key: "TenVBGoc",
    width: "20%",
    customFilterDropdown: true,
    onFilter: (value: any, record: any) =>
      record.TenVBGoc.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible: any) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: "Người gửi",
    dataIndex: "Taikhoantao",
    key: "Taikhoantao",
    width: "10%",
    customFilterDropdown: true,
    onFilter: (value: any, record: any) =>
      record.Taikhoantao.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible: any) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
    customRender: ({ record }: { record: any }) => {
      if (record.TenTT === "Chưa hoàn tất") {
        return h("div", {
          innerHTML: record.Taikhoantao,
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Chờ ký") {
        return h("div", {
          innerHTML: record.Taikhoantao,
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Đã hoàn tất") {
        return h("div", {
          innerHTML: record.Taikhoantao,
          class: "text-green-600",
        });
      } else if (record.TenTT === "Bản nháp") {
        return h("div", {
          innerHTML: record.Taikhoantao,
          class: "text-[#000000]",
        });
      } else if (record.TenTT === "Từ chối") {
        return h("div", {
          innerHTML: record.Taikhoantao,
          class: "text-red-500",
        });
      }
    },
  },
  {
    title: "Người nhận",
    dataIndex: "Taikhoanky",
    key: "Taikhoanky",
    width: "13%",
    customFilterDropdown: true,
    onFilter: (value: any, record: any) =>
      record.Taikhoanky.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible: any) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
    customRender: ({ record }: { record: any }) => {
      if (record.TenTT === "Chưa hoàn tất") {
        return h("div", {
          innerHTML: record.Taikhoanky,
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Chờ ký") {
        return h("div", {
          innerHTML: record.Taikhoanky,
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Đã hoàn tất") {
        return h("div", {
          innerHTML: record.Taikhoanky,
          class: "text-green-600",
        });
      } else if (record.TenTT === "Bản nháp") {
        return h("div", {
          innerHTML: record.Taikhoanky,
          class: "text-[#000000]",
        });
      } else if (record.TenTT === "Từ chối") {
        return h("div", {
          innerHTML: record.Taikhoanky,
          class: "text-red-500",
        });
      }
    },
  },
  {
    title: "Thời gian cập nhật",
    dataIndex: "Thoigiangui",
    key: "Thoigiangui",
    width: "10%",
    sorter: {
      compare: (a: any, b: any) =>
        dayjs(a.Thoigiangui).isBefore(dayjs(b.Thoigiangui)),
    },
    // customFilterDropdown: true,
    // onFilter: (value: any, record: any) =>
    //   dayjs(record.Thoigiangui).format("DD-MM-YYYY HH:mm:ss").toString().includes(value)
    // ,
    // onFilterDropdownOpenChange: (visible: any) => {
    //   if (visible) {
    //     setTimeout(() => {
    //       searchInput.value.focus();
    //     }, 100);
    //   }
    // },
    customRender: ({ record }: { record: any }) => {
      if (record.TenTT === "Chưa hoàn tất") {
        return h("div", {
          innerHTML: dayjs(record.Thoigiangui).format("DD-MM-YYYY HH:mm:ss"),
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Chờ ký") {
        return h("div", {
          innerHTML: dayjs(record.Thoigiangui).format("DD-MM-YYYY HH:mm:ss"),
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Đã hoàn tất") {
        return h("div", {
          innerHTML: dayjs(record.Thoigiangui).format("DD-MM-YYYY HH:mm:ss"),
          class: "text-green-600",
        });
      } else if (record.TenTT === "Bản nháp") {
        return h("div", {
          innerHTML: dayjs(record.Thoigiangui).format("DD-MM-YYYY HH:mm:ss"),
          class: "text-[#000000]",
        });
      } else if (record.TenTT === "Từ chối") {
        return h("div", {
          innerHTML: dayjs(record.Thoigiangui).format("DD-MM-YYYY HH:mm:ss"),
          class: "text-red-500",
        });
      }
    },
  },
  {
    title: "Trạng thái",
    dataIndex: "TenTT",
    key: "TenTT",
    width: "7%",
    customFilterDropdown: true,
    onFilter: (value: any, record: any) =>
      record.TenTT.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible: any) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
    customRender: ({ record }: { record: any }) => {
      if (record.TenTT === "Chưa hoàn tất") {
        return h("div", {
          innerHTML: record.TenTT,
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Chờ ký") {
        return h("div", {
          innerHTML: record.TenTT,
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Đã hoàn tất") {
        return h("div", {
          innerHTML: record.TenTT,
          class: "text-green-600",
        });
      } else if (record.TenTT === "Bản nháp") {
        return h("div", {
          innerHTML: record.TenTT,
          class: "text-[#000000]",
        });
      } else if (record.TenTT === "Từ chối") {
        return h("div", {
          innerHTML: record.TenTT,
          class: "text-red-500",
        });
      }
    },
  },
  {
    title: "Trình tự ký",
    dataIndex: "Trinhtuky",
    key: "Trinhtuky",
    width: "6%",
    sorter: {
      compare: (a: any, b: any) => a.Trinhtuky - b.Trinhtuky,
    },
    customRender: ({ record }: { record: any }) => {
      if (record.TenTT === "Chưa hoàn tất") {
        return h("div", {
          innerHTML: record.Trinhtuky,
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Chờ ký") {
        return h("div", {
          innerHTML: record.Trinhtuky,
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Đã hoàn tất") {
        return h("div", {
          innerHTML: record.Trinhtuky,
          class: "text-green-600",
        });
      } else if (record.TenTT === "Bản nháp") {
        return h("div", {
          innerHTML: record.Trinhtuky,
          class: "text-[#000000]",
        });
      } else if (record.TenTT === "Từ chối") {
        return h("div", {
          innerHTML: record.Trinhtuky,
          class: "text-red-500",
        });
      }
    },
  },
  {
    title: "Danh mục",
    dataIndex: "TenDM",
    key: "TenDM",
    width: "10%",
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
    customRender: ({ record }: { record: any }) => {
      if (record.TenTT === "Chưa hoàn tất") {
        return h("div", {
          innerHTML: record.TenDM,
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Chờ ký") {
        return h("div", {
          innerHTML: record.TenDM,
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Đã hoàn tất") {
        return h("div", {
          innerHTML: record.TenDM,
          class: "text-green-600",
        });
      } else if (record.TenTT === "Bản nháp") {
        return h("div", {
          innerHTML: record.TenDM,
          class: "text-[#000000]",
        });
      } else if (record.TenTT === "Từ chối") {
        return h("div", {
          innerHTML: record.TenDM,
          class: "text-red-500",
        });
      }
    },
  },
  {
    title: "Ghi Chú",
    dataIndex: "GhiChu",
    key: "GhiChu",
    width: "10%",
    customRender: ({ record }: { record: any }) => {
      if (record.TenTT === "Chưa hoàn tất") {
        return h("div", {
          innerHTML: record.GhiChu,
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Chờ ký") {
        return h("div", {
          innerHTML: record.GhiChu,
          class: "text-blue-700",
        });
      } else if (record.TenTT === "Đã hoàn tất") {
        return h("div", {
          innerHTML: record.GhiChu,
          class: "text-green-600",
        });
      } else if (record.TenTT === "Bản nháp") {
        return h("div", {
          innerHTML: record.GhiChu,
          class: "text-[#000000]",
        });
      } else if (record.TenTT === "Từ chối") {
        return h("div", {
          innerHTML: record.GhiChu,
          class: "text-red-500",
        });
      }
    },
  },
  {
    title: "",
    dataIndex: "action",
    width: "4%",
    key: "action",
  },
];

const pagination = reactive<any>({
  showQuickJumper: true,
  showLessItems: true,
  showSizeChanger: true,
  position: ["topLeft"],
  pageSizeOptions: ["10", "20"],
});

const state = reactive<{
  selectedRowKeys: Key[];
  loading: boolean;
}>({
  selectedRowKeys: [], // Check here to configure the default column
  loading: false,
});

const onSelectChange = (selectedRowKeys: Key[], selectedRows: any[]) => {
  state.selectedRowKeys = selectedRowKeys;
  selectedRecords.value = selectedRows;
};
const getCheckboxProps = (record: any) => ({
  disabled: Number(record.Hinhthucky) !== 1,
  name: record.name,
});
const XoaBoLoc = async () => {
  isLoading.value = true;
  formState.TenVBGoc = undefined;
  formState.MaDM = undefined;

  if (activeKey.value === "0") {
    // Lấy tất cả
    await LayDSVB(Number(activeKey.value));
  } else if (activeKey.value === "1") {
    // Lấy danh sách chờ ký LayDSVB_Choky
    await LayDSVB_Choky();
  } else if (activeKey.value === "2") {
    // Danh sách gửi đến LayDSVBNhan
    await LayDSVBNhan();
  } else if (activeKey.value === "3") {
    // Danh sách  gửi đi LayDSVBDatao
    await LayDSVBDatao();
  } else if (activeKey.value === "4") {
    // Danh sách đã từ chối
    await LayDSVB(4);
  } else if (activeKey.value === "6") {
    // Đã xóa
    await LayDSVB(6);
  }

  syncActiveTabCount();
  void refreshAllTabCounts();
  isLoading.value = false;
};
const actions = ref();
const addAction = () => {
  switch (activeKey.value) {
    case "0":
    case "1":
    case "2":
    case "3":
      actions.value = [
        {
          name: "Tải xuống",
          click: TaiXuong,
          icon: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 9H15V3H9V9H5L12 16L19 9ZM11 11V5H13V11H14.17L12 13.17L9.83 11H11ZM5 18H19V20H5V18Z" fill="black" fill-opacity="0.87"/>
    </svg>

    `,
        },
        {
          name: "Verify",
          click: VerifySignature,
          icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 stroke-black		stroke-2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>

`,
        },
        {
          name: "Gán danh mục",
          click: moModalDM,
          icon: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 6H12L10 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V8C22 6.89 21.11 6 20 6ZM20 18H4V6H9.17L11.17 8H20V18ZM12 14H14V16H16V14H18V12H16V10H14V12H12V14Z" fill="black" fill-opacity="0.87"/>
</svg>

    `,
        },
        {
          name: "Chia sẻ",
          click: shareDocument,
          icon: `
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 14.08C14.24 14.08 13.56 14.38 13.04 14.85L5.91 10.7C5.96 10.47 6 10.24 6 10C6 9.76 5.96 9.53 5.91 9.3L12.96 5.19C13.5 5.69 14.21 6 15 6C16.66 6 18 4.66 18 3C18 1.34 16.66 0 15 0C13.34 0 12 1.34 12 3C12 3.24 12.04 3.47 12.09 3.7L5.04 7.81C4.5 7.31 3.79 7 3 7C1.34 7 0 8.34 0 10C0 11.66 1.34 13 3 13C3.79 13 4.5 12.69 5.04 12.19L12.16 16.35C12.11 16.56 12.08 16.78 12.08 17C12.08 18.61 13.39 19.92 15 19.92C16.61 19.92 17.92 18.61 17.92 17C17.92 15.39 16.61 14.08 15 14.08ZM15 2C15.55 2 16 2.45 16 3C16 3.55 15.55 4 15 4C14.45 4 14 3.55 14 3C14 2.45 14.45 2 15 2ZM3 11C2.45 11 2 10.55 2 10C2 9.45 2.45 9 3 9C3.55 9 4 9.45 4 10C4 10.55 3.55 11 3 11ZM15 18.02C14.45 18.02 14 17.57 14 17.02C14 16.47 14.45 16.02 15 16.02C15.55 16.02 16 16.47 16 17.02C16 17.57 15.55 18.02 15 18.02Z" fill="black" fill-opacity="0.87"/>
    </svg>

    `,
        },
        {
          name: "Xóa tài liệu",
          click: xoaVBModal,
          icon: `
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.5 0L10.5 1H14V3H0V1H3.5L4.5 0H9.5ZM3 18C1.9 18 1 17.1 1 16V4H13V16C13 17.1 12.1 18 11 18H3ZM11 6H3V16H11V6Z" fill="#1E1E1E"/>
    </svg>
        `,
        },
      ];
      break;
    case "4":
      actions.value = [
        {
          name: "Tải xuống",
          click: TaiXuong,
          icon: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 9H15V3H9V9H5L12 16L19 9ZM11 11V5H13V11H14.17L12 13.17L9.83 11H11ZM5 18H19V20H5V18Z" fill="black" fill-opacity="0.87"/>
    </svg>

    `,
        },
        {
          name: "Gán danh mục",
          click: moModalDM,
          icon: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 6H12L10 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V8C22 6.89 21.11 6 20 6ZM20 18H4V6H9.17L11.17 8H20V18ZM12 14H14V16H16V14H18V12H16V10H14V12H12V14Z" fill="black" fill-opacity="0.87"/>
</svg>

    `,
        },
        {
          name: "Chia sẻ",
          click: shareDocument,
          icon: `
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 14.08C14.24 14.08 13.56 14.38 13.04 14.85L5.91 10.7C5.96 10.47 6 10.24 6 10C6 9.76 5.96 9.53 5.91 9.3L12.96 5.19C13.5 5.69 14.21 6 15 6C16.66 6 18 4.66 18 3C18 1.34 16.66 0 15 0C13.34 0 12 1.34 12 3C12 3.24 12.04 3.47 12.09 3.7L5.04 7.81C4.5 7.31 3.79 7 3 7C1.34 7 0 8.34 0 10C0 11.66 1.34 13 3 13C3.79 13 4.5 12.69 5.04 12.19L12.16 16.35C12.11 16.56 12.08 16.78 12.08 17C12.08 18.61 13.39 19.92 15 19.92C16.61 19.92 17.92 18.61 17.92 17C17.92 15.39 16.61 14.08 15 14.08ZM15 2C15.55 2 16 2.45 16 3C16 3.55 15.55 4 15 4C14.45 4 14 3.55 14 3C14 2.45 14.45 2 15 2ZM3 11C2.45 11 2 10.55 2 10C2 9.45 2.45 9 3 9C3.55 9 4 9.45 4 10C4 10.55 3.55 11 3 11ZM15 18.02C14.45 18.02 14 17.57 14 17.02C14 16.47 14.45 16.02 15 16.02C15.55 16.02 16 16.47 16 17.02C16 17.57 15.55 18.02 15 18.02Z" fill="black" fill-opacity="0.87"/>
    </svg>

    `,
        },
        {
          name: "Xóa tài liệu",
          click: xoaVBModal,
          icon: `
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.5 0L10.5 1H14V3H0V1H3.5L4.5 0H9.5ZM3 18C1.9 18 1 17.1 1 16V4H13V16C13 17.1 12.1 18 11 18H3ZM11 6H3V16H11V6Z" fill="#1E1E1E"/>
    </svg>
        `,
        },
      ];
      break;
    case "6":
      actions.value = [
        {
          name: "Tải xuống",
          click: TaiXuong,
          icon: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 9H15V3H9V9H5L12 16L19 9ZM11 11V5H13V11H14.17L12 13.17L9.83 11H11ZM5 18H19V20H5V18Z" fill="black" fill-opacity="0.87"/>
    </svg>

    `,
        },
        {
          name: "Khôi phục tài liệu",
          click: moModalKhoiPhucTaiLieu,
          icon: `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-[24px] h-[24px] stroke-black		stroke-2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
</svg>


    `,
        },
      ];
      break;
  }
};
const reloadData = async () => {
  isLoading.value = true;
  data.value = [];
  if (activeKey.value === "0") {
    // Lấy tất cả
    await LayDSVB(0);
  } else if (activeKey.value === "1") {
    // Lấy danh sách chờ ký LayDSVB_Choky
    await LayDSVB_Choky();
  } else if (activeKey.value === "2") {
    // Danh sách gửi đến LayDSVBNhan
    await LayDSVBNhan();
  } else if (activeKey.value === "3") {
    // Danh sách  gửi đi LayDSVBDatao
    await LayDSVBDatao();
  } else if (activeKey.value === "4") {
    // Danh sách đã từ chối
    await LayDSVB(4);
  } else if (activeKey.value === "6") {
    // Đã xóa
    await LayDSVB(6);
  }
  syncActiveTabCount();
  void refreshAllTabCounts();
  isLoading.value = false;
};
const thongtinchukyso: UnwrapRef<any> = reactive({
  Email: "",
  IDCTS: "",
  Serialno: "",
  NgayHetHanChungThuSo: "",
  cert: "",
  Phuongthucky: "",
});
const Laythietlapphuongthuckysomacdinh = async () => {
  // URL của API server SOAP
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  // Envelope của SOAP request
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Laythietlapphuongthuckysomacdinh xmlns="http://tempuri.org/">
          <Email>${Email}</Email>
        </Laythietlapphuongthuckysomacdinh>
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
  thongtinchukyso.email = getDataFromXml(xmlDoc, "Email");
  thongtinchukyso.IDCTS = getDataFromXml(xmlDoc, "IDCTS");
  thongtinchukyso.Serialno = getDataFromXml(xmlDoc, "Serialno");
  thongtinchukyso.Phuongthucky = getDataFromXml(xmlDoc, "Phuongthucky");
};
const GuiYCKyLo = async () => {
  try {
    if (state.selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn tài liệu cần ký");
      return;
    }

    isLoading.value = true;
    await Laythietlapphuongthuckysomacdinh();

    const arrayOfIdsToFilter = Object.values(state.selectedRowKeys);
    const filteredObjects = filter(data.value, (obj) =>
      includes(arrayOfIdsToFilter, obj.key)
    );

    const listVanban = map(filteredObjects, (obj) => ({
      idFile: String(obj.idFile),
      Trangthaiky: String(obj.Trangthaiky),
      Checkky: String(obj.Checkky),
      Trinhtuky: String(obj.Trinhtuky),
      Vitriluu: btoa(unescape(encodeURIComponent(obj.Vitriluu))),
      Info: String(obj.Info ?? ""),
      Taikhoanky: String(obj.Taikhoanky),
    }));

    if (listVanban.length === 0) {
      message.warning("Không tìm thấy tài liệu đã chọn");
      return;
    }

    const apiUrl = `${import.meta.env.VITE_APP_BASE_URL_API}/api/data/GuiYCKyLo`;
    const bodyData = {
      jsonlistVanban: JSON.stringify({ listDSKy: listVanban }),
      taikhoanky: Email,
      serialno: thongtinchukyso.Serialno || "",
    };

    const responseJson = await axios.post(apiUrl, bodyData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    let result;
    if (responseJson?.data) {
      result =
        typeof responseJson.data === "string"
          ? JSON.parse(responseJson.data)
          : responseJson.data;
    }

    if (result && Number(result.Macode) === 1) {
      message.success(result.Mota);
      state.selectedRowKeys = [];
      selectedRecords.value = [];
      await reloadData();
    } else {
      message.error(result?.Mota || "Ký lỗi");
    }
  } catch (error) {
    console.log("Loi ky lo", error);
    message.error("Lỗi hệ thống");
  } finally {
    isLoading.value = false;
  }
};
</script>
<style lang="css" scoped>
.custom-select .ant-select-selector {
  height: 36px !important;
}
</style>
