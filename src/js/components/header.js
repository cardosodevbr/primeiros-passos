/* =========================================================
   HEADER COMPONENT JS
   ========================================================= */

import { $ } from '../core/dom.js';

export function initHeader() {
  const searchInput = $('#global-search-input');
  const notificationBtn = $('.header-user-controls .icon-button');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      // Sync global search with filter keyword input if present
      const filterKeywordInput = $('#filter-keyword');
      if (filterKeywordInput) {
        filterKeywordInput.value = e.target.value;
        // Trigger filter event
        filterKeywordInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }

  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      const dot = $('.notification-dot', notificationBtn);
      if (dot) {
        dot.style.display = 'none';
      }
    });
  }
}
