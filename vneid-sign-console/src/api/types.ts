export interface ApiResponse<T> {
  status?: string | null
  description?: string | null
  data?: T | null
}

export interface ErrorBody {
  error?: string | null
  errorDescription?: string | null
  message?: string | null
  title?: string | null
  status?: string | null
  description?: string | null
}

export interface TokenStatus {
  authenticated: boolean
  message?: string
  expiresInSeconds?: number
  refreshTokenExpiresInSeconds?: number
}

export interface TokenResponse {
  accessToken?: string | null
  refreshToken?: string | null
  expireInSeconds?: number | null
  refreshTokenExpireInSeconds?: number | null
  message?: string | null
  status?: string | null
  description?: string | null
}

export interface ServicePackItem {
  servicePackCode: string
  servicePackName?: string | null
  servicePackMonth: number
  unitPrice: number
  free: number
}

export interface ProviderItem {
  providerName?: string | null
  provider: string
  status: number
  servicePackList: ServicePackItem[]
}

export interface UserInfo {
  fullName: string
  birthDate: string
  citizenPid: string
  issuingAuthority?: string | null
  dateOfIssue?: string | null
  gender?: string | null
  phone?: string | null
  email?: string | null
  nationalityCode: string
  permanentAddress?: string | null
  permanentVillageText?: string | null
  permanentCityText?: string | null
  livingPlaceAddress?: string | null
  livingPlaceVillageText?: string | null
  livingPlaceCityText?: string | null
  idCardExpireDate?: string | null
}

export interface RegisterCertificateRequest {
  userInfo: UserInfo
  provider: string
  servicePackCode: string
  originatorCode: string
}

export interface RegisterCertificateResponseData {
  transactionCode: string
}

export interface CertificateStatusResponseData {
  transactionCode?: string | null
  statusCode: number
  requestType: number
  citizenPid?: string | null
  serialNumber?: string | null
  certificateId?: string | null
  certificateData?: string | null
  errorCode?: string | null
  resultCode?: string | null
}

export interface CredentialCertDetail {
  status: number
  certificates: string[]
  issuerDN?: string | null
  serialNumber?: string | null
  subjectDN?: string | null
  validFrom?: string | null
  validTo?: string | null
  provider?: string | null
  flow: number
}

export interface CredentialKeyDetail {
  status?: string | null
  algo: string[]
  len: number
  curve?: string | null
}

export interface CredentialInfoItem {
  credentialID: string
  cert: CredentialCertDetail
  key: CredentialKeyDetail
}

export interface CertificateListResponseData {
  credentialIDs: string[]
  credentialInfos: CredentialInfoItem[]
}

export interface SignHashDocument {
  documentName: string
  digestValue: string
}

export interface SignHashRequest {
  credentialID: string
  originatorCode: string
  documents: SignHashDocument[]
}

export interface SignHashResponseData {
  handle: string
  expiresIn: number
  provider?: string | null
}

export interface SignHashPollingResponseData {
  handle?: string | null
  statusCode: number
  resultCode?: string | null
  errorCode?: string | null
  signatures: string[]
}

export interface CalculateDigestRequest {
  documentName?: string
  content: string
  isBase64: boolean
}

export interface CalculateDigestResponse {
  documentName: string
  digestValue: string
}

export interface UniversalLinks {
  txnId: string
  shareConsentUrl: string
  reactivateUrl: string
  partnerCallbackUrl?: string | null
}

export interface WebhookEventRecord {
  id: string
  receivedAt: string
  type: string
  transactionCode?: string | null
  handle?: string | null
  txnId?: string | null
  status?: number | null
  requestId?: string | null
  endpoint: string
  data?: unknown
}

export interface WebhookEventListResponse {
  serverTime: string
  events: WebhookEventRecord[]
}

export const GATEWAY_STATUS: Record<string, string> = {
  '00': 'Thiếu token, token hết hạn hoặc token không hợp lệ',
  '01': 'Thành công',
  '02': 'Xác thực dữ liệu thất bại',
  '03': 'Không tìm thấy tài nguyên',
  '20': 'Thiếu header xác thực HMAC',
  '21': 'Vượt quá giới hạn số lần gọi HMAC',
  '22': 'Timestamp HMAC không hợp lệ',
  '23': 'Timestamp HMAC đã hết hạn',
  '24': 'Nonce HMAC bị trùng lặp',
  '25': 'Không xác định được đối tác',
  '26': 'Chữ ký HMAC không hợp lệ',
  '27': 'Lỗi nội bộ HMAC',
  '99': 'Lỗi hệ thống nội bộ',
}
