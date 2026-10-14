<template>
  <div class="h-[60px]">
    <div
      class="font-nunito text-[13px] leading-[20px] mb-1 font-semibold text-[#1E1E1E]"
    >
      {{ label
      }}<span class="text-red-500 font-normal" v-if="isRequired"> *</span>
    </div>
    <div class="relative">
      <input
        class="rounded-lg border h-[36px] font-normal text-[14px] px-3"
        :placeholder="placeholder"
        :type="type"
        :value="modelValue"
        @input="updateModelValue"
        :class="style"
        :readonly="readonly"
      />
      <div
        class="absolute inset-y-0 right-0 flex items-center mr-2"
        v-if="hasIcon"
      >
        <img
          :src="iconUrl"
          alt="logo"
          class="w-[16px] mr-1"
        />
      </div>
    </div>
    <div v-if="hasError">
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  label,
  type,
  placeholder,
  isRequired,
  modelValue,
  style,
  readonly,
  hasIcon,
  iconUrl,
} = defineProps([
  "label",
  "type",
  "placeholder",
  "isRequired",
  "modelValue",
  "style",
  "readonly",
  "hasIcon",
  "iconUrl",
]);
const emit = defineEmits();
const hasError = ref(false);
const updateModelValue = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
};
</script>
