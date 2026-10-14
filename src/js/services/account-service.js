const ACCOUNTS_KEY = 'primeiros-passos:accounts'
const SESSION_KEY = 'primeiros-passos:session'

async function hashPassword(password) {
  if (!globalThis.crypto?.subtle) return password
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveSession(account) {
  const session = { id: account.id, name: account.name, email: account.email, type: account.type }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export async function createAccount({
  name,
  email,
  password,
  type = 'candidato',
  company = '',
  cnpj = '',
  companyType = '',
}) {
  const normalizedEmail = email.trim().toLowerCase()
  const accounts = readAccounts()
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error('Este e-mail já está cadastrado.')
  }

  const account = {
    id: globalThis.crypto?.randomUUID?.() || `account-${Date.now()}`,
    name: name.trim() || company.trim(),
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    type,
    company: company.trim(),
    cnpj: cnpj.trim(),
    companyType: companyType.trim(),
  }
  accounts.push(account)
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  return saveSession(account)
}

export async function loginAccount(email, password, type = 'candidato') {
  const account = readAccounts().find(
    (item) => item.email === email.trim().toLowerCase() && item.type === type,
  )
  if (!account || account.passwordHash !== (await hashPassword(password))) {
    throw new Error('E-mail ou senha inválidos.')
  }
  return saveSession(account)
}

export function getCurrentAccount() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

export function logoutAccount() {
  localStorage.removeItem(SESSION_KEY)
}
