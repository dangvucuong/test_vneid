<template>
  <div>
    <a-modal v-model:visible="showDialog" title="Xin vui lòng đợi kết quả" @cancel="showDialog = false" width="300">
      <a-spin :spinning="loading">
        <pre v-if="!loading">{{ apiResponse }}</pre>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from "vue-router";
import { getAccountInfor, getDefaultSigningMethod, getAccountInforCCCD,updateCCCDTKChinh } from "@/api/account";
import { useUserStoreHook } from "@/store/modules/user";
import { Storage } from "@/utils/Storage";
const showDialog = ref(false)
const loading = ref(true)
const apiResponse = ref<string>('')

// Lấy toàn bộ query string bao gồm ký tự encode
const fullQueryString = window.location.search.slice(1)
const router = useRouter();
const useUserStore = useUserStoreHook();
onMounted(async () => {
  showDialog.value = true
  loading.value = true
  try {
    const apiUrl = `https://loginvneid.nacencomm.vn/dang-nhap?${fullQueryString}`
    const response = await axios.get(apiUrl)
    var resp=response;
    apiResponse.value = JSON.stringify(response.data, null, 2)
    var cccd, hoten, keyxt, logvneid;
    if (apiResponse.value != null) 
    {

      var type = localStorage.getItem('typeinfo_vneid');
      if (Number(type) === 1) // dang nhap bang vneid
      {
        logvneid = apiResponse.value;
        cccd = response.data.citizenPid;
        hoten = response.data.fullName;
        keyxt = 'SP2025_888@';
        const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
        const soapEnvelope = `
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <VneID_TaoTKphien xmlns="http://tempuri.org/">
              <CCCDan>${cccd}</CCCDan>
              <Hoten>${hoten}</Hoten>
              <LogVNeID>${logvneid}</LogVNeID>
                <keyxt>${keyxt}</keyxt>
            </VneID_TaoTKphien>
          </soap12:Body>
        </soap12:Envelope>
     `;

        const response_taotkphienvneid = await axios.post(apiUrl, soapEnvelope, {
          headers: {
            "Content-Type": "application/soap+xml;charset=UTF-8",
          },
        });

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response_taotkphienvneid.data, "text/xml");
        //console.log("response dang ky tk phien: ",response_taotkphienvneid.data);
        const resultNode: any =
          xmlDoc.getElementsByTagName("VneID_TaoTKphienResult")[0];
        const resultValue = resultNode.textContent || resultNode.innerText;
        if (Number(resultValue) > 0) {
          //  alert("Tạo tài khoản phiên thành công. Mã tài khoản: " + resultValue);
          await Laythongtintaikhoan(cccd);

        } else {
          alert("Có lỗi xảy ra. Vui lòng thử lại sau!");
        }
      }
      else if(Number(type) === 2)  // cap nhat cccd tk chinh
      {
        logvneid = apiResponse.value;
        cccd = resp.data.citizenPid;
        var  email = Storage.get("Email");
      //  alert(email);
        keyxt = 'SP2025_888@';
         const response: any = await updateCCCDTKChinh(email,cccd,logvneid,keyxt);
         const parser = new DOMParser();
         const xmlDoc = parser.parseFromString(response, "text/xml");
         const resultNode = xmlDoc.getElementsByTagName("VneID_DinhdanhtaikhoanVNeIDResult")[0];
          const resultValue = resultNode.textContent || resultNode.innerHTML;
        //  alert(resultValue);
          //console.log("result update cccd:",response);
         if(Number(resultValue)===1){
          alert("Cập nhật thông tin thành công");
          router.push("/quan-ly/tai-lieu");
         }
         else{
          alert('Có lỗi xảy ra hoặc CCCD đã được cập nhật');
            router.push("/quan-ly/tai-lieu");
         }
      }

    }

    // console.log('value: ',apiResponse.value);
  } catch (err: any) {
    console.log(err);
    apiResponse.value = `❌ Lỗi gọi API: ${err.message}`
  } finally {
    loading.value = false
  }
})

const Laythongtintaikhoan = async (cccd: string) => {
  try {
    // Thực hiện request SOAP sử dụng axios
    const response: any = await getAccountInforCCCD(cccd);

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response, "text/xml");
    let data: any = {};
    data.idTaikhoan = xmlDoc.getElementsByTagName("idTaikhoan")[0].textContent;
    data.email = xmlDoc.getElementsByTagName("Email")[0].textContent;
    data.Hoten = xmlDoc.getElementsByTagName("Hoten")[0].textContent;
    data.PhanloaiTK = xmlDoc.getElementsByTagName("PhanloaiTK")[0].textContent;
    data.CCCDan=xmlDoc.getElementsByTagName("CCCDan")[0].textContent;
    // Cập nhật giá trị kết quả
    useUserStore.login(data);

    router.push("/quan-ly/tai-lieu");
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};


</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
}
</style>
