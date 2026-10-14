<template>
    <div class="">
      <div class="font-nunito text-[13px] leading-[20px] mb-1 font-semibold text-[#1E1E1E]">
        {{ label }}<span class="text-red-500 font-normal" v-if="isRequired"> *</span>
      </div>
      <div>
        <textarea
          class="rounded-lg border font-normal text-[14px] px-3 w-[386px]"
          :placeholder="placeholder"
          :type="type"
          :value="modelValue"
          :rows="rows"
          @input="updateModelValue"
          :class="style"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  
  const { label, type, placeholder, isRequired, modelValue } = defineProps(['label', 'type', 'placeholder', 'isRequired', 'modelValue', 'rows', 'style']);
  const emit = defineEmits();
  
  const updateModelValue = (event: Event) => {
    emit('update:modelValue', (event.target as HTMLInputElement).value);
  };
  </script>