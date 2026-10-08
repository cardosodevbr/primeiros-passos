/* =========================================================
   HOME PAGE
   ========================================================= */

import { $, $$ } from '../core/dom.js'
import { initSidebar } from '../components/sidebar.js'
import { normalizeString, debounce } from '../core/utils.js'
import { initAccessibility } from '../core/accessibility.js'

export function initHomePage() {
  initAccessibility()
  // Initialize sidebar functionality
  initSidebar()

  // Global search functionality (works across all pages)
  const globalSearchInput = $('#global-search-input')

  if (globalSearchInput) {
    const handleGlobalSearch = debounce((searchTerm) => {
      if (searchTerm.trim()) {
        // If not on vagas page, redirect to vagas page with search term
        if (!window.location.pathname.includes('vagas.html')) {
          window.location.href = `src/pages/vagas.html?search=${encodeURIComponent(searchTerm)}`
        } else {
          // If already on vagas page, trigger the existing search functionality
          const keywordInput = $('#filter-keyword')
          if (keywordInput) {
            keywordInput.value = searchTerm
            keywordInput.dispatchEvent(new Event('input'))
          }
        }
      }
    }, 500)

    globalSearchInput.addEventListener('input', (e) => {
      handleGlobalSearch(e.target.value)
    })

    // Also trigger search on Enter key
    globalSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        const searchTerm = globalSearchInput.value.trim()
        if (searchTerm) {
          if (!window.location.pathname.includes('vagas.html')) {
            window.location.href = `src/pages/vagas.html?search=${encodeURIComponent(searchTerm)}`
          } else {
            const keywordInput = $('#filter-keyword')
            if (keywordInput) {
              keywordInput.value = searchTerm
              keywordInput.dispatchEvent(new Event('input'))
            }
          }
        }
      }
    })
  }

  // Check for search parameter in URL
  const urlParams = new URLSearchParams(window.location.search)
  const searchParam = urlParams.get('search')
  if (searchParam && globalSearchInput) {
    globalSearchInput.value = searchParam
  }

  // Search functionality for the home page hero search
  const searchForm = $('#job-search-form')
  const searchInput = $('#job-search')
  const searchTags = $$('.search-tag')

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const searchTerm = searchInput.value.trim()
      if (searchTerm) {
        // Redirect to vagas page with search term
        window.location.href = `src/pages/vagas.html?search=${encodeURIComponent(searchTerm)}`
      }
    })
  }

  // Search tags functionality
  searchTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      const searchTerm = tag.dataset.search
      if (searchTerm) {
        window.location.href = `src/pages/vagas.html?search=${encodeURIComponent(searchTerm)}`
      }
    })
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomePage)
} else {
  initHomePage()
}
