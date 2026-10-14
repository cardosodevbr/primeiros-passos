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
import { initHomePage } from './pages/home.js'
import { initAccountsPage } from './pages/accounts.js'
import { initDetalhesVagaPage } from './pages/detalhes-vaga.js'
import { initAccessibility } from './core/accessibility.js'
import { initPageTransitions } from './core/page-transitions.js'

function init() {
  initAccessibility()
  initPageTransitions()
  // Componentes globais (presentes em todas as páginas do app-shell)
  initSidebar()
  initHeader()
  initModal()
  initModalCandidatura()

  // Páginas específicas — cada função faz guard no elemento root da página
  initHomePage()
  initVagasPage()
  initCurriculoPage()
  initParaEmpresasPage()
  initCriarVagaPage()
  initCandidaturasPage()
  initDicasPage()
  initAccountsPage()
  initDetalhesVagaPage()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
