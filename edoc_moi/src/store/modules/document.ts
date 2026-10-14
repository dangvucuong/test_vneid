import { defineStore } from "pinia";
import { store } from "@/store";
export const useDocumentInforStore = defineStore("document", () => {
  const documentInfor = ref({
    PhanloaiVB: 0,
    BLthang: "",
  });
  const setDocumentInfor = ({
    PhanloaiVB = 0,
    BLthang = "",
  }: {
    PhanloaiVB: number;
    BLthang: string;
  }) => {
    documentInfor.value = {
      PhanloaiVB: PhanloaiVB,
      BLthang: BLthang,
    };
  };
  return {
    documentInfor,
    setDocumentInfor,
  };
});

// Use outside the component setup function
export function useDocumentStoreHook() {
  return useDocumentInforStore(store);
}
