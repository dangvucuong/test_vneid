import { defineStore } from "pinia";
import { store } from "@/store";
export const useFileStore = defineStore("file", () => {
  // state
  const tenFile = ref();
  const sizeFile = ref();
  const fileInfo = ref();
  const idFile = ref();
  const Vitriluu = ref();
  const sourcefile = ref();
  const LinkFile = ref();
  const phanloaivb = ref();
  const folderthang = ref();
  const Taikhoantao = ref();
  const ListTaiKhoanKy = ref();
  const ListVungKy = ref<any[]>([]);
  const setVitriLuu = (result: any) => {
    sourcefile.value = result.sourcefile;
    LinkFile.value = result.Linkfile;
    const raw = String(result.sourcefile || "").replace(/\//g, "\\");
    const startIndex = raw.toUpperCase().indexOf("\\FILELUU");
    Vitriluu.value =
      startIndex >= 0 ? raw.slice(startIndex) : raw.startsWith("\\") ? raw : `\\${raw}`;
  };
  const setThongTinFile = (file: any) => {
    tenFile.value = file.name;
    sizeFile.value = file.size;
    fileInfo.value = file;
  };
  const setTaiKhoanKy = (users) => {
    ListTaiKhoanKy.value = users;
  };
  const setListVungKy = (list: any[]) => {
    ListVungKy.value = list;
  };
  return {
    setVitriLuu,
    setThongTinFile,
    setTaiKhoanKy,
    setListVungKy,
    idFile,
    Vitriluu,
    sourcefile,
    phanloaivb,
    folderthang,
    Taikhoantao,
    sizeFile,
    tenFile,
    ListTaiKhoanKy,
    ListVungKy,
    fileInfo,
    LinkFile,
  };
});

// Use outside the component setup function
export function useFileStoreHook() {
  return useFileStore(store);
}
