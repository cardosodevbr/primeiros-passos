import { getSupabaseClient } from './supabase-client.js'

const STORAGE_KEY = 'primeiros-passos:vagas'

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() || `vaga-${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
}

function normalizeVaga(vaga) {
  return {
    id: vaga.id || createId(),
    titulo: vaga.titulo || '',
    empresa: vaga.empresa || '',
    localizacao: vaga.localizacao || '',
    tipo: vaga.tipo || '',
    area: vaga.area || '',
    modalidade: vaga.modalidade || '',
    carga: vaga.carga || '',
    descricao: vaga.descricao || '',
    requisitos: vaga.requisitos || '',
    beneficios: vaga.beneficios || '',
    status: vaga.status || 'ativa',
    created_at: vaga.created_at || new Date().toISOString(),
  }
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

export function seedVagasFromCards(cards) {
  if (readLocal().length || !cards?.length) return

  const vagas = cards.map((card, index) =>
    normalizeVaga({
      id: `vaga-legada-${index + 1}`,
      titulo: card.querySelector('.job-title')?.textContent.trim(),
      empresa: card.querySelector('.job-company')?.textContent.trim(),
      localizacao: card.dataset.location,
      tipo: card.dataset.type,
      area: card.dataset.category,
      modalidade: card.dataset.modality,
      carga: card.querySelector('.time-info')?.textContent.replace(/^⏱\s*/, '').trim(),
      status: 'ativa',
      created_at: new Date(Date.now() - index * 86400000).toISOString(),
    }),
  )

  writeLocal(vagas)
}

export async function listVagas() {
  const supabase = await getSupabaseClient()
  if (supabase) {
    const { data, error } = await supabase
      .from('vagas')
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
    const { data, error } = await supabase.from('vagas').select('*').eq('id', id).single()
    if (error) throw error
    return normalizeVaga(data)
  }
  return readLocal().find((vaga) => vaga.id === id) || null
}

export async function createVaga(payload) {
  const vaga = normalizeVaga(payload)
  const supabase = await getSupabaseClient()
  if (supabase) {
    const { data, error } = await supabase.from('vagas').insert(vaga).select().single()
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
      .from('vagas')
      .update(payload)
      .eq('id', id)
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
    const { error } = await supabase.from('vagas').delete().eq('id', id)
    if (error) throw error
    return true
  }

  const vagas = readLocal()
  writeLocal(vagas.filter((vaga) => vaga.id !== id))
  return true
}
