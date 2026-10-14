<template>
  <div class="h-[60px]">
    <div
      class="font-nunito text-[13px] leading-[20px] mb-1 font-semibold text-[#1E1E1E]"
    >
      {{ label
      }}<span class="text-red-500 font-normal" v-if="isRequired"> *</span>
    </div>
    <div class="relative" :class="style">
      <input
        class="rounded-lg border h-[36px] font-normal text-[14px] px-3 w-full"
        :placeholder="placeholder"
        :value="modelValue"
        @input="updateModelValue"
      />
      <div
        class="absolute bottom-0 right-0 flex items-center justify-center mr-2"
      >
        <Assignment
          @click="openDialog"
          class="w-6 h-6 cursor-pointer"
        ></Assignment>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Assignment from "@/assets/img/assignment.svg?component";
const { label, placeholder, isRequired, modelValue } = defineProps([
  "label",
  "type",
  "placeholder",
  "isRequired",
  "modelValue",
  "style",
  "listData",
]);
const emit = defineEmits(["openDialog", "update:modelValue"]);

const openDialog = () => {
  emit("openDialog");
};
const updateModelValue = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
};
</script>
