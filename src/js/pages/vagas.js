/* =========================================================
   VAGAS 
   ========================================================= */

import { $, $$ } from '../core/dom.js'
import { normalizeString, debounce } from '../core/utils.js'
import { listVagas } from '../services/vagas-repository.js'
import { initGlobalSearch, syncSearchInputs } from '../services/search-service.js'

const AREA_ICONS = {
  tecnologia: 'ri-code-s-slash-line',
  administrativo: 'ri-folder-2-line',
  marketing: 'ri-megaphone-line',
  atendimento: 'ri-customer-service-2-line',
  operacional: 'ri-truck-line',
}

function formatCarga(carga) {
  if (!carga) return ''
  const value = String(carga).trim()
  return /\b(horas?|h)\b/i.test(value) ? value : `${value} horas`
}

function renderVagaCard(vaga) {
  const card = document.createElement('article')
  card.className = 'job-card'
  card.dataset.category = vaga.area.toLowerCase()
  card.dataset.type = vaga.tipo || vaga.modalidade
  card.dataset.modality = vaga.modalidade
  card.dataset.location = vaga.localizacao

  const areaIcon = AREA_ICONS[vaga.area.toLowerCase()] || 'ri-briefcase-line'
  card.innerHTML = `
    <div class="job-card-main">
      <div class="job-icon-box"><i class="${areaIcon}"></i></div>
      <div class="job-info">
        <a href="detalhes-vaga.html?id=${encodeURIComponent(vaga.id)}" class="job-title"></a>
        <span class="job-company"></span>
        <div class="job-meta-row">
          <span class="job-location-item"></span>
          <span>•</span>
          <span class="job-modality"></span>
          <span class="badge badge-tag job-type"></span>
          <span class="badge badge-tag-alt job-area"></span>
          <span class="time-info"></span>
        </div>
      </div>
    </div>
    <div class="job-card-actions">
      <button class="bookmark-btn" aria-label="Salvar vaga"><i class="ri-bookmark-line"></i></button>
      <a href="detalhes-vaga.html?id=${encodeURIComponent(vaga.id)}" class="btn-details">Ver detalhes <i class="ri-arrow-right-line btn-details-arrow"></i></a>
    </div>
  `

  $('.job-title', card).textContent = vaga.titulo
  $('.job-company', card).textContent = vaga.empresa
  $('.job-location-item', card).textContent = vaga.localizacao
  $('.job-modality', card).textContent = vaga.modalidade
  $('.job-type', card).textContent = vaga.tipo || vaga.modalidade
  $('.job-area', card).textContent = vaga.area
  $('.time-info', card).textContent = vaga.carga ? `⏱ ${formatCarga(vaga.carga)}` : ''
  return card
}

export async function initVagasPage() {
  const jobContainer = $('#job-cards-container')
  if (!jobContainer) return

  try {
    const vagas = await listVagas()
    if (vagas.length) {
      jobContainer.innerHTML = ''
      vagas.forEach((vaga) => jobContainer.appendChild(renderVagaCard(vaga)))
    }
  } catch (error) {
    console.error('Não foi possível carregar as vagas.', error)
  }

  const cards = $$('.job-card', jobContainer)
  const categoryPills = $$('.category-pill')
  const pagination = $('.pagination-container')
  const pageSize = 6
  let currentPage = 1

  const skeleton = document.createDocumentFragment()
  for (let index = 0; index < 4; index += 1) {
    const skeletonCard = document.createElement('div')
    skeletonCard.className = 'job-card-skeleton'
    skeletonCard.setAttribute('aria-hidden', 'true')
    skeletonCard.innerHTML = `
      <span class="job-card-skeleton-main">
        <span class="skeleton-block job-card-skeleton-icon"></span>
        <span class="job-card-skeleton-info">
          <span class="skeleton-block job-card-skeleton-title"></span>
          <span class="skeleton-block job-card-skeleton-company"></span>
          <span class="job-card-skeleton-meta">
            <span class="skeleton-block job-card-skeleton-meta-line"></span>
            <span class="skeleton-block job-card-skeleton-meta-line"></span>
            <span class="skeleton-block job-card-skeleton-meta-line"></span>
            <span class="skeleton-block job-card-skeleton-meta-line"></span>
            <span class="skeleton-block job-card-skeleton-meta-line"></span>
            <span class="skeleton-block job-card-skeleton-meta-line"></span>
          </span>
        </span>
      </span>
      <span class="job-card-skeleton-actions">
        <span class="skeleton-block job-card-skeleton-bookmark"></span>
        <span class="skeleton-block job-card-skeleton-details"></span>
      </span>
    `
    skeleton.appendChild(skeletonCard)
  }

  jobContainer.classList.add('is-loading')
  jobContainer.prepend(skeleton)
  window.setTimeout(() => {
    jobContainer.classList.remove('is-loading')
    jobContainer.querySelectorAll('.job-card-skeleton').forEach((item) => item.remove())
  }, 160)

  // Inputs do formulário de filtro desktop
  const keywordInput = $('#filter-keyword')
  const globalSearchInput = $('#global-search-input')
  const areaSelect = $('#filter-area')
  const typeSelect = $('#filter-type')
  const locationInput = $('#filter-location')
  const clearFiltersBtn = $('#btn-clear-filters')
  const filterForm = $('#vagas-filter-form')

  // Elementos do Bottom Sheet Mobile
  const fabBtn = $('#btn-filter-fab')
  const fabBadge = $('#filter-fab-badge')
  const bottomSheet = $('#filter-bottom-sheet')
  const sheetOverlay = $('#filter-sheet-overlay')
  const sheetCloseBtn = $('#filter-sheet-close')
  const mKeywordInput = $('#m-filter-keyword')
  const mAreaSelect = $('#m-filter-area')
  const mTypeSelect = $('#m-filter-type')
  const mLocationInput = $('#m-filter-location')
  const mClearBtn = $('#m-btn-clear-filters')
  const mApplyBtn = $('#m-btn-apply-filters')

  // Estado atual dos filtros
  const state = {
    activeCategory: 'todas',
    keyword: '',
    area: '',
    type: '',
    modalities: [],
    location: '',
  }

  // Initialize global search service
  initGlobalSearch()

  // Sync inputs
  syncSearchInputs(globalSearchInput, keywordInput)
  syncSearchInputs(keywordInput, globalSearchInput)

  // Check for search parameter in URL and apply it
  const urlParams = new URLSearchParams(window.location.search)
  const searchParam = urlParams.get('search')
  if (searchParam && keywordInput) {
    keywordInput.value = searchParam
    if (mKeywordInput) mKeywordInput.value = searchParam
    state.keyword = searchParam
    applyFilters()
  }

  /* ---------------------------------------------------------
     1. BOOKMARK TOGGLE (Salvar Vaga)
     --------------------------------------------------------- */
  cards.forEach((card) => {
    const bookmarkBtn = $('.bookmark-btn', card)
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', (e) => {
        e.preventDefault()
        bookmarkBtn.classList.toggle('saved')

        const isSaved = bookmarkBtn.classList.contains('saved')
        const iconItem = $('i', bookmarkBtn)
        if (iconItem) {
          iconItem.className = isSaved ? 'ri-bookmark-fill' : 'ri-bookmark-line'
        }
      })
    }
  })

  /* ---------------------------------------------------------
     2. LÓGICA DE FILTRAGEM DINÂMICA
     --------------------------------------------------------- */
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

  function applyFilters(resetPage = false) {
    if (resetPage) currentPage = 1

    const matchingCards = []

    cards.forEach((card) => {
      const cardCategory = card.dataset.category ? card.dataset.category.toLowerCase() : ''
      const cardType = card.dataset.type ? card.dataset.type.toLowerCase() : ''
      const cardModality = card.dataset.modality ? card.dataset.modality : ''
      const cardLocation = card.dataset.location ? card.dataset.location : ''

      const cardTitle = $('.job-title', card)?.textContent || ''
      const cardCompany = $('.job-company', card)?.textContent || ''
      const fullSearchableText = `${cardTitle} ${cardCompany} ${cardCategory} ${cardType}`

      // Condição 1: Pill de Categoria Superior
      const matchesCategory =
        state.activeCategory === 'todas' || cardCategory === state.activeCategory

      // Condição 2: Palavra-chave
      const normKeyword = normalizeString(state.keyword)
      const matchesKeyword =
        !normKeyword || normalizeString(fullSearchableText).includes(normKeyword)

      // Condição 3: Área (Dropdown)
      const matchesArea = !state.area || cardCategory === normalizeString(state.area)

      // Condição 4: Tipo de vaga (Dropdown)
      const matchesType = !state.type || cardType === normalizeString(state.type)

      // Condição 5: Modalidade (Checkboxes)
      const matchesModality =
        state.modalities.length === 0 || state.modalities.includes(cardModality)

      // Condição 6: Localização
      const normLocation = normalizeString(state.location)
      const matchesLocation = !normLocation || normalizeString(cardLocation).includes(normLocation)

      // Decisão final de visibilidade
      const isVisible =
        matchesCategory &&
        matchesKeyword &&
        matchesArea &&
        matchesType &&
        matchesModality &&
        matchesLocation

      if (isVisible) {
        matchingCards.push(card)
        card.classList.remove('filtering-out')
        card.classList.add('filtering-in')
      } else {
        card.classList.remove('filtering-in')
      }
    })

    const totalPages = Math.ceil(matchingCards.length / pageSize)
    if (totalPages > 0 && currentPage > totalPages) currentPage = totalPages

    cards.forEach((card) => {
      const matchingIndex = matchingCards.indexOf(card)
      const isOnCurrentPage =
        matchingIndex >= (currentPage - 1) * pageSize && matchingIndex < currentPage * pageSize
      card.style.display = isOnCurrentPage ? 'flex' : 'none'
    })

    // Renderiza Empty State se nenhuma vaga corresponder aos filtros
    renderEmptyState(matchingCards.length)
    updatePagination(matchingCards.length)
    updateActiveFilterCount(matchingCards.length)
  }

  function updateActiveFilterCount(matchingCount) {
    let count = 0
    if (state.keyword && state.keyword.trim()) count += 1
    if (state.area) count += 1
    if (state.type) count += 1
    if (state.location && state.location.trim()) count += 1
    count += state.modalities.length

    if (fabBadge) {
      if (count > 0) {
        fabBadge.hidden = false
        fabBadge.removeAttribute('hidden')
        fabBadge.textContent = String(count)
      } else {
        fabBadge.hidden = true
        fabBadge.setAttribute('hidden', '')
      }
    }

    if (mApplyBtn) {
      const countLabel = typeof matchingCount === 'number' ? ` (${matchingCount})` : ''
      mApplyBtn.innerHTML = `<i class="ri-check-line"></i> Ver vagas${countLabel}`
    }
  }

  function renderEmptyState(count) {
    let emptyBox = $('#no-results-message', jobContainer.parentElement)
    if (count === 0) {
      if (!emptyBox) {
        emptyBox = document.createElement('div')
        emptyBox.id = 'no-results-message'
        emptyBox.className = 'no-results-box'
        emptyBox.innerHTML = `
          <div class="no-results-icon"><i class="ri-search-line"></i></div>
          <h3>Nenhuma vaga encontrada</h3>
          <p>Tente ajustar ou limpar seus filtros para ver mais oportunidades disponíveis.</p>
        `
        jobContainer.parentElement.appendChild(emptyBox)
      }
      emptyBox.style.display = 'flex'
    } else if (emptyBox) {
      emptyBox.style.display = 'none'
    }
  }

  /* ---------------------------------------------------------
     3. EVENT LISTENERS
     --------------------------------------------------------- */

  // Categorias (Pills Superiores)
  categoryPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      categoryPills.forEach((p) => p.classList.remove('active'))
      pill.classList.add('active')
      state.activeCategory = pill.dataset.category || 'todas'
      applyFilters(true)
    })
  })

  // Keyword input handling (Desktop & Mobile Sync)
  if (keywordInput) {
    keywordInput.addEventListener('input', (e) => {
      state.keyword = e.target.value
      if (mKeywordInput && mKeywordInput.value !== e.target.value) {
        mKeywordInput.value = e.target.value
      }
      applyFilters(true)
    })
  }

  if (mKeywordInput) {
    mKeywordInput.addEventListener('input', (e) => {
      state.keyword = e.target.value
      if (keywordInput && keywordInput.value !== e.target.value) {
        keywordInput.value = e.target.value
      }
      if (globalSearchInput && globalSearchInput.value !== e.target.value) {
        globalSearchInput.value = e.target.value
      }
      applyFilters(true)
    })
  }

  // Área Dropdown (Desktop & Mobile Sync)
  if (areaSelect) {
    areaSelect.addEventListener('change', (e) => {
      state.area = e.target.value
      if (mAreaSelect && mAreaSelect.value !== e.target.value) {
        mAreaSelect.value = e.target.value
      }
      applyFilters(true)
    })
  }

  if (mAreaSelect) {
    mAreaSelect.addEventListener('change', (e) => {
      state.area = e.target.value
      if (areaSelect && areaSelect.value !== e.target.value) {
        areaSelect.value = e.target.value
      }
      applyFilters(true)
    })
  }

  // Tipo de vaga Dropdown (Desktop & Mobile Sync)
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      state.type = e.target.value
      if (mTypeSelect && mTypeSelect.value !== e.target.value) {
        mTypeSelect.value = e.target.value
      }
      applyFilters(true)
    })
  }

  if (mTypeSelect) {
    mTypeSelect.addEventListener('change', (e) => {
      state.type = e.target.value
      if (typeSelect && typeSelect.value !== e.target.value) {
        typeSelect.value = e.target.value
      }
      applyFilters(true)
    })
  }

  // Localização Input (Desktop & Mobile Sync)
  if (locationInput) {
    locationInput.addEventListener(
      'input',
      debounce((e) => {
        state.location = e.target.value
        if (mLocationInput && mLocationInput.value !== e.target.value) {
          mLocationInput.value = e.target.value
        }
        applyFilters(true)
      }, 200),
    )
  }

  if (mLocationInput) {
    mLocationInput.addEventListener(
      'input',
      debounce((e) => {
        state.location = e.target.value
        if (locationInput && locationInput.value !== e.target.value) {
          locationInput.value = e.target.value
        }
        applyFilters(true)
      }, 200),
    )
  }

  // Modalidade Checkboxes (Desktop & Mobile Sync)
  const modalityCheckboxes = $$('input[name="modality"]', filterForm)
  const mModalityCheckboxes = $$('input[name="m-modality"]', bottomSheet || document)

  modalityCheckboxes.forEach((cb) => {
    cb.addEventListener('change', () => {
      state.modalities = modalityCheckboxes.filter((c) => c.checked).map((c) => c.value)
      mModalityCheckboxes.forEach((mCb) => {
        mCb.checked = state.modalities.includes(mCb.value)
      })
      applyFilters(true)
    })
  })

  mModalityCheckboxes.forEach((mCb) => {
    mCb.addEventListener('change', () => {
      state.modalities = mModalityCheckboxes.filter((c) => c.checked).map((c) => c.value)
      modalityCheckboxes.forEach((cb) => {
        cb.checked = state.modalities.includes(cb.value)
      })
      applyFilters(true)
    })
  })

  // Botão "Aplicar filtros"
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault()
      applyFilters(true)
    })
  }

  // Função central de reset dos filtros
  function resetAllFilters() {
    if (keywordInput) keywordInput.value = ''
    if (mKeywordInput) mKeywordInput.value = ''
    if (globalSearchInput) globalSearchInput.value = ''
    if (areaSelect) areaSelect.value = ''
    if (mAreaSelect) mAreaSelect.value = ''
    if (typeSelect) typeSelect.value = ''
    if (mTypeSelect) mTypeSelect.value = ''
    if (locationInput) locationInput.value = ''
    if (mLocationInput) mLocationInput.value = ''
    modalityCheckboxes.forEach((cb) => (cb.checked = false))
    mModalityCheckboxes.forEach((cb) => (cb.checked = false))

    state.activeCategory = 'todas'
    state.keyword = ''
    state.area = ''
    state.type = ''
    state.modalities = []
    state.location = ''

    // Clear URL search parameter
    const url = new URL(window.location)
    url.searchParams.delete('search')
    window.history.replaceState({}, '', url)

    categoryPills.forEach((p) => p.classList.remove('active'))
    const defaultPill = $('.category-pill[data-category="todas"]')
    if (defaultPill) defaultPill.classList.add('active')

    applyFilters(true)
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', resetAllFilters)
  }

  if (mClearBtn) {
    mClearBtn.addEventListener('click', resetAllFilters)
  }

  /* ---------------------------------------------------------
     4. CONTROLES DO BOTTOM SHEET MOBILE (FAB + DRAWER)
     --------------------------------------------------------- */
  function openBottomSheet() {
    if (!bottomSheet || !sheetOverlay) return
    bottomSheet.classList.add('is-open')
    sheetOverlay.classList.add('is-open')
    bottomSheet.setAttribute('aria-hidden', 'false')
    sheetOverlay.setAttribute('aria-hidden', 'false')
    if (fabBtn) fabBtn.setAttribute('aria-expanded', 'true')
    document.body.style.overflow = 'hidden'
  }

  function closeBottomSheet() {
    if (!bottomSheet || !sheetOverlay) return
    bottomSheet.classList.remove('is-open')
    sheetOverlay.classList.remove('is-open')
    bottomSheet.setAttribute('aria-hidden', 'true')
    sheetOverlay.setAttribute('aria-hidden', 'true')
    if (fabBtn) fabBtn.setAttribute('aria-expanded', 'false')
    document.body.style.overflow = ''
  }

  if (fabBtn) {
    fabBtn.addEventListener('click', openBottomSheet)
  }

  if (sheetCloseBtn) {
    sheetCloseBtn.addEventListener('click', closeBottomSheet)
  }

  if (sheetOverlay) {
    sheetOverlay.addEventListener('click', closeBottomSheet)
  }

  if (mApplyBtn) {
    mApplyBtn.addEventListener('click', () => {
      closeBottomSheet()
      jobContainer.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bottomSheet?.classList.contains('is-open')) {
      closeBottomSheet()
    }
  })

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
