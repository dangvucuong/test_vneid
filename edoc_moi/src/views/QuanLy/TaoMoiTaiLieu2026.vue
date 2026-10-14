<template>
  <div>
    <div class="flex h-[64px] items-center justify-center bg-white">
      <a-steps
        :current="stepCurrent"
        :items="items"
        class="w-[960px]"
      ></a-steps>
    </div>
    <div class="steps-content pt-1 w-full h-[calc(100%_-_140px)]">
      <!-- Tải lên tài liệu  -->
      <template v-if="stepCurrent === 0">
        <Step1P1 @uploadFile="uploadFile" v-if="step1PhaseNumber === 1" />
        <Step1P2
          @changeStep="changeStep"
          :file="file"
          v-if="step1PhaseNumber === 2"
        />
      </template>
      <!-- Thiết lập người nhận  -->
      <template v-if="stepCurrent === 1">
        <Step2 @changeStep="changeStep" :file="file" />
      </template>
      <!-- Thiết lập vùng ký -->
      <template v-if="stepCurrent === 2">
        <Step3 @changeStep="changeStep" :prefer-local-file="true" />
      </template>
      <!--Hoàn tất và xác nhận -->
      <template v-if="stepCurrent === 3">
        <Step4
          @changeStep="changeStep"
          :file="file"
          :enable-save-template="true"
        />
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import Step1P1 from "@/components/create-document/upload/Step1P1.vue";
import Step1P2 from "@/components/create-document/upload/Step1P2.vue";
import Step2 from "@/components/create-document/upload/Step2.vue";
import Step3 from "@/components/create-document/upload/Step3.vue";
import Step4 from "@/components/create-document/upload/Step4.vue";

const stepCurrent = ref<number>(0);
const file = ref<any>();
const step1PhaseNumber = ref(1);
const items = [
  {
    title: "Tải lên tài liệu",
  },
  {
    title: "Thiết lập người nhận",
  },
  {
    title: "Thiết lập vùng ký",
  },
  {
    title: "Hoàn tất và xác nhận",
  },
];

const changeStep = (numberStep: number, numberPhaseStep?: number) => {
  stepCurrent.value = numberStep;
  if (numberPhaseStep) {
    step1PhaseNumber.value = numberPhaseStep;
  }
};
const uploadFile = (files: any) => {
  file.value = files;
  changeStep(0, 2);
};
</script>
<style scoped>
.steps-action {
  margin-top: 24px;
}
</style>
