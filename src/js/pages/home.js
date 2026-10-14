/* =========================================================
   HOME PAGE
   ========================================================= */

import { $, $$ } from '../core/dom.js'
import { initGlobalSearch, redirectWithSearch } from '../services/search-service.js'

export function initHomePage() {
  initGlobalSearch()

  // Search functionality for the home page hero search
  const searchForm = $('#job-search-form')
  const searchInput = $('#job-search')
  const searchTags = $$('.search-tag')

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const searchTerm = searchInput.value.trim()
      if (searchTerm) {
        redirectWithSearch(searchTerm)
      }
    })
  }

  // Search tags functionality
  searchTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      const searchTerm = tag.dataset.search
      if (searchTerm) {
        redirectWithSearch(searchTerm)
      }
    })
  })
}
