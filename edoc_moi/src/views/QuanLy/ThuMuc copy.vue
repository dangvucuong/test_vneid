<template>
  <div class="py-[16px] gap-1 px-3 bg-white">
    <div class="page-header flex items-center justify-between text-[#343436]">
      <h3 class="font-nunito text-[24px] leading-8 flex font-bold">
        Quản lý thư mục
      </h3>
      <div class="flex items-center space-x-4">
        <a-button
          class="w-[156px] h-[36px] border rounded-md bg-[#0055E6] text-white"
          @click="addNewFolder"
        >
          <div class="flex items-center justify-center space-x-2">
            <span>
              <AddIcon />
            </span>
            <span>Tạo thư mục mới</span>
          </div>
        </a-button>
      </div>
    </div>
    <div class="search py-[12px] text-[#343436] flex justify-start gap-1">
      <BaseInputSearch
        v-model="formState.name"
        :dataSearch="listTextSearch"
        :placeholder="'Tìm kiếm tài liệu'"
        :style="'w-[360px]'"
      >
      </BaseInputSearch>
    </div>
    <div>
      <a-table
        :row-selection="{
          selectedRowKeys: state.selectedRowKeys,
          onChange: onSelectChange,
        }"
        :columns="columns"
        :data-source="data"
        :scroll="{ x: 1168, y: 500 }"
        :pagination="pagination"
        class="h-fit"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <div class="flex gap-6">
              <ModeIcon @click="editFolder(record.key)"></ModeIcon>
              <TrashIcon @click="deleteFolder(record.key)"></TrashIcon>
            </div>
            <!-- <div class="relative">
              <Popover v-slot="{ open }" class="relative">
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
                    class="absolute left-1/2 z-10 mt-3 w-screen max-w-sm -translate-x-1/2 transform px-4 sm:px-0"
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
                          @click="item.click(record.id)"
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
            </div> -->
          </template>
        </template>
      </a-table>
      <a-affix :offset-bottom="bottom" v-if="numberSelected > 0">
        <div
          class="flex w-[296px] h-[60px] items-center border rounded-lg justify-center"
        >
          <CheckCircleOutlineIcon />
          Đã chọn: {{ numberSelected }} tài liệu&nbsp;
          <a-button
            class="w-[99px] h-[28px] border rounded-md bg-[#EF4438] text-white justify-center p-0"
            >Xóa tài liệu
          </a-button>
        </div>
      </a-affix>
    </div>
  </div>
  <div>
    <a-modal
      v-model:open="modalAddNewFolder"
      :title="modalFolderTitle"
      centered
      @ok="modalAddNewFolder = false"
      class="!w-[556px] h-[484px] !font-nunito !text-[14px] !leading-5 font-semibold"
    >
      <template #footer>
        <a-button
          key="back"
          @click="handleCancelAddNewFolder"
          class="w-[140px] h-[36px] text-[#1E1E1E]"
          >Hủy</a-button
        >
        <a-button
          key="submit"
          type="primary"
          @click="handleOkAddNewFolder"
          class="w-[140px] h-[36px] bg-[#0055E6] text-white"
          >Xác nhận</a-button
        >
      </template>
      <a-divider />
      <div class="grid grid-col-1 gap-[16px] h-[500px] content-start w-full">
        <BaseInputForm
          v-model="formState.name"
          :placeholder="'Nhập tên thư mục'"
          :style="'w-full'"
          :is-required="true"
          :label="'Tên thư mục'"
        >
        </BaseInputForm>
        <BaseInputArea
          v-model="formState.note"
          :placeholder="'Nhập ghi chú của thư mục'"
          :style="'w-full h-[145px]'"
          :label="'Ghi chú'"
          :rows="4"
        >
        </BaseInputArea>
      </div>
    </a-modal>
    <a-modal
      v-model:open="modalDeleteFolderById"
      title=""
      centered
      @ok="modalDeleteFolderById = false"
      class="!w-[540px] h-[256px] !font-nunito !text-[14px] !leading-5 font-semibold"
      :closable="false"
    >
      <template #footer>
        <div class="flex items-center justify-center">
          <a-button
            key="back"
            @click="handleCancelDeleteFolder"
            class="w-[140px] h-[36px] text-[#1E1E1E]"
            >Hủy</a-button
          >
          <a-button
            key="submit"
            type="primary"
            @click="handleOkDeleteFolder"
            class="w-[140px] h-[36px] bg-[#0055E6] text-white"
            >Xác nhận</a-button
          >
        </div>
      </template>
      <div class="grid grid-col-1 gap-[16px] content-start w-full">
        <h3 class="font-nunito text-[24px] leading-8 font-bold text-center">
          Xóa thư mục tài liệu
        </h3>
        <div
          class="font-nunito text-[13px] leading-[20px] font-semibold text-center px-10"
        >
          Danh mục “<span class="text-blue-600">Bảng lương 01</span>” sẽ bị xoá và không thể hoàn tác. Bạn chắc
          chắn muốn xóa danh mục này?
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import AddIcon from "@/assets/img/add.svg?component";
import FilterIcon from "@/assets/img/filter.svg?component";
import MoreVertIcon from "@/assets/img/more_vert.svg?component";
import TrashIcon from "@/assets/img/trash.svg?component";
import ModeIcon from "@/assets/img/mode.svg?component";
import CheckCircleOutlineIcon from "@/assets/img/check_circle_outline.svg?component";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { UnwrapRef } from "vue";
const modalAddNewFolder = ref(false);
const bottom = ref<number>(20);
const download = (id: any) => {
  console.log(`download${id}`);
};
const radioStyle = reactive({
  display: "flex",
  height: "30px",
  lineHeight: "30px",
});
const selectedFolderId = ref("");
const modalFolderTitle = ref("Thư mục mới")
const addNewFolder = (id: any) => {
  modalAddNewFolder.value = true;
  console.log(`addNewFolder${id}`);
};
const addDocumentToFolder = (id: any) => {
  console.log(`addDocumentToFolder${id}`);
};
const editFolder = (id: any) => {
  modalAddNewFolder.value = true;
  modalFolderTitle.value = "Sửa thư mục"
  console.log(`edit${id}`);
};
const modalDeleteFolderById = ref(false);
const deleteFolder = (id: any) => {
  modalDeleteFolderById.value = true;
  console.log(`deleteFolder${id}`);
};
// const actions = [
//   {
//     name: "Tải xuống",
//     click: download,
//     icon: `
//       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <path d="M19 9H15V3H9V9H5L12 16L19 9ZM11 11V5H13V11H14.17L12 13.17L9.83 11H11ZM5 18H19V20H5V18Z" fill="black" fill-opacity="0.87"/>
//       </svg>
  
//       `,
//   },
//   {
//     name: "Gán danh mục",
//     click: addDocumentToFolder,
//     icon: `
//       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//   <path d="M20 6H12L10 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V8C22 6.89 21.11 6 20 6ZM20 18H4V6H9.17L11.17 8H20V18ZM12 14H14V16H16V14H18V12H16V10H14V12H12V14Z" fill="black" fill-opacity="0.87"/>
//   </svg>
  
//       `,
//   },
//   {
//     name: "Chia sẻ",
//     click: shareDocument,
//     icon: `
//       <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <path d="M15 14.08C14.24 14.08 13.56 14.38 13.04 14.85L5.91 10.7C5.96 10.47 6 10.24 6 10C6 9.76 5.96 9.53 5.91 9.3L12.96 5.19C13.5 5.69 14.21 6 15 6C16.66 6 18 4.66 18 3C18 1.34 16.66 0 15 0C13.34 0 12 1.34 12 3C12 3.24 12.04 3.47 12.09 3.7L5.04 7.81C4.5 7.31 3.79 7 3 7C1.34 7 0 8.34 0 10C0 11.66 1.34 13 3 13C3.79 13 4.5 12.69 5.04 12.19L12.16 16.35C12.11 16.56 12.08 16.78 12.08 17C12.08 18.61 13.39 19.92 15 19.92C16.61 19.92 17.92 18.61 17.92 17C17.92 15.39 16.61 14.08 15 14.08ZM15 2C15.55 2 16 2.45 16 3C16 3.55 15.55 4 15 4C14.45 4 14 3.55 14 3C14 2.45 14.45 2 15 2ZM3 11C2.45 11 2 10.55 2 10C2 9.45 2.45 9 3 9C3.55 9 4 9.45 4 10C4 10.55 3.55 11 3 11ZM15 18.02C14.45 18.02 14 17.57 14 17.02C14 16.47 14.45 16.02 15 16.02C15.55 16.02 16 16.47 16 17.02C16 17.57 15.55 18.02 15 18.02Z" fill="black" fill-opacity="0.87"/>
//       </svg>
  
//       `,
//   },
//   {
//     name: "Xóa tài liệu",
//     click: deleteFolder,
//     icon: `
//       <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <path fill-rule="evenodd" clip-rule="evenodd" d="M9.5 0L10.5 1H14V3H0V1H3.5L4.5 0H9.5ZM3 18C1.9 18 1 17.1 1 16V4H13V16C13 17.1 12.1 18 11 18H3ZM11 6H3V16H11V6Z" fill="#1E1E1E"/>
//       </svg>
//           `,
//   },
// ];

interface FormState {
  name: string | undefined;
  note: string | undefined;
}
const formState: UnwrapRef<FormState> = reactive({
  name: undefined,
  note: undefined,
});
const activeKey = ref("1");

const listFolder = ref<any[]>();
const listTextSearch = ref<any[]>();
onMounted(() => {
  listTextSearch.value = [
    "Hợp đồng thuê nhà số 001",
    "Hợp đồng lao động",
    "Hợp đồng mua bán",
    "Hợp đồng thuê nhà số 003",
  ];
  listFolder.value = [
    {
      value: 0,
      label: "Thư mục 1",
    },
    {
      value: 1,
      label: "Thư mục 2",
    },
    {
      value: 2,
      label: "Thư mục 3",
    },
  ];
});

type Key = string | number;

const columns = [
  // {
  //   title: "ID",
  //   dataIndex: "id",
  //   width: 80,
  //   key: "key",
  // },
  {
    title: "Tên thư mục",
    dataIndex: "name",
    width: 260,
    key: "name",
  },
  {
    title: "File size",
    dataIndex: "file_size",
    width: 168,
    key: "sender",
  },
  {
    title: "Thời gian cập nhật",
    dataIndex: "updated_at",
    width: 158,
    key: "updated_at",
  },
  {
    title: "Ghi chú",
    dataIndex: "note",
    key: "note",
    width: 428,
  },
  {
    title: "",
    dataIndex: "action",
    key: "action",
  },
];
interface DataType {
  key: Key;
  name: string;
  file_size: string;
  updated_at: string;
  note: string;
}
const data: DataType[] = [];
for (let i = 110003; i < 110003 + 120; i++) {
  data.push({
    key: i,
    name: `Marketing folder`,
    file_size: "122 MB",
    updated_at: "14/05/2023 17:02:02",
    note: `While it's nowhere near as cool as what Nicolas Cage does in Next, this app lets yo...`,
  });
}
const pagination = reactive<any>({
  pageSize: 10,
  showQuickJumper: true,
  showLessItems: true,
  showSizeChanger: true,
});
const state = reactive<{
  selectedRowKeys: Key[];
  loading: boolean;
}>({
  selectedRowKeys: [], // Check here to configure the default column
  loading: false,
});
const numberSelected = computed(() =>
  state.selectedRowKeys.length > 0 ? state.selectedRowKeys.length : 0
);

const start = () => {
  state.loading = true;
  // ajax request after empty completing
  setTimeout(() => {
    state.loading = false;
    state.selectedRowKeys = [];
  }, 1000);
};
const onSelectChange = (selectedRowKeys: Key[]) => {
  console.log("selectedRowKeys changed: ", selectedRowKeys);
  state.selectedRowKeys = selectedRowKeys;
};
const handleOkAddNewFolder = () => {
  setTimeout(() => {
    modalAddNewFolder.value = false;
  }, 1000);
};

const handleCancelAddNewFolder = () => {
  modalAddNewFolder.value = false;
};
const handleOkDeleteFolder = () => {
  setTimeout(() => {
    modalDeleteFolderById.value = false;
  }, 1000);
};

const handleCancelDeleteFolder = () => {
  modalDeleteFolderById.value = false;
};
</script>
<style scoped>
.custom-select .ant-select-selector {
  height: 36px !important;
}
</style>
