import { getSupabaseClient } from './supabase-client.js'

const STORAGE_KEY = 'primeiros-passos:vagas'
const TABLE_NAME = 'vaga'

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() || `vaga-${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null) || ''
}

function normalizeVaga(vaga) {
  return {
    id: firstValue(vaga.id, vaga.id_vaga) || createId(),
    titulo: firstValue(vaga.titulo, vaga.titulo_vaga),
    empresa: firstValue(vaga.empresa, vaga.Empresa, vaga.empresa_vaga),
    localizacao: firstValue(vaga.localizacao, vaga.endereco_vaga),
    tipo: firstValue(vaga.tipo, vaga.tipo_vaga),
    area: firstValue(vaga.area, vaga.areaAtuacao_vaga, vaga.areaatuacao_vaga),
    modalidade: firstValue(
      vaga.modalidade,
      vaga.modalidadeContratacao_vaga,
      vaga.modalidadecontratacao_vaga,
    ),
    carga: firstValue(vaga.carga, vaga.cargaHoraria_vaga, vaga.cargahoraria_vaga),
    descricao: firstValue(vaga.descricao, vaga.descricao_vaga),
    atividades: firstValue(vaga.atividades, vaga.atividades_vaga),
    requisitos: firstValue(vaga.requisitos, vaga.requisitos_vaga),
    beneficios: firstValue(vaga.beneficios, vaga.beneficios_vaga),
    diferenciais: firstValue(vaga.diferenciais, vaga.diferenciais_vaga),
    status: firstValue(vaga.status, vaga.statusCand_vaga, vaga.statuscand_vaga) || 'Ativa',
    candidaturas: firstValue(vaga.candidaturas, vaga.quant_candidaturas, 0),
    imagem: firstValue(vaga.imagem, vaga.img_vaga),
    created_at: firstValue(vaga.created_at) || new Date().toISOString(),
  }
}

function toDatabaseVaga(vaga) {
  const fields = {
    titulo: 'titulo_vaga',
    descricao: 'descricao_vaga',
    atividades: 'atividades_vaga',
    requisitos: 'requisitos_vaga',
    area: 'areaAtuacao_vaga',
    carga: 'cargaHoraria_vaga',
    modalidade: 'modalidadeContratacao_vaga',
    beneficios: 'beneficios_vaga',
    status: 'statusCand_vaga',
    imagem: 'img_vaga',
    diferenciais: 'diferenciais_vaga',
    localizacao: 'endereco_vaga',
    empresa: 'Empresa',
    tipo: 'tipo_vaga',
  }

  return Object.entries(fields).reduce((databaseVaga, [field, databaseField]) => {
    if (Object.prototype.hasOwnProperty.call(vaga, field)) {
      databaseVaga[databaseField] = vaga[field]
    }
    return databaseVaga
  }, {})
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').map(normalizeVaga)
  } catch {
    return []
  }
}

function writeLocal(vagas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vagas.map(normalizeVaga)))
}

/* ---------------------------------------------------------
   Mescla vagas do Supabase com vagas locais (criadas offline).
   Vagas locais têm IDs no formato "vaga-<timestamp>-<random>".
   --------------------------------------------------------- */
function isLocalId(id) {
  return typeof id === 'string' && id.startsWith('vaga-')
}

export async function listVagas() {
  const supabase = await getSupabaseClient()
  let remoteVagas = []

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        remoteVagas = data.map(normalizeVaga)
      }
    } catch (err) {
      console.warn('[vagas-repository] listVagas Supabase falhou, usando local:', err)
    }
  }

  // Inclui vagas criadas localmente (offline) que não existem no Supabase
  const localVagas = readLocal().filter((v) => isLocalId(v.id))

  return [...remoteVagas, ...localVagas]
}

export async function getVaga(id) {
  const supabase = await getSupabaseClient()

  if (supabase && !isLocalId(id)) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id_vaga', id)
        .maybeSingle()
      if (!error && data) return normalizeVaga(data)
    } catch (err) {
      console.warn('[vagas-repository] getVaga Supabase falhou, usando local:', err)
    }
  }

  return readLocal().find((vaga) => vaga.id === id) || null
}

export async function createVaga(payload) {
  const vaga = normalizeVaga({ ...payload, id: createId() })
  const supabase = await getSupabaseClient()

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert(toDatabaseVaga(vaga))
        .select()
        .single()

      if (!error && data) {
        return normalizeVaga(data)
      }

      // Loga o erro do Supabase mas não lança — cai no fallback local
      console.warn('[vagas-repository] createVaga Supabase retornou erro, salvando local:', error?.message)
    } catch (err) {
      console.warn('[vagas-repository] createVaga Supabase falhou, salvando local:', err)
    }
  }

  // Fallback: salva localmente
  const vagas = readLocal()
  vagas.unshift(vaga)
  writeLocal(vagas)
  return vaga
}

export async function updateVaga(id, payload) {
  const supabase = await getSupabaseClient()

  if (supabase && !isLocalId(id)) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(toDatabaseVaga(payload))
        .eq('id_vaga', id)
        .select()
        .single()

      if (!error && data) {
        return normalizeVaga(data)
      }

      console.warn('[vagas-repository] updateVaga Supabase retornou erro, atualizando local:', error?.message)
    } catch (err) {
      console.warn('[vagas-repository] updateVaga Supabase falhou, atualizando local:', err)
    }
  }

  // Fallback: atualiza localmente
  const vagas = readLocal()
  const index = vagas.findIndex((vaga) => vaga.id === id)
  if (index === -1) {
    // Vaga não existe localmente, cria
    const nova = normalizeVaga({ ...payload, id })
    vagas.unshift(nova)
    writeLocal(vagas)
    return nova
  }
  vagas[index] = normalizeVaga({ ...vagas[index], ...payload, id })
  writeLocal(vagas)
  return vagas[index]
}

export async function deleteVaga(id) {
  const supabase = await getSupabaseClient()

  if (supabase && !isLocalId(id)) {
    try {
      const { error } = await supabase.from(TABLE_NAME).delete().eq('id_vaga', id)
      if (!error) {
        // Remove do local também, caso exista cópia
        writeLocal(readLocal().filter((vaga) => vaga.id !== id))
        return true
      }
      console.warn('[vagas-repository] deleteVaga Supabase retornou erro, removendo local:', error?.message)
    } catch (err) {
      console.warn('[vagas-repository] deleteVaga Supabase falhou, removendo local:', err)
    }
  }

  // Fallback: remove localmente
  writeLocal(readLocal().filter((vaga) => vaga.id !== id))
  return true
}
