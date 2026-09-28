/* =========================================================
   VAGAS 
   ========================================================= */

import { $, $$ } from '../core/dom.js';
import { normalizeString, debounce } from '../core/utils.js';

export function initVagasPage() {
  const jobContainer = $('#job-cards-container');
  if (!jobContainer) return;

  const cards = $$('.job-card', jobContainer);
  const categoryPills = $$('.category-pill');

  // Inputs do formulário de filtro
  const keywordInput = $('#filter-keyword');
  const globalSearchInput = $('#global-search-input');
  const areaSelect = $('#filter-area');
  const typeSelect = $('#filter-type');
  const locationInput = $('#filter-location');
  const clearFiltersBtn = $('#btn-clear-filters');
  const filterForm = $('#vagas-filter-form');

  // Estado atual dos filtros
  const state = {
    activeCategory: 'todas',
    keyword: '',
    area: '',
    type: '',
    modalities: [],
    location: ''
  };

  // Check for search parameter in URL and apply it
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  if (searchParam && keywordInput) {
    keywordInput.value = searchParam;
    state.keyword = searchParam;
    if (globalSearchInput) {
      globalSearchInput.value = searchParam;
    }
    applyFilters();
  }

  // Global search input sync with keyword input
  if (globalSearchInput) {
    const handleGlobalSearch = debounce((searchTerm) => {
      if (keywordInput) {
        keywordInput.value = searchTerm;
        state.keyword = searchTerm;
        applyFilters();
      }
    }, 300);

    globalSearchInput.addEventListener('input', (e) => {
      handleGlobalSearch(e.target.value);
    });

    // Sync keyword input back to global search input
    if (keywordInput) {
      keywordInput.addEventListener('input', (e) => {
        globalSearchInput.value = e.target.value;
      });
    }

    // Trigger search on Enter key
    globalSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const searchTerm = globalSearchInput.value.trim();
        if (keywordInput) {
          keywordInput.value = searchTerm;
          state.keyword = searchTerm;
          applyFilters();
        }
      }
    });
  }

  /* ---------------------------------------------------------
     1. BOOKMARK TOGGLE (Salvar Vaga)
     --------------------------------------------------------- */
  cards.forEach(card => {
    const bookmarkBtn = $('.bookmark-btn', card);
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        bookmarkBtn.classList.toggle('saved');

        const isSaved = bookmarkBtn.classList.contains('saved');
        const iconItem = $('i', bookmarkBtn);
        if (iconItem) {
          iconItem.className = isSaved ? 'ri-bookmark-fill' : 'ri-bookmark-line';
        }
      });
    }
  });

  /* ---------------------------------------------------------
     2. LÓGICA DE FILTRAGEM DINÂMICA
     --------------------------------------------------------- */
  function applyFilters() {
    let visibleCount = 0;

    cards.forEach(card => {
      const cardCategory = card.dataset.category ? card.dataset.category.toLowerCase() : '';
      const cardType = card.dataset.type ? card.dataset.type.toLowerCase() : '';
      const cardModality = card.dataset.modality ? card.dataset.modality : '';
      const cardLocation = card.dataset.location ? card.dataset.location : '';

      const cardTitle = $('.job-title', card)?.textContent || '';
      const cardCompany = $('.job-company', card)?.textContent || '';
      const fullSearchableText = `${cardTitle} ${cardCompany} ${cardCategory} ${cardType}`;

      // Condição 1: Pill de Categoria Superior
      const matchesCategory = state.activeCategory === 'todas' || cardCategory === state.activeCategory;

      // Condição 2: Palavra-chave
      const normKeyword = normalizeString(state.keyword);
      const matchesKeyword = !normKeyword || normalizeString(fullSearchableText).includes(normKeyword);

      // Condição 3: Área (Dropdown)
      const matchesArea = !state.area || cardCategory === normalizeString(state.area);

      // Condição 4: Tipo de vaga (Dropdown)
      const matchesType = !state.type || cardType === normalizeString(state.type);

      // Condição 5: Modalidade (Checkboxes)
      const matchesModality = state.modalities.length === 0 || state.modalities.includes(cardModality);

      // Condição 6: Localização
      const normLocation = normalizeString(state.location);
      const matchesLocation = !normLocation || normalizeString(cardLocation).includes(normLocation);

      // Decisão final de visibilidade
      const isVisible = matchesCategory && matchesKeyword && matchesArea && matchesType && matchesModality && matchesLocation;

      if (isVisible) {
        card.style.display = 'flex';
        card.classList.remove('filtering-out');
        card.classList.add('filtering-in');
        visibleCount++;
      } else {
        card.style.display = 'none';
        card.classList.remove('filtering-in');
      }
    });

    // Renderiza Empty State se nenhuma vaga corresponder aos filtros
    renderEmptyState(visibleCount);
  }

  function renderEmptyState(count) {
    let emptyBox = $('#no-results-message', jobContainer.parentElement);
    if (count === 0) {
      if (!emptyBox) {
        emptyBox = document.createElement('div');
        emptyBox.id = 'no-results-message';
        emptyBox.className = 'no-results-box';
        emptyBox.innerHTML = `
          <div class="no-results-icon"><i class="ri-search-line"></i></div>
          <h3>Nenhuma vaga encontrada</h3>
          <p>Tente ajustar ou limpar seus filtros para ver mais oportunidades disponíveis.</p>
        `;
        jobContainer.parentElement.appendChild(emptyBox);
      }
      emptyBox.style.display = 'flex';
    } else if (emptyBox) {
      emptyBox.style.display = 'none';
    }
  }

  /* ---------------------------------------------------------
     3. EVENT LISTENERS
     --------------------------------------------------------- */

  // Categorias (Pills Superiores)
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeCategory = pill.dataset.category || 'todas';
      applyFilters();
    });
  });

  // Keyword input handling (for sidebar filter)
  if (keywordInput) {
    keywordInput.addEventListener('input', (e) => {
      state.keyword = e.target.value;
      applyFilters();
    });
  }

  // Área Dropdown
  if (areaSelect) {
    areaSelect.addEventListener('change', (e) => {
      state.area = e.target.value;
      applyFilters();
    });
  }

  // Tipo de vaga Dropdown
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      state.type = e.target.value;
      applyFilters();
    });
  }

  // Localização Input
  if (locationInput) {
    locationInput.addEventListener('input', debounce((e) => {
      state.location = e.target.value;
      applyFilters();
    }, 200));
  }

  // Modalidade Checkboxes
  const modalityCheckboxes = $$('input[name="modality"]', filterForm);
  modalityCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      state.modalities = modalityCheckboxes.filter(c => c.checked).map(c => c.value);
      applyFilters();
    });
  });

  // Botão "Aplicar filtros"
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      applyFilters();
    });
  }

  // Botão "Limpar filtros"
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      if (keywordInput) keywordInput.value = '';
      if (globalSearchInput) globalSearchInput.value = '';
      if (areaSelect) areaSelect.value = '';
      if (typeSelect) typeSelect.value = '';
      if (locationInput) locationInput.value = '';
      modalityCheckboxes.forEach(cb => cb.checked = false);

      state.activeCategory = 'todas';
      state.keyword = '';
      state.area = '';
      state.type = '';
      state.modalities = [];
      state.location = '';

      // Clear URL search parameter
      const url = new URL(window.location);
      url.searchParams.delete('search');
      window.history.replaceState({}, '', url);

      categoryPills.forEach(p => p.classList.remove('active'));
      const defaultPill = $('.category-pill[data-category="todas"]');
      if (defaultPill) defaultPill.classList.add('active');

      applyFilters();
    });
  }
}
