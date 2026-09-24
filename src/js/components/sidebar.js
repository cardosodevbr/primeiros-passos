/* =========================================================
   SIDEBAR COMPONENT JS
   ========================================================= */

import { $, $$ } from '../core/dom.js';

export function initSidebar() {
  const toggleBtn = $('#btn-toggle-sidebar');
  const sidebar = $('#app-sidebar');
  const backdrop = $('#sidebar-backdrop');

  if (!sidebar) return;

  // Toggle mobile sidebar drawer
  function openSidebar() {
    sidebar.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (sidebar.classList.contains('active')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeSidebar);
  }

  // Close sidebar on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });
}
