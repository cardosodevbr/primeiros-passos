/* =========================================================
   DICAS PAGE JS (filtro por categoria)
   ========================================================= */

import { $, $$ } from '../core/dom.js'

export function initDicasPage() {
  const container = $('#dicas-container')
  if (!container) return

  const cards = $$('.dica-card', container)
  const pills = $$('.dicas-pill')

  let activeCategory = 'todas'

  function applyFilter() {
    cards.forEach((card) => {
      const cat = card.dataset.category || ''
      const show = activeCategory === 'todas' || cat === activeCategory
      card.style.display = show ? 'flex' : 'none'
    })
  }

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('active'))
      pill.classList.add('active')
      activeCategory = pill.dataset.category || 'todas'
      applyFilter()
    })
  })

  applyFilter()
}