<template>
  <div class="h-[36px]">
    <a-auto-complete
      v-model:value="value"
      :options="options"
      :class="props.style"
      placeholder=""
      @select="onSelect"
      @search="onSearch"
    >
      <div class="relative w-full">
        <input
          class="rounded-lg border h-[36px] font-normal w-full text-[14px] py-3 pl-[36px] focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          :placeholder="props.placeholder"
          :value="props.modelValue"
          @input="updateModelValue"
        />
        <div
          class="absolute inset-y-0 left-0 flex items-center py-[10px] pl-[8px] pr-[16px]"
        >
          <SearchIcon @click="changeType" class="cursor-pointer"></SearchIcon>
        </div>
      </div>
    </a-auto-complete>
  </div>
</template>
<script setup lang="ts">
import SearchIcon from "@/assets/img/search.svg?component";
import { filter, includes, map} from "lodash-es";
// const { modelValue, dataSearch } = defineProps([
//   "modelValue",
//   "dataSearch"
// ]);
const props = defineProps(['modelValue', 'dataSearch', 'placeholder', 'style']);

const emit = defineEmits();
const value = ref("");
const options = ref<any[]>([]);
const show = ref(false);
const searchDataArr = ref<any>([]);
const changeType = () => {
  console.log(1);
  show.value = !show.value;
};

const updateModelValue = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
};

const searchTextResults = (str: string) => {
  let result = filter(props.dataSearch, (item: string) => includes(item, str));
  result = map(result, (value: any) => {
    return { value };
  });
  return result;
};

const onSearch = (searchText: string) => {
  console.log("searchText");
  options.value = !searchText
    ? []
    : searchTextResults(searchText);
};
const onSelect = (value: string) => {
  emit("update:modelValue", value);
  console.log("onSelect", value);
};
watch(value, () => {
  console.log("value", value.value);
});
</script>
