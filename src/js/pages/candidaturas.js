/* =========================================================
   CANDIDATURAS PAGE JS
   ========================================================= */

import { $, $$ } from '../core/dom.js'
import { normalizeString, debounce } from '../core/utils.js'

const STATUS_GROUP = {
  analise: 'ativa',
  andamento: 'ativa',
  entrevista: 'ativa',
  reprovada: 'encerrada',
  contratado: 'encerrada',
  cancelada: 'encerrada',
  encerrada: 'encerrada'
}

export function initCandidaturasPage() {
  const container = $('#candidaturas-container')
  if (!container) return

  const cards = $$('.candidatura-card', container)
  const statusPills = $$('.candidaturas-pill')
  const toggleBtns = $$('.candidaturas-toggle')
  const searchInput = $('#candidatura-search')
  const searchClear = $('#candidatura-search-clear')
  const emptyState = $('#candidaturas-empty')
  const btnLimpar = $('#btn-limpar-filtros')
  const pagination = $('.candidaturas-pagination')

  const state = {
    status: 'todas',
    ativa: 'todas',
    search: ''
  }

  /* ---------------------------------------------------------
     FILTRO PRINCIPAL
     --------------------------------------------------------- */
  function applyFilters() {
    let visibleCount = 0
    const normSearch = normalizeString(state.search)

    cards.forEach((card) => {
      const cardStatus = card.dataset.status || ''
      const cardAtiva = card.dataset.ativa || ''
      const cardSearch = card.dataset.search || ''

      const matchesStatus =
        state.status === 'todas' ||
        cardStatus === state.status ||
        (state.status === 'encerrada' && cardAtiva === 'encerrada')

      const matchesAtiva = state.ativa === 'todas' || cardAtiva === state.ativa

      const matchesSearch =
        !normSearch ||
        normalizeString(cardSearch).includes(normSearch) ||
        normalizeString(card.querySelector('.candidatura-titulo')?.textContent || '').includes(normSearch) ||
        normalizeString(card.querySelector('.candidatura-empresa')?.textContent || '').includes(normSearch)

      const isVisible = matchesStatus && matchesAtiva && matchesSearch

      card.style.display = isVisible ? 'flex' : 'none'
      if (isVisible) visibleCount++
    })

    if (emptyState) {
      emptyState.hidden = visibleCount > 0
      if (pagination) pagination.style.display = visibleCount > 0 ? 'flex' : 'none'
    }

    updateCounts()
  }

  /* ---------------------------------------------------------
     CONTADORES
     --------------------------------------------------------- */
  function updateCounts() {
    const counts = {
      todas: 0,
      analise: 0,
      andamento: 0,
      entrevista: 0,
      reprovada: 0,
      encerrada: 0,
      contratado: 0,
      ativas: 0
    }

    cards.forEach((card) => {
      counts.todas++
      const status = card.dataset.status
      if (counts[status] !== undefined) counts[status]++
      if (card.dataset.ativa === 'ativa') counts.ativas++
      if (card.dataset.ativa === 'encerrada') counts.encerrada++
    })

    $$('[data-count]').forEach((el) => {
      const key = el.dataset.count
      if (counts[key] !== undefined) el.textContent = counts[key]
    })

    const summaryMap = {
      total: counts.todas,
      ativas: counts.ativas,
      entrevista: counts.entrevista,
      contratado: counts.contratado,
      encerradas: counts.encerrada
    }
    Object.entries(summaryMap).forEach(([key, value]) => {
      const el = document.querySelector(`[data-summary="${key}"]`)
      if (el) el.textContent = value
    })
  }

  /* ---------------------------------------------------------
     SINCRONIZAÇÃO ENTRE FILTROS
     --------------------------------------------------------- */
  function syncToggleWithStatus() {
    if (state.status === 'todas') return

    const group = STATUS_GROUP[state.status]

    if (group === 'encerrada') {
      state.ativa = 'encerrada'
    } else if (group === 'ativa' && state.ativa === 'encerrada') {
      state.ativa = 'todas'
    }

    toggleBtns.forEach((t) => t.classList.toggle('active', t.dataset.ativa === state.ativa))
  }

  function syncStatusWithToggle() {
    const group = STATUS_GROUP[state.status]

    if (state.ativa === 'encerrada' && group === 'ativa') {
      state.status = 'encerrada'
    } else if (state.ativa === 'ativa' && group === 'encerrada') {
      state.status = 'todas'
    } else {
      return
    }

    statusPills.forEach((p) => p.classList.toggle('active', p.dataset.status === state.status))
  }

  /* ---------------------------------------------------------
     EVENTOS: PILLS DE STATUS
     --------------------------------------------------------- */
  statusPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      statusPills.forEach((p) => p.classList.remove('active'))
      pill.classList.add('active')
      state.status = pill.dataset.status || 'todas'

      syncToggleWithStatus()
      applyFilters()
    })
  })

  /* ---------------------------------------------------------
     EVENTOS: TOGGLE ATIVA / ENCERRADA
     --------------------------------------------------------- */
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      state.ativa = btn.dataset.ativa || 'todas'

      syncStatusWithToggle()
      applyFilters()
    })
  })

  /* ---------------------------------------------------------
     EVENTOS: BUSCA POR TEXTO
     --------------------------------------------------------- */
  if (searchInput) {
    const handleSearch = debounce((value) => {
      state.search = value
      applyFilters()
      if (searchClear) searchClear.classList.toggle('visible', value.length > 0)
    }, 250)

    searchInput.addEventListener('input', (e) => handleSearch(e.target.value))
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = ''
      state.search = ''
      searchClear.classList.remove('visible')
      applyFilters()
    })
  }

  /* ---------------------------------------------------------
     EVENTOS: LIMPAR FILTROS
     --------------------------------------------------------- */
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      state.status = 'todas'
      state.ativa = 'todas'
      state.search = ''

      if (searchInput) searchInput.value = ''
      if (searchClear) searchClear.classList.remove('visible')

      statusPills.forEach((p) => p.classList.toggle('active', p.dataset.status === 'todas'))
      toggleBtns.forEach((t) => t.classList.toggle('active', t.dataset.ativa === 'todas'))

      applyFilters()
    })
  }

  applyFilters()
}