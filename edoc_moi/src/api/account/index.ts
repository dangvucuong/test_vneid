import request from "../../utils/request";
import { AxiosPromise } from "axios";

const url = import.meta.env.VITE_APP_BASE_URL_API_EDOC_XML;

type UserAccountType = {
  Hoten: string;
  Sodienthoai: string;
  Masothue: string;
  Tentochuc: string;
  CCCDan: string;
};

export const getAccountInfor = async (email: string): AxiosPromise<any> => {
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
     <soap12:Body>
       <Laythongtintaikhoan xmlns="http://tempuri.org/">
         <Email>${email}</Email>
       </Laythongtintaikhoan>
     </soap12:Body>
   </soap12:Envelope>
    `;

  return request({
    baseURL: url,
    method: "post",
    data: soapEnvelope,
    headers: {
      "Content-Type": "application/soap+xml;charset=UTF-8",
    },
  });
};

export const updateAccountInfor = async (
  email: string,
  user: UserAccountType
): AxiosPromise<any> => {
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
     <soap12:Body>
       <Capnhatthongtintaikhoan xmlns="http://tempuri.org/">
         <Email>${email}</Email>
         <Hoten>${user.Hoten}</Hoten>
         <Sodienthoai>${user.Sodienthoai}</Sodienthoai>
         <Masothue>${user.Masothue}</Masothue>
         <Tentochuc>${user.Tentochuc}</Tentochuc>
         <CCCDan>${user.CCCDan ?? ""}</CCCDan>
       </Capnhatthongtintaikhoan>
     </soap12:Body>
   </soap12:Envelope>
    `;

  return request({
    baseURL: url,
    method: "post",
    data: soapEnvelope,
    headers: {
      "Content-Type": "application/soap+xml;charset=UTF-8",
    },
  });
};

export const getDefaultSigningMethod = async (
  email: string
): AxiosPromise<any> => {
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Laythietlapphuongthuckysomacdinh xmlns="http://tempuri.org/">
          <Email>${email}</Email>
        </Laythietlapphuongthuckysomacdinh>
      </soap12:Body>
    </soap12:Envelope>
     `;

  return request({
    baseURL: url,
    method: "post",
    data: soapEnvelope,
    headers: {
      "Content-Type": "application/soap+xml;charset=UTF-8",
    },
  });
};
