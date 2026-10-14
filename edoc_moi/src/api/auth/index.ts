import request from "../../utils/request";
import axios, { AxiosPromise } from "axios";
/**
 * LoginAPI
 *
 * @param data {LoginData}
 * @returns
 */
const url = import.meta.env.VITE_APP_BASE_URL_API_EDOC_XML;

/**
 * LogoutAPI
 */
export function logout() {
  return request({
    url: "/api/v1/auth/logout",
    method: "delete",
  });
}

export function getUserInfo(): AxiosPromise<any> {
  return request({
    url: "/auth/user-profile",
    method: "get",
  });
}

export async function getTokenGoogle({
  code,
  client_id,
  client_secret,
  redirect_uri,
  grant_type,
}: {
  code: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  grant_type: string;
}): AxiosPromise<any> {
  return axios.post("https://oauth2.googleapis.com/token", {
    code,
    client_id: client_id,
    client_secret: client_secret,
    redirect_uri: redirect_uri,
    grant_type: grant_type,
  });
}

export async function getUserInfoGoogle(
  accessToken: string
): AxiosPromise<any> {
  return axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export const createSessionAccount = async (
  email: string,
  Hoten: string
): AxiosPromise<any> => {
  const soapEnvelope = `
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    <soap12:Body>
      <TaoTKphien xmlns="http://tempuri.org/">
        <Email>${email}</Email>
        <Hoten>${Hoten}</Hoten>
      </TaoTKphien>
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

export const userLogin = async (
  email: string,
  password: string
): AxiosPromise<any> => {
  const soapEnvelope = `
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
     <soap12:Body>
       <Dangnhap xmlns="http://tempuri.org/">
         <Email>${email}</Email>
         <Matkhau>${password}</Matkhau>
       </Dangnhap>
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

export const GetSerialRS_idcts = async (idcts: string): AxiosPromise<any> => {
  const soapEnvelope = `
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
     <soap12:Body>
       <GetSerialRS_idcts xmlns="http://tempuri.org/">
         <idcts>${idcts}</idcts>
       </GetSerialRS_idcts>
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

export async function Guiyeucauky_Mobilesign({
  Serial,
  Email,
}: {
  Serial: string;
  Email: string;
}): AxiosPromise<any> {
  return axios.post(
    "https://apisign.nacencomm.vn/api/APISigncore/Guiyeucauky_Mobilesign",
    {
      Serial,
      Cleartext: btoa(Email),
      Linkfile_goc: "",
      Email: Email,
      Masothue: "",
      Mahethong: "1",
      Type: "Text",
      Keyhethong: "||oanh@cavn.vn|Login Edoc",
    }
  );
}

export async function Capnhattrangthaihoantat_Code({
  code,
}: {
  code: string;
}): AxiosPromise<any> {
  return axios.post(
    `https://apisign.nacencomm.vn/api/APISigncore/Capnhattrangthaihoantat_Code?code=${code}&trangthai=1`
  );
}
