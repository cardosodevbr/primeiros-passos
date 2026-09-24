// =========================================================
//  MAIN APPLICATION ENTRY POINT (Modular JS)
// =========================================================

import { initSidebar } from './components/sidebar.js';
import { initHeader } from './components/header.js';
import { initModal } from './components/modal.js';
import { initVagasPage } from './pages/vagas.js';

function init() {
  // Componentes globais
  initSidebar();
  initHeader();
  initModal();

  // Páginas específicas
  initVagasPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
