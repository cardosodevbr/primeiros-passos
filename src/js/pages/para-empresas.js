/* =========================================================
   PARA EMPRESAS
   =========================================================
   Responsabilidades:
   - Dropdown "⋮" de ações por card de vaga (abrir/fechar)
   - Toggle de status Ativa <-> Pausada
   - Botão "Publicar vaga nova" -> navega para criar-vaga.html
   ========================================================= */

import { $, $$ } from '../core/dom.js'

export function initParaEmpresasPage() {
  const vagasList = $('#empresa-vagas-list')
  if (!vagasList) return

  /* ---------------------------------------------------------
     1. ESTADO: mapeamento jobId -> status atual
     --------------------------------------------------------- */
  const jobCards = $$('.empresa-job-card', vagasList)
  if (!jobCards.length) return

  /* ---------------------------------------------------------
     2. DROPDOWN "⋮" — abrir / fechar
     --------------------------------------------------------- */

  /**
   * Fecha todos os dropdowns abertos e atualiza aria-expanded
   * nos botões trigger correspondentes.
   */
  function closeAllDropdowns() {
    $$('.empresa-actions-dropdown.is-open', vagasList).forEach((menu) => {
      menu.classList.remove('is-open')
      const trigger = menu.previousElementSibling
      if (trigger) trigger.setAttribute('aria-expanded', 'false')
    })
  }

  jobCards.forEach((card) => {
    const trigger = $('[data-actions-trigger]', card)
    const dropdown = $('[data-actions-dropdown]', card)

    if (!trigger || !dropdown) return

    /* Abre/fecha o dropdown ao clicar no botão "⋮" */
    trigger.addEventListener('click', (e) => {
      e.stopPropagation()

      const isOpen = dropdown.classList.contains('is-open')

      // Fecha todos antes de (talvez) abrir o atual
      closeAllDropdowns()

      if (!isOpen) {
        dropdown.classList.add('is-open')
        trigger.setAttribute('aria-expanded', 'true')
      }
    })

    /* Impede que cliques dentro do dropdown fechem o menu */
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation()
    })

    /* ---------------------------------------------------------
       3. TOGGLE DE STATUS (Ativar / Pausar)
       --------------------------------------------------------- */
    const toggleBtn = $('[data-action="toggle-status"]', dropdown)
    if (!toggleBtn) return

    toggleBtn.addEventListener('click', () => {
      const currentStatus = card.dataset.status // 'ativa' | 'pausada'
      const badge = $('[data-status-badge]', card)
      const toggleIcon = $('i', toggleBtn)
      const toggleLabel = $('[data-toggle-label]', toggleBtn)

      if (currentStatus === 'ativa') {
        /* ── Ativar -> Pausar ── */
        card.dataset.status = 'pausada'

        // Atualiza badge
        badge.classList.remove('badge-status-ativa')
        badge.classList.add('badge-status-pausada')
        badge.textContent = 'Pausada'

        // Atualiza opção no dropdown
        toggleIcon.className = 'ri-play-circle-line'
        toggleLabel.textContent = 'Ativar vaga'

        card.setAttribute(
          'aria-label',
          card.querySelector('.empresa-job-title').textContent.trim() + ' — Pausada',
        )
      } else {
        /* ── Pausada -> Ativar ── */
        card.dataset.status = 'ativa'

        // Atualiza badge
        badge.classList.remove('badge-status-pausada')
        badge.classList.add('badge-status-ativa')
        badge.textContent = 'Ativa'

        // Atualiza opção no dropdown
        toggleIcon.className = 'ri-pause-circle-line'
        toggleLabel.textContent = 'Pausar vaga'

        card.setAttribute(
          'aria-label',
          card.querySelector('.empresa-job-title').textContent.trim() + ' — Ativa',
        )
      }

      closeAllDropdowns()
    })
  })

  /* ---------------------------------------------------------
     4. Fecha dropdowns ao clicar fora deles
     --------------------------------------------------------- */
  document.addEventListener('click', () => {
    closeAllDropdowns()
  })

  /* Fecha também ao pressionar Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns()
  })

  /* ---------------------------------------------------------
     5. Botão "Publicar vaga nova" -> criar-vaga.html
        (O link já é um <a> no HTML; este trecho garante que
         o clique no botão-tab "Minhas vagas" não navegue,
         servindo apenas como indicador visual)
     --------------------------------------------------------- */
  const minhasVagasTab = $('#btn-minhas-vagas-tab')
  if (minhasVagasTab) {
    minhasVagasTab.addEventListener('click', () => {
      // Scroll suave até a seção de vagas
      vagasList.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}
