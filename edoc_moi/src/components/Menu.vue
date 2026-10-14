<template>
  <a-menu
    id="menu"
    v-model:openKeys="openKeys"
    v-model:selectedKeys="selectedKeys"
    mode="inline"
    class="w-full bg-[#0A0A0B] gap-[16px]"
    :items="items.menu"
    @click="handleClick"
    theme="dark"
  ></a-menu>
</template>
<script lang="ts" setup>
/// <reference types="vite-svg-loader" />
import DocumentIcon from "@/assets/img/document-text.svg?component";
import FolderIcon from "@/assets/img/folder.svg?component";
import ElementPlusIcon from "@/assets/img/element-plus.svg?component";
import UserSquareIcon from "@/assets/img/user-square.svg?component";
import SettingIcon from "@/assets/img/setting.svg?component";

import type { MenuProps, ItemType } from "ant-design-vue";
import { VueElement } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LogoutOutlined } from "@ant-design/icons-vue";
import { useUserStoreHook } from "@/store/modules/user";
const router = useRouter();
const selectedKeys = ref<string[]>(["dashboard"]);
const openKeys = ref<string[]>(["sub1"]);
const currRoute = useRoute();
const useUserStore = useUserStoreHook();
const accountType = ref("0");

const state = reactive({
  collapsed: false,
});
function getItem(
  label: VueElement | string,
  key: string,
  icon?: any,
  children?: ItemType[],
  type?: "group",
  className?: string
): ItemType {
  return {
    key,
    icon,
    children,
    label,
    type,
    className,
  } as ItemType;
}

onMounted(() => {
  const localStorageItem = localStorage.getItem("PHANLOAITK") || "";

  accountType.value =
    JSON.parse(localStorageItem)?.value || useUserStore.userInfo?.PhanloaiTK;

  items.menu = items.menu.map((item: any) => {
    if (accountType.value === "0") {
      if (item.key === "danh-ba" || item.key === "danh-muc") {
        return {
          ...item,
          disabled: true,
        } as ItemType;
      }
    } else {
      return {
        ...item,
        disabled: false,
      } as ItemType;
    }

    return item;
  });

  selectedKeys.value = [getNamePath()];
});

const items: { menu: ItemType[] } = reactive({
  menu: [
    {
      key: "tai-lieu",
      icon: () => h(DocumentIcon),
      label: "Quản lý tài liệu",
      title: "Quản lý tài liệu",
    },
    {
      key: "danh-muc",
      icon: () => h(FolderIcon),
      label: "Quản lý danh mục",
      title: "Quản lý danh mục",
    },
    // {
    //   key: "#",
    //   icon: () => h(ElementPlusIcon),
    //   label: "Tạo mẫu tài liệu",
    //   title: "Tạo mẫu tài liệu",
    // },
    {
      key: "danh-ba",
      icon: () => h(UserSquareIcon),
      label: "Danh bạ",
      title: "Danh bạ",
    },
    {
      key: "cai-dat",
      icon: () => h(SettingIcon),
      label: "Cài đặt",
      title: "Cài đặt",
    },
    {
      key: "dang-xuat",
      icon: () => h(LogoutOutlined),
      label: "Đăng xuất",
      title: "Đăng xuất",
    },
  ],
});

const emits = defineEmits(["showMenu"]);
const handleClick: MenuProps["onClick"] = async (e) => {
  await router.push("/quan-ly/" + e.key.toString());
  emits("showMenu");
};

function getNamePath() {
  const paths = currRoute.path.split("/");
  return paths[paths.length - 1];
}
</script>
