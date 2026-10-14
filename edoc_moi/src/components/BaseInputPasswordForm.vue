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
        :type="show ? 'text' : 'password'"
      />
      <div class="absolute inset-y-0 right-0 flex items-center mr-2">
        <EyeIcon @click="changeType" class="w-6 h-6 cursor-pointer" :class="{ hidden: !show, block: show }"></EyeIcon>
        <EyeSlashIcon @click="changeType" class="w-6 h-6 cursor-pointer" :class="{ block: !show, hidden: show }"></EyeSlashIcon>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import EyeSlashIcon from '@/assets/img/eye-slash.svg?component';
import EyeIcon from '@/assets/img/eye.svg?component';
const { label, placeholder, isRequired, modelValue } = defineProps([
  "label",
  "type",
  "placeholder",
  "isRequired",
  "modelValue",
  "style"
]);
const emit = defineEmits();
const show = ref(false);
const changeType = () => {
  console.log(1);
  show.value = !show.value;
};
const updateModelValue = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
};
</script>
