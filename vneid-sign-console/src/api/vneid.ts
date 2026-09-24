import { apiFetch } from './client'
import type {
  ApiResponse,
  CalculateDigestRequest,
  CalculateDigestResponse,
  CertificateListResponseData,
  CertificateStatusResponseData,
  ProviderItem,
  RegisterCertificateRequest,
  RegisterCertificateResponseData,
  SignHashPollingResponseData,
  SignHashRequest,
  SignHashResponseData,
  TokenResponse,
  TokenStatus,
  UniversalLinks,
  WebhookEventListResponse,
} from './types'

export function getTokenStatus() {
  return apiFetch<TokenStatus>('/api/vneid/auth/token-status')
}

export function login() {
  return apiFetch<TokenResponse>('/api/vneid/auth/login', { method: 'POST' })
}

export function refreshToken() {
  return apiFetch<TokenResponse>('/api/vneid/auth/refresh', { method: 'POST' })
}

export function getProviders(requestId?: string) {
  return apiFetch<ApiResponse<ProviderItem[]>>('/api/vneid/providers', {
    headers: requestId ? { 'X-Request-Id': requestId } : undefined,
  })
}

export function registerCertificate(body: RegisterCertificateRequest, requestId?: string) {
  return apiFetch<ApiResponse<RegisterCertificateResponseData>>('/api/vneid/certificates/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: requestId ? { 'X-Request-Id': requestId } : undefined,
  })
}

export function getCertificateStatus(transactionCode: string, requestId?: string) {
  return apiFetch<ApiResponse<CertificateStatusResponseData>>(
    `/api/vneid/certificates/status/${encodeURIComponent(transactionCode)}`,
    { headers: requestId ? { 'X-Request-Id': requestId } : undefined },
  )
}

export function listCertificates(citizenPid: string, requestId?: string) {
  return apiFetch<ApiResponse<CertificateListResponseData>>(
    `/api/vneid/certificates/list/${encodeURIComponent(citizenPid)}`,
    { headers: requestId ? { 'X-Request-Id': requestId } : undefined },
  )
}

export function signHash(body: SignHashRequest, requestId?: string) {
  return apiFetch<ApiResponse<SignHashResponseData>>('/api/vneid/signings/hash', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: requestId ? { 'X-Request-Id': requestId } : undefined,
  })
}

export function pollSignHash(handle: string, requestId?: string) {
  return apiFetch<ApiResponse<SignHashPollingResponseData>>(
    `/api/vneid/signings/polling/${encodeURIComponent(handle)}`,
    { headers: requestId ? { 'X-Request-Id': requestId } : undefined },
  )
}

export function calculateDigest(body: CalculateDigestRequest) {
  return apiFetch<CalculateDigestResponse>('/api/vneid/signings/calculate-digest', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getUniversalLinks(txnId: string) {
  return apiFetch<UniversalLinks>(`/api/vneid/universal-links/${encodeURIComponent(txnId)}`)
}

export function getWebhookEvents(since?: string, limit = 100) {
  const params = new URLSearchParams()
  if (since) {
    params.set('since', since)
  }
  params.set('limit', String(limit))
  return apiFetch<WebhookEventListResponse>(`/api/vneid/events?${params.toString()}`)
}
