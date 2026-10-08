/* =========================================================
   HEADER COMPONENT JS
   ========================================================= */

import { $ } from '../core/dom.js';

export function initHeader() {
  const notificationBtn = $('.header-user-controls .icon-button');

  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      const dot = $('.notification-dot', notificationBtn);
      if (dot) {
        dot.style.display = 'none';
      }
    });
  }
}
