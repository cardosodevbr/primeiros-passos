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
  encerrada: 'encerrada',
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
  const pagination = $('.pagination-container')
  const pageSize = 6
  let currentPage = 1

  const state = {
    status: 'todas',
    ativa: 'todas',
    search: '',
  }

  function updatePagination(totalItems) {
    if (!pagination) return

    const totalPages = Math.ceil(totalItems / pageSize)
    const pageButtons = $$('.pagination-page', pagination)
    const previousButton = pagination.querySelector('[aria-label="Página anterior"]')
    const nextButton = pagination.querySelector('[aria-label="Próxima página"]')

    pagination.style.display = totalPages > 1 ? 'flex' : 'none'
    pageButtons.forEach((button) => {
      const page = Number(button.dataset.page)
      button.hidden = page > totalPages
      button.classList.toggle('active', page === currentPage)
    })

    if (previousButton) previousButton.disabled = currentPage === 1
    if (nextButton) nextButton.disabled = currentPage === totalPages || totalPages === 0
  }

  /* ---------------------------------------------------------
     FILTRO PRINCIPAL
     --------------------------------------------------------- */
  function applyFilters() {
    const matchingCards = []
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
        normalizeString(card.querySelector('.candidatura-titulo')?.textContent || '').includes(
          normSearch,
        ) ||
        normalizeString(card.querySelector('.candidatura-empresa')?.textContent || '').includes(
          normSearch,
        )

      const isVisible = matchesStatus && matchesAtiva && matchesSearch

      if (isVisible) matchingCards.push(card)
    })

    const totalPages = Math.ceil(matchingCards.length / pageSize)
    if (totalPages > 0 && currentPage > totalPages) currentPage = totalPages

    cards.forEach((card) => {
      const matchingIndex = matchingCards.indexOf(card)
      const isOnCurrentPage =
        matchingIndex >= (currentPage - 1) * pageSize && matchingIndex < currentPage * pageSize
      card.style.display = isOnCurrentPage ? 'flex' : 'none'
    })

    if (emptyState) {
      emptyState.hidden = matchingCards.length > 0
    }

    updatePagination(matchingCards.length)

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
      ativas: 0,
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
      encerradas: counts.encerrada,
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
      currentPage = 1

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
      currentPage = 1

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
      currentPage = 1
      applyFilters()
      if (searchClear) searchClear.classList.toggle('visible', value.length > 0)
    }, 250)

    searchInput.addEventListener('input', (e) => handleSearch(e.target.value))
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = ''
      state.search = ''
      currentPage = 1
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
      currentPage = 1

      if (searchInput) searchInput.value = ''
      if (searchClear) searchClear.classList.remove('visible')

      statusPills.forEach((p) => p.classList.toggle('active', p.dataset.status === 'todas'))
      toggleBtns.forEach((t) => t.classList.toggle('active', t.dataset.ativa === 'todas'))

      applyFilters()
    })
  }

  if (pagination) {
    pagination.addEventListener('click', (event) => {
      const button = event.target.closest('.pagination-btn')
      if (!button || button.disabled) return

      if (button.matches('[aria-label="Página anterior"]')) currentPage--
      if (button.matches('[aria-label="Próxima página"]')) currentPage++
      if (button.classList.contains('pagination-page')) currentPage = Number(button.dataset.page)

      applyFilters()
    })
  }

  applyFilters()
}
