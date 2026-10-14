<template>
    <div>
        <a-pagination
            class="p-6"
            v-model:current="current"
            :pageSize="paginationConfig.pageSize"
            show-quick-jumper
            show-size-changer
            :total="paginationConfig.total"
            @change="onChange"
        />
        <br />
    </div>
</template>
<script lang="ts" setup>
const props = defineProps({
    paginationConfig: {
        type: Object,
        required: true,
    },
});
const current = computed(() => props.paginationConfig.current_page);
const emits = defineEmits(["updateDataTable"]);
const onChange = (pageNumber: number, pageSize: number) => {
    emits("updateDataTable", { limit: pageSize, page: pageNumber });
};
</script>
