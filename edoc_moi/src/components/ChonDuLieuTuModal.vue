<template>
  <a-modal
    v-model:open="props.isOpen"
    :closable="false"
    :title="props.title"
    centered
    class="!w-[556px] h-[617px] !font-nunito !text-[14px] !leading-5 font-semibold"
  >
    <template #footer>
      <a-button
        key="back"
        @click="HuyModal"
        class="w-[140px] h-[36px] text-[#1E1E1E]"
        >Hủy</a-button
      >
      <a-button
        key="submit"
        type="primary"
        @click="XacNhanModal"
        class="w-[140px] h-[36px] bg-[#0055E6] text-white"
        >Xác nhận</a-button
      >
    </template>
      <a-form :layout="'vertical'" :model="formState">
        <a-form-item :label="props.label">
          <a-select
            ref="select"
            v-model:value="formState.selectId"
            :options="props.dataList"
            class="custom-select w-[224px]"
          >
          </a-select>
        </a-form-item>
      </a-form>
  </a-modal>
</template>
<script lang="ts" setup>
import { cloneDeep } from 'lodash-es';

const props = defineProps({
  isOpen: Boolean,
  title: String,
  label: String,
  dataList: Array<any>,
});
const emit = defineEmits(["xacNhanDM", 'huyXacNhanDM']);
const formState = reactive<any>({
  selectId: ''
});
const HuyModal = () => {
  formState.selectId = '';
  emit("huyXacNhanDM");
};
const XacNhanModal = () => {
  const idDM = cloneDeep(formState.selectId);
  formState.selectId = '';
  emit("xacNhanDM", idDM)
};
</script>
