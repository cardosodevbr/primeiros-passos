/* =========================================================
   SEARCH SERVICE
   Centraliza lógica de busca e redirecionamento
   ========================================================= */

import { $ } from '../core/dom.js'
import { debounce } from '../core/utils.js'

const VAGAS_PAGE = 'src/pages/vagas.html'

export function initGlobalSearch() {
  const globalSearchInput = $('#global-search-input')
  if (!globalSearchInput) return

  const handleSearch = debounce((searchTerm) => {
    if (searchTerm.trim()) {
      redirectWithSearch(searchTerm)
    }
  }, 500)

  globalSearchInput.addEventListener('input', (e) => {
    handleSearch(e.target.value)
  })

  globalSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const searchTerm = globalSearchInput.value.trim()
      if (searchTerm) {
        redirectWithSearch(searchTerm)
      }
    }
  })

  // Check for search parameter in URL
  const urlParams = new URLSearchParams(window.location.search)
  const searchParam = urlParams.get('search')
  if (searchParam) {
    globalSearchInput.value = searchParam
  }
}

export function redirectWithSearch(searchTerm) {
  const url = new URL(window.location.href)
  if (url.pathname.includes('vagas.html')) {
    // Se já está na página de vagas, apenas atualiza o input e dispara evento
    const keywordInput = $('#filter-keyword')
    if (keywordInput) {
      keywordInput.value = searchTerm
      keywordInput.dispatchEvent(new Event('input'))
    }
  } else {
    // Redireciona para página de vagas com o termo de busca
    window.location.href = `${VAGAS_PAGE}?search=${encodeURIComponent(searchTerm)}`
  }
}

export function syncSearchInputs(sourceInput, targetInput) {
  if (sourceInput && targetInput) {
    sourceInput.addEventListener('input', (e) => {
      targetInput.value = e.target.value
    })
  }
}
