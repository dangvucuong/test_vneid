import type { ErrorBody } from './types'

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5244').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function createRequestId(): string {
  return crypto.randomUUID()
}

function messageFromBody(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') {
    return fallback
  }

  const error = body as ErrorBody
  return error.message || error.errorDescription || error.description || error.title || fallback
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('X-Request-Id')) {
    headers.set('X-Request-Id', createRequestId())
  }
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers })
  const text = await response.text()
  const body = text ? safeJson(text) : null

  if (!response.ok) {
    throw new ApiError(response.status, messageFromBody(body, response.statusText), body)
  }

  return body as T
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}
