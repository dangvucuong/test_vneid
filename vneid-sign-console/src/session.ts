const storageKey = 'vneid-sign-session'

export interface SignSession {
  citizenPid: string
  provider: string
  servicePackCode: string
  originatorCode: string
  transactionCode: string
  credentialID: string
  lastStatus: string
  lastDescription: string
}

const emptySession: SignSession = {
  citizenPid: '',
  provider: '',
  servicePackCode: '',
  originatorCode: 'CA2_SignPlatform',
  transactionCode: '',
  credentialID: '',
  lastStatus: '',
  lastDescription: '',
}

export function loadSession(): SignSession {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) {
      return { ...emptySession }
    }
    return { ...emptySession, ...(JSON.parse(raw) as Partial<SignSession>) }
  } catch {
    return { ...emptySession }
  }
}

export function saveSession(patch: Partial<SignSession>): SignSession {
  const next = { ...loadSession(), ...patch }
  localStorage.setItem(storageKey, JSON.stringify(next))
  return next
}
