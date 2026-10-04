// =========================================================
//  MAIN APPLICATION ENTRY POINT (Modular JS)
// =========================================================

import { initSidebar } from './components/sidebar.js'
import { initHeader } from './components/header.js'
import { initModal } from './components/modal.js'
import { initVagasPage } from './pages/vagas.js'
import { initCurriculoPage } from './pages/curriculo.js'
import { initModalCandidatura } from './components/modal-candidatura.js'
import { initParaEmpresasPage } from './pages/para-empresas.js'
import { initCriarVagaPage } from './pages/criar-vaga.js'
import { initCandidaturasPage } from './pages/candidaturas.js'
import { initDicasPage } from './pages/dicas.js'

function init() {
  // Componentes globais (presentes em todas as páginas do app-shell)
  initSidebar()
  initHeader()
  initModal()
  initModalCandidatura()

  // Páginas específicas — cada função faz guard no elemento root da página
  initVagasPage()
  initCurriculoPage()
  initParaEmpresasPage()
  initCriarVagaPage()
  initCandidaturasPage()
  initDicasPage()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

// Landing-page only: busca + tags clicáveis
// Guard prevents null errors on inner app-shell pages
document.addEventListener('DOMContentLoaded', () => {
  const buscarBtn = document.querySelector('.buscar')
  const input = document.querySelector('.search-bar input')

  if (buscarBtn && input) {
    buscarBtn.addEventListener('click', () => {
      const termo = input.value.trim()
      if (termo) {
        window.location.href = `pages/vagas.html?search=${encodeURIComponent(termo)}`
      }
    })
  }

  // Tags clicáveis
  document.querySelectorAll('.tags span').forEach((tag) => {
    tag.addEventListener('click', () => {
      const termo = tag.textContent
      window.location.href = `pages/vagas.html?search=${encodeURIComponent(termo)}`
    })
  })
})