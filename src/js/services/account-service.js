import { getSupabaseClient } from './supabase-client.js'

const ACCOUNTS_KEY = 'primeiros-passos:accounts'
const SESSION_KEY = 'primeiros-passos:session'
const PROFILE_TABLE = 'user'

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
  const session = {
    id: account.id,
    name: account.name,
    email: account.email,
    type: account.type || 'candidato',
    phone: account.phone || '',
    birthDate: account.birthDate || '',
    city: account.city || '',
    state: account.state || '',
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

function profileToAccount(profile, authUser) {
  return {
    id: profile?.id_user || authUser.id,
    name: profile?.nome_user || authUser.user_metadata?.name || authUser.email,
    email: profile?.email_user || authUser.email,
    phone: profile?.telefone_user,
    birthDate: profile?.data_nascimento,
    city: profile?.cidade_user,
    state: profile?.estado_user,
    type: 'candidato',
  }
}

async function findProfile(supabase, authUser) {
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select(
      'id_user,nome_user,email_user,telefone_user,created_at,data_nascimento,cidade_user,estado_user',
    )
    .eq('email_user', authUser.email)
    .maybeSingle()

  if (error) throw error
  return data
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
  const supabase = await getSupabaseClient()
  if (supabase) {
    const normalizedEmail = email.trim().toLowerCase()
    const passwordHash = await hashPassword(password)
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: name.trim() || company.trim(),
          password_hash: passwordHash,
        },
      },
    })

    if (error) {
      if (error.code === '23505') throw new Error('Este e-mail já está cadastrado.')
      throw error
    }
    if (!data?.user) throw new Error('Não foi possível criar a conta.')
    if (!data.session) {
      throw new Error('Conta criada. Verifique seu e-mail para confirmar o cadastro.')
    }
    const profile = await findProfile(supabase, data.user)
    return saveSession({ ...profileToAccount(profile, data.user), type })
  }

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
  const supabase = await getSupabaseClient()
  if (supabase) {
    const normalizedEmail = email.trim().toLowerCase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (!error && data.user) {
      const profile = await findProfile(supabase, data.user)
      return saveSession({ ...profileToAccount(profile, data.user), type })
    }

    const { data: profile, error: profileError } = await supabase.rpc('login_user', {
      p_email: normalizedEmail,
      p_senha_hash: await hashPassword(password),
    })

    if (profileError || !profile?.[0]) throw new Error('E-mail ou senha inválidos.')
    return saveSession({ ...profileToAccount(profile[0], { email: normalizedEmail }), type })
  }

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

export async function logoutAccount() {
  localStorage.removeItem(SESSION_KEY)
  const supabase = await getSupabaseClient()
  if (supabase) await supabase.auth.signOut()
}
