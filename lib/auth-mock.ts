// Simple in-memory mock for OTP and auth flows

export type RegisterPayload = {
  email: string
  username: string
  password: string
}

const emailToOtp = new Map<string, string>()
const rateLimit = { count: 0, last: 0 }

export async function requestEmailOtp(email: string): Promise<{ success: true }> {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  emailToOtp.set(email, code)
  return { success: true }
}

export async function verifyEmailOtp(email: string, code: string): Promise<{ ok: boolean }> {
  const expected = emailToOtp.get(email)
  const ok = expected === code
  if (ok) emailToOtp.delete(email)
  return { ok }
}

export async function registerUser(_payload: RegisterPayload): Promise<{ ok: boolean }>{
  // In real backend: only create after verified
  return { ok: true }
}

export async function login(identifier: string, password: string): Promise<{ ok: boolean; error?: string }>{
  const now = Date.now()
  if (rateLimit.count >= 5 && now - rateLimit.last < 30_000) {
    return { ok: false, error: 'Too many attempts. Please wait 30s.' }
  }
  const isOk = identifier.length > 0 && password.length > 0
  if (!isOk) {
    rateLimit.count += 1
    rateLimit.last = now
    return { ok: false, error: 'Invalid credentials' }
  }
  rateLimit.count = 0
  return { ok: true }
}


