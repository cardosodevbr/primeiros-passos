//  NÃO importar core diretamente
import { initHeader } from './components/header.js'
import { initModal } from './components/modal.js'

import { initHome } from './pages/home.js'

function init() {
  initHeader()
  initModal()

  initHome()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
