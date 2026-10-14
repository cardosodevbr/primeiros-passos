/* =========================================================
   SIDEBAR COMPONENT JS
   ========================================================= */

import { $, $$ } from '../core/dom.js'

export function initSidebar() {
  const toggleBtn = $('#btn-toggle-sidebar')
  const sidebar = $('#app-sidebar')
  const backdrop = $('#sidebar-backdrop')
  let lastFocusedElement = null

  if (!sidebar) return

  if (toggleBtn) {
    toggleBtn.setAttribute('aria-controls', sidebar.id || 'app-sidebar')
    toggleBtn.setAttribute('aria-expanded', 'false')
  }

  function getFocusableElements() {
    return $$(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
      sidebar,
    )
  }

  // Toggle mobile sidebar drawer
  function openSidebar() {
    lastFocusedElement =
      document.activeElement && document.activeElement !== document.body
        ? document.activeElement
        : toggleBtn
    sidebar.classList.add('active')
    if (backdrop) backdrop.classList.add('active')
    document.body.style.overflow = 'hidden'
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true')
    getFocusableElements()[0]?.focus()
  }

  function closeSidebar() {
    sidebar.classList.remove('active')
    if (backdrop) backdrop.classList.remove('active')
    document.body.style.overflow = ''
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false')
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus()
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (sidebar.classList.contains('active')) {
        closeSidebar()
      } else {
        openSidebar()
      }
    })
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeSidebar)
  }

  // Close sidebar on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeSidebar()
    }

    if (e.key === 'Tab' && sidebar.classList.contains('active')) {
      const focusable = getFocusableElements()
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  })
}
