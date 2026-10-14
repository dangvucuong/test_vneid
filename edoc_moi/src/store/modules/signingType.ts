import { defineStore } from "pinia";
import { store } from "@/store";
export const useSigningTypeStore = defineStore("singingType", () => {
  const signingType = ref({
    type: 2,
    value: "",
  });
  const setSigningType = (type: number, value: string) => {
    console.log(value);

    signingType.value = {
      type: type,
      value: value,
    };
  };
  return {
    signingType,
    setSigningType,
  };
});

// Use outside the component setup function
export function useSigningTypeStoreHook() {
  return useSigningTypeStore(store);
}
