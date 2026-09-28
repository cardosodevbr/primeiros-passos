// =========================================================
//  MAIN APPLICATION ENTRY POINT (Modular JS)
// =========================================================

import { initSidebar } from './components/sidebar.js'
import { initHeader } from './components/header.js'
import { initModal } from './components/modal.js'
import { initVagasPage } from './pages/vagas.js'
import { initCurriculoPage } from './pages/curriculo.js'
import { initModalCandidatura } from './components/modal-candidatura.js'

function init() {
  // Componentes globais
  initSidebar()
  initHeader()
  initModal()
  initModalCandidatura()

  // Páginas específicas
  initVagasPage()
  initCurriculoPage()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

document.addEventListener('DOMContentLoaded', () => {
  const buscarBtn = document.querySelector('.buscar')
  const input = document.querySelector('.search-bar input')

  buscarBtn.addEventListener('click', () => {
    const termo = input.value.trim()
    if (termo) {
      window.location.href = `pages/vagas.html?search=${encodeURIComponent(termo)}`
    }
  })

  // Tags clicáveis
  document.querySelectorAll('.tags span').forEach((tag) => {
    tag.addEventListener('click', () => {
      const termo = tag.textContent
      window.location.href = `pages/vagas.html?search=${encodeURIComponent(termo)}`
    })
  })
})
