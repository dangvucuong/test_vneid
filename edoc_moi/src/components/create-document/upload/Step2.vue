<template>
  <div class="w-[1040px] mx-auto gap-4 divide-y">
    <div class="p-2 bg-white mt-[24px]">
      <h3 class="font-nunito text-[24px] leading-8 flex font-bold">
        Thêm người ký
      </h3>
      <a-divider />
      <a-form
        ref="formRef"
        name="dynamic_form_nest_item"
        :model="dynamicValidateForm"
        @finish="onFinish"
      >
        <div
          class="flex gap-2 items-center justify-center p-2"
          v-for="(user, index) in dynamicValidateForm.users"
          :key="user.id"
        >
          <div
            class="w-[32px] h-[32px] bg-[#E6E6E8] border flex items-center justify-center"
          >
            {{ index + 1 }}
          </div>
          <div
            class="flex gap-4 bg-[#E5EEFC] h-[96px] p-4 items-center justify-center w-[912px]"
          >
            <BaseInputFormDialog
              :label="'Họ và tên'"
              :type="'text'"
              :placeholder="'Nhập họ và tên'"
              v-model="user.HotenTKDB"
              :style="'w-[282px]'"
              @openDialog="openDialog(index, 0)"
            ></BaseInputFormDialog>
            <BaseInputForm
              :label="'Email'"
              :type="'text'"
              :placeholder="'Nhập email'"
              v-model="user.TaikhoanDB"
              :isRequired="true"
              :style="'w-[282px]'"
            ></BaseInputForm>
            <div class="flex flex-col w-full">
              <label
                class="font-nunito text-[13px] leading-[20px] mb-1 font-semibold text-[#1E1E1E]"
                >Hình thức kí</label
              >
              <a-select
                ref="select"
                v-model:value="user.Hinhthucky"
                :options="listType"
                :placeholder="'Hình thức kí'"
                class="custom-select w-[282px]"
              >
              </a-select>
            </div>
          </div>
          <TrashIcon @click="removeUser(user)" class=""></TrashIcon>
        </div>
        <a-form-item class="py-[24px]">
          <a-button
            class="w-[139px] h-[28px] bg-white border rounded-md text-[13px] font-nunito flex"
            @click="addUser"
          >
            <div class="flex items-center justify-center space-x-2">
              <span>
                <PlusOutlined />
              </span>
              <span>Thêm người ký</span>
            </div>
          </a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="p-2 bg-white mt-[24px]">
      <h3 class="font-nunito text-[24px] leading-8 flex font-bold">
        Thêm người nhận bản sao
      </h3>
      <a-divider />
      <a-form
        ref="formRef"
        name="dynamic_form_nest_item"
        :model="dynamicValidateForm1"
        @finish="onFinish"
      >
        <div
          class="flex gap-2 items-center justify-center p-2"
          v-for="(user, index) in dynamicValidateForm1.users"
          :key="user.id"
        >
          <div
            class="w-[32px] h-[32px] bg-[#E6E6E8] border flex items-center justify-center"
          >
            {{ index + 1 }}
          </div>
          <div
            class="flex gap-4 bg-[#E5EEFC] h-[96px] p-4 items-center justify-center w-[912px]"
          >
            <BaseInputFormDialog
              :label="'Họ và tên'"
              :type="'text'"
              :placeholder="'Nhập họ và tên'"
              v-model="user.HotenTKDB"
              :style="'w-[282px]'"
              @openDialog="openDialog(index, 1)"
            ></BaseInputFormDialog>
            <BaseInputForm
              :label="'Email'"
              :type="'text'"
              :placeholder="'Nhập email'"
              v-model="user.TaikhoanDB"
              :isRequired="true"
              :style="'w-[282px]'"
            ></BaseInputForm>
            <div class="flex flex-col w-full">
              <label
                class="font-nunito text-[13px] leading-[20px] mb-1 font-semibold text-[#1E1E1E]"
                >Hình thức kí</label
              >
              <a-select
                ref="select"
                v-model:value="user.Hinhthucky"
                :options="listType1"
                :placeholder="'Hình thức kí'"
                class="custom-select w-[282px]"
              >
              </a-select>
            </div>
          </div>
          <TrashIcon @click="removeUser1(user)" class=""></TrashIcon>
        </div>
        <a-form-item class="py-[24px]">
          <a-button
            class="h-[28px] bg-white border rounded-md text-[13px] font-nunito flex"
            @click="addUser1"
          >
            <div class="flex items-center justify-center space-x-2">
              <span>
                <PlusOutlined />
              </span>
              <span>Thêm người nhận bản sao</span>
            </div>
          </a-button>
        </a-form-item>
      </a-form>
    </div>
    <div
      class="flex justify-end gap-4 p-2 fixed bottom-[16px] left-[256px] right-0 border-none bg-white"
    >
      <a-button
        class="w-[140px] h-[36px] border rounded-md bg-white text-[#1E1E1E]"
        @click="backStep"
        >Quay lại</a-button
      >
      <a-button
        class="w-[140px] h-[36px] border rounded-md bg-[#0055E6] text-white mr-[30px]"
        @click="nextStep"
        >Tiếp tục</a-button
      >
    </div>
  </div>
  <div>
    <a-modal
      v-model:open="moModalGanDanhBa"
      :title="'Chọn từ danh bạ:'"
      centered
      class="!w-[556px] h-[617px] !font-nunito !text-[14px] !leading-5 font-semibold"
    >
      <template #footer>
        <a-button
          key="back"
          @click="huyXacNhanDanhBa"
          class="w-[140px] h-[36px] text-[#1E1E1E]"
          >Hủy</a-button
        >
        <a-button
          key="submit"
          type="primary"
          @click="xacNhanDanhBa"
          class="w-[140px] h-[36px] bg-[#0055E6] text-white"
          >Xác nhận</a-button
        >
      </template>
      <a-form :layout="'vertical'" :model="formState1">
        <a-form-item :label="''">
          <a-select
            ref="select"
            show-search
            :filter-option="filterOption"
            v-model:value="formState1.TaikhoanDB"
            :options="DSDanhba"
            class="custom-select w-[224px]"
          >
            <template #option="{ value: val, label, HotenTKDB }">
              <div class="grid grid-cols-10">
                <div class="flex items-center">
                  <UserOutlined :style="{ fontSize: '28px' }" />
                </div>
                <div>
                  <div>{{ HotenTKDB }}</div>
                  <div>{{ label }}</div>
                </div>
              </div>
            </template>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from "vue";
import { PlusOutlined, UserOutlined } from "@ant-design/icons-vue";
import TrashIcon from "@/assets/img/trash.svg?component";
import { message, type FormInstance } from "ant-design-vue";
import BaseInputFormDialog from "@/components/BaseInputFormDialog.vue";
import { Storage } from "@/utils/Storage";
import axios from "axios";
import { convertXmlToJson } from "@/utils/common";
import { each, find, isArray, map, orderBy } from "lodash-es";
const Email = Storage.get("email");
import { useFileStoreHook } from "@/store/modules/file";
const fileStore = useFileStoreHook();
interface User {
  id: number;
  HotenTKDB: string;
  TaikhoanDB: string;
  Hinhthucky: number | undefined;
  idDanhba: number | undefined;
}
const formRef = ref<FormInstance>();
const dynamicValidateForm = reactive<{ users: User[] }>({
  users: [],
});
const filterOption = (input: string, option: any) => {
  return option.HotenTKDB.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
watch(
  () => dynamicValidateForm.users,
  (newUsers, oldUsers) => {
    dynamicValidateForm.users.sort((a, b) => {
      const kyA = a.Hinhthucky || 0;
      const kyB = b.Hinhthucky || 0;
      return kyA - kyB;
    });
  },
  { deep: true }
);
const dynamicValidateForm1 = reactive<{ users: User[] }>({
  users: [],
});
const removeUser = (item: User) => {
  const index = dynamicValidateForm.users.indexOf(item);
  if (index !== -1) {
    dynamicValidateForm.users.splice(index, 1);
  }
};
const addUser = () => {
  dynamicValidateForm.users.push({
    HotenTKDB: "",
    TaikhoanDB: "",
    id: Date.now(),
    Hinhthucky: 1,
    idDanhba: undefined,
  });
};
const removeUser1 = (item: User) => {
  const index = dynamicValidateForm1.users.indexOf(item);
  if (index !== -1) {
    dynamicValidateForm.users.splice(index, 1);
  }
};
const addUser1 = () => {
  dynamicValidateForm1.users.push({
    HotenTKDB: "",
    TaikhoanDB: "",
    id: Date.now(),
    Hinhthucky: 2,
    idDanhba: undefined,
  });
};
const onFinish = (values: any) => {
  console.log("Received values of form:", values);
  console.log("dynamicValidateForm.users:", dynamicValidateForm.users);
};
const listType = ref<any>([
  {
    value: 0,
    label: "Phê duyệt và ký điện tử",
  },
  {
    value: 1,
    label: "Ký số",
  },
]);
const listType1 = ref<any>([
  {
    value: 2,
    label: "Nhận bản sao",
  },
]);
const moModalGanDanhBa = ref(false);
const huyXacNhanDanhBa = () => {
  moModalGanDanhBa.value = false;
};
const xacNhanDanhBa = () => {
  const taiKhoangChon = find(DSDanhba.value, { value: formState1.TaikhoanDB });
  if (taiKhoangChon) {
    if (isThemNguoiKy.value) {
      dynamicValidateForm.users[targetIdNguoiKi.value] = {
        TaikhoanDB: taiKhoangChon.value,
        HotenTKDB: taiKhoangChon.HotenTKDB,
        idDanhba: taiKhoangChon.idDanhba,
        id: Date.now(),
        Hinhthucky: dynamicValidateForm.users[targetIdNguoiKi.value].Hinhthucky,
      };
    } else {
      dynamicValidateForm1.users[targetIdNguoiKi.value] = {
        TaikhoanDB: taiKhoangChon.value,
        HotenTKDB: taiKhoangChon.HotenTKDB,
        idDanhba: taiKhoangChon.idDanhba,
        id: Date.now(),
        Hinhthucky:
          dynamicValidateForm1.users[targetIdNguoiKi.value].Hinhthucky,
      };
    }
  }

  moModalGanDanhBa.value = false;
};
const targetIdNguoiKi = ref();
const isThemNguoiKy = ref(false);
const openDialog = (index: any, type: number) => {
  //Mở khi  Thêm người ký
  if (type === 0) {
    isThemNguoiKy.value = true;
  } else {
    isThemNguoiKy.value = false;
  }
  // Mở khi Thêm người nhận bản sao
  targetIdNguoiKi.value = index;
  moModalGanDanhBa.value = true;
};
const DSDanhba = ref<any>([]);
const formState1 = reactive<any>({});
const LayDSDanhba = async () => {
  // URL của API server SOAP
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  // Envelope của SOAP request
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <LayDSDanhba xmlns="http://tempuri.org/">
          <Email>${Email}</Email>
        </LayDSDanhba>
      </soap12:Body>
    </soap12:Envelope>

     `;

  // Thực hiện request SOAP sử dụng axios
  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: {
      "Content-Type": "application/soap+xml;charset=UTF-8",
    },
  });
  let dataJson = convertXmlToJson(response.data);
  let arrayData;
  const DocumentElement =
    dataJson["soap:Envelope"]["soap:Body"]["LayDSDanhbaResponse"][
      "LayDSDanhbaResult"
    ]["diffgr:diffgram"]["DocumentElement"];
  if (DocumentElement) {
    arrayData = DocumentElement["DB"];
  }
  if (arrayData) {
    if (isArray(arrayData)) {
      arrayData.forEach((obj: { key: any; idDanhba: any }) => {
        obj.key = obj.idDanhba;
      });
    } else {
      arrayData.key = arrayData.idDanhba;
      arrayData = [arrayData];
    }
  } else {
    arrayData = [];
  }
  const convertArrayData: any = map(arrayData, (obj) => {
    return {
      label: obj.TaikhoanDB,
      value: obj.TaikhoanDB,
      HotenTKDB: obj.HotenTKDB,
      idDanhba: obj.idDanhba,
    };
  });
  DSDanhba.value.push(...convertArrayData);
};
const error = ref(false);
const Themmoidanhba = async (thongTinNguoiKy: any) => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Themmoidanhba xmlns="http://tempuri.org/">
          <Taikhoantao>${Email}</Taikhoantao>
          <TaikhoanDB>${thongTinNguoiKy.TaikhoanDB}</TaikhoanDB>
          <HotenTKDB>${thongTinNguoiKy.HotenTKDB}</HotenTKDB>
          <MasothueTKDB></MasothueTKDB>
          <SodienthoaiTKDB></SodienthoaiTKDB>
          <TentochucTKDB></TentochucTKDB>
        </Themmoidanhba>
      </soap12:Body>
    </soap12:Envelope>
     `;

    // Thực hiện request SOAP sử dụng axios
    const response = await axios.post(apiUrl, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml;charset=UTF-8",
      },
    });

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "text/xml");
    const resultNode = xmlDoc.getElementsByTagName("ThemmoidanhbaResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerHTML;
    if (Number(resultValue) === -2) {
      // message.error("Thông tin danh bạ đã tồn tại");
    } else if (Number(resultValue) === -1) {
      message.error("Lỗi hệ thống");
      error.value = true;
    } else if (Number(resultValue) >= 1) {
    }
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const Thietlaptaikhoanky = async (thongTinNguoiKy: any, Trinhtuky: number) => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Thietlaptaikhoanky xmlns="http://tempuri.org/">
          <idFile>${fileStore.idFile}</idFile>
          <Taikhoanky>${thongTinNguoiKy.TaikhoanDB}</Taikhoanky>
          <Trinhtuky>${Trinhtuky + 1}</Trinhtuky>
          <Hinhthucky>${thongTinNguoiKy.Hinhthucky}</Hinhthucky>
          <Taikhoantao>${Email}</Taikhoantao>
        </Thietlaptaikhoanky>
      </soap12:Body>
    </soap12:Envelope>
     `;

    // Thực hiện request SOAP sử dụng axios
    const response = await axios.post(apiUrl, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml;charset=UTF-8",
      },
    });

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "text/xml");
    const resultNode = xmlDoc.getElementsByTagName(
      "ThietlaptaikhoankyResult"
    )[0];
    const resultValue = resultNode.textContent || resultNode.innerHTML;
    if (Number(resultValue) === -2) {
      error.value = true;
      message.error("Tài khoản ký đã được thiết lập với trình tự khác");
    } else if (Number(resultValue) === -1) {
      error.value = true;
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) >= 0) {
      await Themmoidanhba(thongTinNguoiKy);
    }
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const props = defineProps(["file"]);
const emit = defineEmits(["changeStep"]);
const nextStep = async () => {
  each(dynamicValidateForm.users, async (user, index) => {
    await Thietlaptaikhoanky(user, index);
  });
  each(dynamicValidateForm1.users, async (user, index) => {
    await Thietlaptaikhoanky(user, 0);
  });
  if (!error.value) {
    fileStore.setTaiKhoanKy(dynamicValidateForm.users);
    emit("changeStep", 2);
  }
};
const backStep = () => {
  emit("changeStep", 0, 1);
};
onMounted(async () => {
  await LayDSDanhba();
});
</script>
