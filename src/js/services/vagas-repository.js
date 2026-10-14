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

export async function listVagas() {
  const supabase = await getSupabaseClient()
  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map(normalizeVaga)
  }
  return readLocal()
}

export async function getVaga(id) {
  const supabase = await getSupabaseClient()
  if (supabase) {
    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id_vaga', id).single()
    if (error) throw error
    return normalizeVaga(data)
  }
  return readLocal().find((vaga) => vaga.id === id) || null
}

export async function createVaga(payload) {
  const vaga = normalizeVaga(payload)
  const supabase = await getSupabaseClient()
  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(toDatabaseVaga(vaga))
      .select()
      .single()
    if (error) throw error
    return normalizeVaga(data)
  }

  const vagas = readLocal()
  vagas.unshift(vaga)
  writeLocal(vagas)
  return vaga
}

export async function updateVaga(id, payload) {
  const supabase = await getSupabaseClient()
  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(toDatabaseVaga(payload))
      .eq('id_vaga', id)
      .select()
      .single()
    if (error) throw error
    return normalizeVaga(data)
  }

  const vagas = readLocal()
  const index = vagas.findIndex((vaga) => vaga.id === id)
  if (index === -1) return null
  vagas[index] = normalizeVaga({ ...vagas[index], ...payload, id })
  writeLocal(vagas)
  return vagas[index]
}

export async function deleteVaga(id) {
  const supabase = await getSupabaseClient()
  if (supabase) {
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id_vaga', id)
    if (error) throw error
    return true
  }

  const vagas = readLocal()
  writeLocal(vagas.filter((vaga) => vaga.id !== id))
  return true
}
