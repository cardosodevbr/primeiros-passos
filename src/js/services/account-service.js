import { getSupabaseClient } from './supabase-client.js'

const ACCOUNTS_KEY = 'primeiros-passos:accounts'
const SESSION_KEY = 'primeiros-passos:session'
const PROFILE_TABLES = ['User', 'user']

// Registros do Supabase (base de dados oficial do projeto)
const SEED_USERS = [
  {
    id_user: 1,
    nome_user: 'Leonardo Lopo  λ',
    email_user: 'leonzz@leonzz.co',
    telefone_user: '11 99999-9999',
    created_at: '2026-10-14 10:53:09.231841+00',
    data_nascimento: '2005-05-05',
    cidade_user: 'São Paulo',
    estado_user: 'São Paulo',
    senha_hash: '12345678',
    type: 'candidato',
  },
  {
    id_user: 2,
    nome_user: 'admin',
    email_user: 'primeirospassos@gmail.com',
    telefone_user: '11 91111-1111',
    created_at: '2026-10-15 00:35:18.791369+00',
    data_nascimento: '2000-01-01',
    cidade_user: 'Osasco',
    estado_user: 'São Paulo',
    senha_hash: '1234@1234',
    type: 'empresa',
  },
  {
    id_user: 3,
    nome_user: 'Teste Cadastro',
    email_user: 'teste_cadastro_meta@gmail.com',
    telefone_user: '',
    created_at: '2026-10-15 12:08:14.96747+00',
    data_nascimento: '',
    cidade_user: '',
    estado_user: '',
    senha_hash: '12345678',
    type: 'candidato',
  },
  {
    id_user: 5,
    nome_user: 'Bolsonaro Jr',
    email_user: 'bolsonaro@vintedois.com',
    telefone_user: '',
    created_at: '2026-10-15 14:41:22.728462+00',
    data_nascimento: '',
    cidade_user: '',
    estado_user: '',
    senha_hash: 'Bolsonaro22!',
    type: 'candidato',
  },
]

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

function profileToAccount(profile, authUser = {}) {
  const email = (profile?.email_user || authUser?.email || '').trim().toLowerCase()
  const isCompany = profile?.type === 'empresa' || email === 'primeirospassos@gmail.com'
  return {
    id: profile?.id_user || authUser?.id || `user-${Date.now()}`,
    name: profile?.nome_user || authUser?.user_metadata?.name || authUser?.email || 'Usuário',
    email,
    phone: profile?.telefone_user || '',
    birthDate: profile?.data_nascimento || '',
    city: profile?.cidade_user || '',
    state: profile?.estado_user || '',
    type: isCompany ? 'empresa' : (profile?.type || 'candidato'),
  }
}

async function findProfile(supabase, authUser) {
  const email = (authUser?.email || '').trim().toLowerCase()
  for (const tableName of PROFILE_TABLES) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(
          'id_user,nome_user,email_user,telefone_user,created_at,data_nascimento,cidade_user,estado_user',
        )
        .ilike('email_user', email)
        .maybeSingle()

      if (!error && data) return data
    } catch {
      // continua para a próxima tabela
    }
  }
  return null
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
  const displayName = name.trim() || company.trim()
  const passwordHash = await hashPassword(password)
  let supabase = null

  try {
    supabase = await getSupabaseClient()
  } catch (err) {
    console.warn('Supabase não pôde ser inicializado:', err)
  }

  if (supabase) {
    // 1. Verifica e-mail duplicado nos seed users
    if (SEED_USERS.some((u) => u.email_user.toLowerCase() === normalizedEmail)) {
      throw new Error('Este e-mail já está cadastrado.')
    }

    // 2. Tenta RPC register_user (bypass de RLS)
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('register_user', {
        p_nome: displayName,
        p_email: normalizedEmail,
        p_senha: password,
      })
      if (!rpcError && rpcData) {
        // RPC criou o usuário direto na tabela — faz login automático
        const profile = Array.isArray(rpcData) ? rpcData[0] : rpcData
        return saveSession({ ...profileToAccount(profile, { email: normalizedEmail }), type })
      }
    } catch (_) {
      // RPC não existe ainda — continua para Supabase Auth
    }

    // 3. Cria via Supabase Auth (aciona o trigger handle_new_user)
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: displayName,
          // Passa a senha em texto puro: o trigger handle_new_user vai gravar em senha_hash
          // O SHA-256 é mantido como password_hash para compatibilidade futura
          password_hash: password,
          password_hash_sha256: passwordHash,
        },
      },
    })

    if (error) {
      // E-mail já cadastrado
      if (
        error.code === 'user_already_exists' ||
        error.code === '23505' ||
        error.message?.toLowerCase().includes('already registered') ||
        error.message?.toLowerCase().includes('already been registered')
      ) {
        throw new Error('Este e-mail já está cadastrado.')
      }
      // Rate limit de e-mails do Supabase (plano gratuito: ~3-4/hora)
      if (
        error.code === 'over_email_send_rate_limit' ||
        error.message?.toLowerCase().includes('rate limit') ||
        error.message?.toLowerCase().includes('email rate limit')
      ) {
        throw new Error(
          'Limite de cadastros por e-mail atingido. Aguarde alguns minutos ou entre com sua Conta Google.',
        )
      }
      throw new Error(error.message || 'Não foi possível criar a conta.')
    }

    if (!data?.user) throw new Error('Não foi possível criar a conta.')

    // Cadastro realizado mas confirmação de e-mail está pendente
    if (!data.session) {
      return { pending: true, email: normalizedEmail, name: displayName }
    }

    // Sessão ativa imediatamente (e-mail confirmado automaticamente)
    const profile = await findProfile(supabase, data.user)
    return saveSession({ ...profileToAccount(profile, data.user), type })
  }

  // Fallback offline: armazena localmente
  const accounts = readAccounts()
  if (
    accounts.some((a) => a.email === normalizedEmail) ||
    SEED_USERS.some((u) => u.email_user.toLowerCase() === normalizedEmail)
  ) {
    throw new Error('Este e-mail já está cadastrado.')
  }

  const account = {
    id: globalThis.crypto?.randomUUID?.() || `account-${Date.now()}`,
    name: displayName,
    email: normalizedEmail,
    passwordHash,
    type,
    company: company.trim(),
    cnpj: cnpj.trim(),
    companyType: companyType.trim(),
  }
  accounts.push(account)
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  return saveSession(account)
}

export async function loginAccount(email, password, type = null) {
  const normalizedEmail = email.trim().toLowerCase()
  const passwordHash = await hashPassword(password)
  const defaultType = normalizedEmail === 'primeirospassos@gmail.com' ? 'empresa' : 'candidato'
  const resolvedType = type || defaultType
  let supabase = null
  try {
    supabase = await getSupabaseClient()
  } catch (err) {
    console.warn('Supabase não pôde ser inicializado:', err)
  }

  if (supabase) {
    // 1. Tenta RPC login_user (primeiro com senha direta, depois com hash SHA-256)
    try {
      const { data: profileDirect, error: errDirect } = await supabase.rpc('login_user', {
        p_email: normalizedEmail,
        p_senha_hash: password,
      })
      if (!errDirect && profileDirect && profileDirect[0]) {
        return saveSession({
          ...profileToAccount(profileDirect[0], { email: normalizedEmail }),
          type: resolvedType,
        })
      }
    } catch (e) {
      console.warn('Tentativa com senha direta no login_user falhou:', e)
    }

    try {
      const { data: profileHash, error: errHash } = await supabase.rpc('login_user', {
        p_email: normalizedEmail,
        p_senha_hash: passwordHash,
      })
      if (!errHash && profileHash && profileHash[0]) {
        return saveSession({
          ...profileToAccount(profileHash[0], { email: normalizedEmail }),
          type: resolvedType,
        })
      }
    } catch (e) {
      console.warn('Tentativa com hash no login_user falhou:', e)
    }

    // 2. Tenta leitura direta na tabela User / user caso RLS permita
    for (const tableName of PROFILE_TABLES) {
      try {
        const { data: dbUser, error: dbError } = await supabase
          .from(tableName)
          .select('id_user,nome_user,email_user,telefone_user,created_at,data_nascimento,cidade_user,estado_user,senha_hash')
          .ilike('email_user', normalizedEmail)
          .maybeSingle()

        if (!dbError && dbUser) {
          const match = dbUser.senha_hash === password || dbUser.senha_hash === passwordHash
          if (match) {
            return saveSession({
              ...profileToAccount(dbUser, { email: normalizedEmail }),
              type: resolvedType,
            })
          }
        }
      } catch (e) {
        console.warn(`Tentativa na tabela ${tableName} falhou:`, e)
      }
    }

    // 3. Tenta Supabase Auth signInWithPassword
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (!error && data.user) {
        const profile = await findProfile(supabase, data.user)
        return saveSession({ ...profileToAccount(profile, data.user), type: resolvedType })
      }
    } catch (e) {
      console.warn('Supabase Auth signIn falhou:', e)
    }
  }

  // 4. Verificação com os registros base do Supabase (SEED_USERS)
  const seedMatch = SEED_USERS.find(
    (u) =>
      u.email_user.toLowerCase() === normalizedEmail &&
      (u.senha_hash === password || u.senha_hash === passwordHash),
  )
  if (seedMatch) {
    return saveSession({
      ...profileToAccount(seedMatch, { email: normalizedEmail }),
      type: resolvedType,
    })
  }

  // 5. Fallback com contas locais do localStorage
  const account = readAccounts().find(
    (item) => item.email === normalizedEmail && (item.type === type || !item.type),
  )
  if (
    account &&
    (account.passwordHash === passwordHash ||
      account.passwordHash === password ||
      account.password === password)
  ) {
    return saveSession(account)
  }

  throw new Error('E-mail ou senha inválidos.')
}

export function getCurrentAccount() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

export async function getUserProfile() {
  let account = getCurrentAccount()
  const supabase = await getSupabaseClient()

  // 1. Se não houver session local mas houver usuário logado no Supabase Auth
  if (!account && supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const profile = await findProfile(supabase, user)
        account = saveSession(profileToAccount(profile, user))
      }
    } catch (e) {
      console.warn('Erro ao verificar auth.getUser():', e)
    }
  }

  // 2. Se ainda não há usuário logado, adota o usuário candidato oficial (Leonardo Lopo)
  if (!account) {
    const defaultCandidate = SEED_USERS.find((u) => u.type === 'candidato') || SEED_USERS[0]
    account = profileToAccount(defaultCandidate)
  }

  // 3. Tenta buscar informações atualizadas diretamente do Supabase
  if (supabase && account?.email) {
    for (const tableName of PROFILE_TABLES) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select(
            'id_user,nome_user,email_user,telefone_user,created_at,data_nascimento,cidade_user,estado_user',
          )
          .ilike('email_user', account.email)
          .maybeSingle()

        if (!error && data) {
          const merged = {
            ...account,
            id: data.id_user ?? account.id,
            name: data.nome_user || account.name,
            email: data.email_user || account.email,
            phone: data.telefone_user || account.phone || '',
            birthDate: data.data_nascimento || account.birthDate || '',
            city: data.cidade_user || account.city || '',
            state: data.estado_user || account.state || '',
          }
          saveSession(merged)
          return merged
        }
      } catch (err) {
        // continua próxima tentativa
      }
    }
  }

  // 4. Complementa com SEED_USERS se faltar campos
  const seedMatch = SEED_USERS.find(
    (u) => u.email_user?.toLowerCase() === account.email?.toLowerCase(),
  )
  if (seedMatch) {
    account = {
      ...account,
      name: account.name || seedMatch.nome_user,
      phone: account.phone || seedMatch.telefone_user || '',
      birthDate: account.birthDate || seedMatch.data_nascimento || '',
      city: account.city || seedMatch.cidade_user || '',
      state: account.state || seedMatch.estado_user || '',
    }
  }

  return account
}


export async function logoutAccount() {
  localStorage.removeItem(SESSION_KEY)
  const supabase = await getSupabaseClient()
  if (supabase) {
    try {
      await supabase.auth.signOut()
    } catch {
      // ignora erro ao deslogar
    }
  }
}

/* ─────────────────────────────────────────────────────────
   GOOGLE OAUTH
───────────────────────────────────────────────────────── */

/**
 * Inicia o fluxo de login/cadastro com Google via Supabase OAuth.
 * Redireciona o usuário para a tela de consentimento do Google.
 * Após concluir, o Supabase redireciona para `redirectTo`.
 *
 * @param {string} [type='candidato']
 * @param {string} [redirectTo]  URL de destino após login
 */
export async function loginWithGoogle(type = 'candidato', redirectTo) {
  const supabase = await getSupabaseClient()
  if (!supabase) throw new Error('Supabase não configurado.')

  // Determina para onde voltar depois do OAuth
  const baseUrl = window.location.href
    .replace(/\/src\/pages\/[^/]+$/, '')
    .replace(/\/[^/]+\.html$/, '')

  const callbackUrl = `${baseUrl}/src/pages/oauth-callback.html?type=${type}`

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  })

  if (error) throw new Error(error.message || 'Erro ao iniciar login com Google.')
}

/**
 * Lê o token da URL de callback do Supabase OAuth e salva a sessão local.
 * Chame esta função na página de callback após o redirect do Google.
 *
 * @returns {Promise<object|null>} sessão salva ou null
 */
export async function handleOAuthCallback() {
  const supabase = await getSupabaseClient()
  if (!supabase) return null

  // O Supabase injeta o token no hash ou no query string após o redirect
  const { data, error } = await supabase.auth.getSession()

  if (error || !data?.session?.user) return null

  const user = data.session.user
  const profile = await findProfile(supabase, user)

  // Detecta tipo da URL (?type=empresa)
  const params = new URLSearchParams(window.location.search)
  const type = params.get('type') || 'candidato'

  return saveSession({ ...profileToAccount(profile, user), type })
}
