<template>
  <a-spin :spinning="isLoading">
    <div class="p-4">
      <div class="flex items-center justify-between text-[#343436] pb-4">
        <div>
          <div class="font-nunito text-[20px] leading-6 font-medium">
            Thiết lập template ký số
          </div>
          <div
            class="font-nunito text-[14px] leading-5 font-medium text-[#9B9B9E] mt-2"
          >
            Quản lý các template thiết lập người ký và vị trí chữ ký đã lưu.
            Template được tạo khi gửi tài liệu và chọn lưu thiết lập ký.
          </div>
        </div>
      </div>

      <a-table
        :columns="columns"
        :data-source="templates"
        :pagination="false"
        :row-key="rowKey"
        bordered
        :locale="{ emptyText: 'Chưa có template thiết lập ký số' }"
      >
        <template #expandedRowRender="{ record }">
          <div class="py-2">
            <div class="text-[13px] text-[#7C7C7E] mb-2">
              Trình tự ký của template
              <b>{{ displayName(record) }}</b>
            </div>
            <a-table
              v-if="record.items?.length"
              :columns="detailColumns"
              :data-source="record.items"
              :pagination="false"
              size="small"
              :row-key="(item) => String(item.STT)"
              bordered
            />
            <div v-else class="text-[13px] text-[#9B9B9E]">
              Template chưa có dữ liệu trình tự ký.
            </div>
          </div>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'tenTLap'">
            {{ displayName(record) }}
          </template>
          <template v-else-if="column.key === 'soNguoiKy'">
            {{ record.items?.length || 0 }}
          </template>
          <template v-else-if="column.key === 'ngaytao'">
            {{ formatDate(record.ngaytao) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex gap-2">
              <a-button size="small" @click="openRename(record)">
                Sửa tên
              </a-button>
              <a-button
                type="primary"
                danger
                size="small"
                @click="confirmDelete(record)"
              >
                Xóa
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>
  </a-spin>

  <a-modal
    v-model:open="renameVisible"
    title="Sửa tên template"
    centered
    :maskClosable="false"
    ok-text="Lưu"
    cancel-text="Hủy"
    :confirm-loading="saving"
    @ok="saveRename"
    @cancel="closeRename"
  >
    <div class="font-semibold mb-1">Tên template</div>
    <a-input
      v-model:value="renameValue"
      placeholder="Nhập tên template"
      :maxlength="250"
      allow-clear
      @pressEnter="saveRename"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { createVNode } from "vue";
import { message, Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { Storage } from "@/utils/Storage";
import {
  dstemplate_thietlap,
  Capnhatthietlap_template,
  Xoathietlap_template,
  type TemplateThietLap,
} from "@/services/templateThietLap";

const Email = Storage.get("email");
const isLoading = ref(false);
const saving = ref(false);
const templates = ref<TemplateThietLap[]>([]);
const renameVisible = ref(false);
const renameValue = ref("");
const editingTemplate = ref<TemplateThietLap | null>(null);

const columns = [
  { title: "STT", dataIndex: "stt", key: "stt", width: 80 },
  { title: "Tên template", dataIndex: "tenTLap", key: "tenTLap" },
  {
    title: "Số người ký",
    key: "soNguoiKy",
    width: 130,
    align: "center" as const,
  },
  { title: "Ngày tạo", key: "ngaytao", width: 170 },
  { title: "Hành động", key: "action", width: 180 },
];

const detailColumns = [
  { title: "Trình tự ký", dataIndex: "STT", key: "STT", width: 120 },
  { title: "Tài khoản ký", dataIndex: "TKKy", key: "TKKy" },
  { title: "Trang ký", dataIndex: "Trangky", key: "Trangky", width: 100 },
  { title: "Vị trí chữ ký", dataIndex: "VTCKy", key: "VTCKy" },
];

const displayName = (record: TemplateThietLap) =>
  record.tenTLap || `Template #${record.stt}`;

const rowKey = (record: TemplateThietLap) =>
  String(record.idTemplate || record.stt);

const formatDate = (value?: string) => {
  if (!value) return "—";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : "—";
};

const getTemplateId = (record: TemplateThietLap) =>
  Number(record.idTemplate || 0);

const loadTemplates = async () => {
  try {
    isLoading.value = true;
    templates.value = await dstemplate_thietlap(Email);
  } catch (err) {
    console.error("dstemplate_thietlap error", err);
    templates.value = [];
    message.error("Không tải được danh sách template thiết lập ký");
  } finally {
    isLoading.value = false;
  }
};

const openRename = (record: TemplateThietLap) => {
  if (!getTemplateId(record)) {
    message.error("Không tìm thấy mã template để cập nhật");
    return;
  }
  editingTemplate.value = record;
  renameValue.value = record.tenTLap || "";
  renameVisible.value = true;
};

const closeRename = () => {
  renameVisible.value = false;
  renameValue.value = "";
  editingTemplate.value = null;
};

const saveRename = async () => {
  const record = editingTemplate.value;
  const ten = renameValue.value.trim();
  if (!record) return Promise.reject();
  if (!ten) {
    message.warning("Hãy nhập tên template");
    return Promise.reject();
  }
  const idTemplate = getTemplateId(record);
  if (!idTemplate) {
    message.error("Không tìm thấy mã template để cập nhật");
    return Promise.reject();
  }

  try {
    saving.value = true;
    const result = await Capnhatthietlap_template(
      Email,
      record.template || "",
      idTemplate,
      ten
    );
    if (result >= 1) {
      message.success("Đã cập nhật tên template");
      closeRename();
      await loadTemplates();
      return;
    }
    if (result === -3) {
      message.error("Thiếu thông tin tài khoản, không cập nhật được template");
    } else if (result === -4) {
      message.error("Không tìm thấy template để cập nhật");
    } else {
      message.error("Cập nhật tên template thất bại");
    }
    return Promise.reject();
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (record: TemplateThietLap) => {
  const idTemplate = getTemplateId(record);
  if (!idTemplate) {
    message.error("Không tìm thấy mã template để xóa");
    return;
  }

  Modal.confirm({
    title: "Bạn chắc chắn muốn xóa template này?",
    icon: createVNode(ExclamationCircleOutlined),
    content: `Template "${displayName(record)}" sẽ bị xóa và không dùng được khi ký lô.`,
    okText: "Xóa",
    okType: "danger",
    cancelText: "Hủy bỏ",
    async onOk() {
      const result = await Xoathietlap_template(Email, idTemplate);
      if (result === 1 || result >= 1) {
        message.success("Đã xóa template");
        await loadTemplates();
      } else if (result === -3) {
        message.error("Thiếu thông tin tài khoản, không xóa được template");
        return Promise.reject();
      } else if (result === -4) {
        message.error("Không tìm thấy template để xóa");
        return Promise.reject();
      } else {
        message.error("Xóa template thất bại");
        return Promise.reject();
      }
    },
  });
};

onMounted(() => {
  loadTemplates();
});
</script>
