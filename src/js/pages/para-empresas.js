/* =========================================================
   PARA EMPRESAS
   =========================================================
   Responsabilidades:
   - Carrega vagas do repositório e renderiza os cards
   - Dropdown "⋮" de ações: editar, excluir, pausar/ativar
   - Toggle de status Ativa <-> Pausada (persiste no repositório)
   - Exclusão com modal de confirmação
   - Botão "Publicar vaga nova" -> navega para criar-vaga.html
   ========================================================= */

import { $, $$ } from '../core/dom.js'
import { listVagas, updateVaga, deleteVaga } from '../services/vagas-repository.js'

/* ---------------------------------------------------------
   Mapeamento área -> ícone RemixIcon
   --------------------------------------------------------- */
const AREA_ICON_MAP = {
  tecnologia: 'ri-code-s-slash-line',
  administrativo: 'ri-folder-line',
  marketing: 'ri-megaphone-line',
  atendimento: 'ri-headphone-line',
  operacional: 'ri-truck-line',
}

function getAreaIcon(area = '') {
  return AREA_ICON_MAP[area.toLowerCase()] || 'ri-briefcase-line'
}

function formatDate(isoString) {
  if (!isoString) return '—'
  try {
    return new Date(isoString).toLocaleDateString('pt-BR')
  } catch {
    return isoString
  }
}

/* ---------------------------------------------------------
   Renderiza um único card de vaga
   --------------------------------------------------------- */
function renderJobCard(vaga) {
  const isAtiva = (vaga.status || 'Ativa').toLowerCase() !== 'pausada'
  const statusLabel = isAtiva ? 'Ativa' : 'Pausada'
  const statusClass = isAtiva ? 'badge-status-ativa' : 'badge-status-pausada'
  const toggleIcon = isAtiva ? 'ri-pause-circle-line' : 'ri-play-circle-line'
  const toggleLabel = isAtiva ? 'Pausar vaga' : 'Ativar vaga'
  const iconClass = getAreaIcon(vaga.area)
  const candidaturas = vaga.candidaturas ?? 0
  const metaTags = [vaga.tipo, vaga.area]
    .filter(Boolean)
    .map((t) => `<span class="badge badge-tag">${t}</span>`)
    .join('')

  const article = document.createElement('article')
  article.className = 'empresa-job-card'
  article.dataset.jobId = vaga.id
  article.dataset.status = isAtiva ? 'ativa' : 'pausada'
  article.setAttribute('aria-label', `${vaga.titulo} — ${statusLabel}`)

  article.innerHTML = `
    <div class="empresa-job-card-main">
      <div class="empresa-job-icon-box" aria-hidden="true">
        <i class="${iconClass}"></i>
      </div>
      <div class="empresa-job-info">
        <div class="empresa-job-title-row">
          <span class="empresa-job-title">${vaga.titulo || '(sem título)'}</span>
          <span class="badge-status ${statusClass}" data-status-badge>${statusLabel}</span>
        </div>
        <span class="empresa-job-company">${vaga.empresa || ''}</span>
        <div class="empresa-job-meta-row">
          ${vaga.localizacao ? `<span>${vaga.localizacao}</span>` : ''}
          ${vaga.localizacao && metaTags ? '<span>•</span>' : ''}
          ${metaTags}
        </div>
      </div>
    </div>

    <div class="empresa-job-right">
      <div class="empresa-job-stats">
        <div class="empresa-stat-item">
          <i class="ri-group-line empresa-stat-icon" aria-hidden="true"></i>
          <span class="empresa-stat-value">${candidaturas}</span>
          <span class="empresa-stat-label">Candidaturas</span>
        </div>
        <div class="empresa-stat-divider" aria-hidden="true"></div>
        <div class="empresa-stat-item">
          <i class="ri-calendar-line empresa-stat-icon" aria-hidden="true"></i>
          <span class="empresa-stat-label">Publicado em</span>
          <span class="empresa-stat-value" style="font-size:var(--text-sm)">${formatDate(vaga.created_at)}</span>
        </div>
      </div>

      <div class="empresa-actions-wrapper">
        <button
          class="btn-card-actions"
          type="button"
          aria-label="Ações para ${vaga.titulo}"
          aria-haspopup="true"
          aria-expanded="false"
          data-actions-trigger
        >
          <i class="ri-more-2-fill"></i>
        </button>

        <div class="empresa-actions-dropdown" role="menu" data-actions-dropdown>
          <button type="button" class="dropdown-item action-toggle-status" role="menuitem" data-action="toggle-status">
            <i class="${toggleIcon}"></i>
            <span data-toggle-label>${toggleLabel}</span>
          </button>
          <div class="dropdown-divider" aria-hidden="true"></div>
          <a href="criar-vaga.html?id=${vaga.id}" class="dropdown-item action-edit" role="menuitem">
            <i class="ri-edit-line"></i>
            Editar vaga
          </a>
          <div class="dropdown-divider" aria-hidden="true"></div>
          <button type="button" class="dropdown-item action-delete" role="menuitem" data-action="delete">
            <i class="ri-delete-bin-line"></i>
            Excluir vaga
          </button>
        </div>
      </div>
    </div>
  `
  return article
}

export function initParaEmpresasPage() {
  const vagasList = $('#empresa-vagas-list')
  if (!vagasList) return

  /* ---------------------------------------------------------
     Modal de confirmação de exclusão
     --------------------------------------------------------- */
  let pendingDeleteId = null
  let pendingDeleteCard = null

  const modal = $('#modal-excluir-vaga')
  const modalTitle = $('#modal-excluir-titulo')
  const btnConfirmDelete = $('#btn-confirmar-excluir')
  const btnCancelDelete = $('#btn-cancelar-excluir')
  const btnCloseModal = $('#modal-excluir-fechar')

  function openDeleteModal(vaga, card) {
    if (!modal) return
    pendingDeleteId = vaga.id
    pendingDeleteCard = card
    if (modalTitle) modalTitle.textContent = vaga.titulo || 'esta vaga'
    modal.hidden = false
    requestAnimationFrame(() => modal.classList.add('active'))
    if (btnConfirmDelete) btnConfirmDelete.focus()
  }

  function closeDeleteModal() {
    if (!modal) return
    modal.classList.remove('active')
    setTimeout(() => { modal.hidden = true }, 220)
    pendingDeleteId = null
    pendingDeleteCard = null
  }

  if (btnCancelDelete) btnCancelDelete.addEventListener('click', closeDeleteModal)
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeDeleteModal)
  if (modal) {
    modal.addEventListener('click', (e) => { if (e.target === modal) closeDeleteModal() })
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) closeDeleteModal()
  })

  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', async () => {
      if (!pendingDeleteId || !pendingDeleteCard) return
      btnConfirmDelete.disabled = true
      try {
        await deleteVaga(pendingDeleteId)
        pendingDeleteCard.remove()
        updateVagasCount()
        closeDeleteModal()
      } catch (err) {
        console.error('Erro ao excluir vaga:', err)
        alert('Não foi possível excluir a vaga. Tente novamente.')
      } finally {
        btnConfirmDelete.disabled = false
      }
    })
  }

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */
  function closeAllDropdowns() {
    $$('.empresa-actions-dropdown.is-open', vagasList).forEach((menu) => {
      menu.classList.remove('is-open')
      const trigger = menu.previousElementSibling
      if (trigger) trigger.setAttribute('aria-expanded', 'false')
    })
  }

  function updateVagasCount() {
    const countEl = $('#vagas-count')
    if (!countEl) return
    const total = vagasList.querySelectorAll('.empresa-job-card').length
    countEl.textContent = `(${total})`
  }

  function attachCardListeners(card, vagaData) {
    const trigger = $('[data-actions-trigger]', card)
    const dropdown = $('[data-actions-dropdown]', card)
    if (!trigger || !dropdown) return

    /* Abre/fecha dropdown */
    trigger.addEventListener('click', (e) => {
      e.stopPropagation()
      const isOpen = dropdown.classList.contains('is-open')
      closeAllDropdowns()
      if (!isOpen) {
        dropdown.classList.add('is-open')
        trigger.setAttribute('aria-expanded', 'true')
      }
    })

    /* Event delegation no dropdown — captura cliques em qualquer item */
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation()

      const btn = e.target.closest('[data-action]')
      if (!btn) return

      const action = btn.dataset.action

      if (action === 'toggle-status') {
        const currentStatus = card.dataset.status   // 'ativa' | 'pausada'
        const isAtiva = currentStatus === 'ativa'
        const newStatus = isAtiva ? 'Pausada' : 'Ativa'
        const newDataset = isAtiva ? 'pausada' : 'ativa'

        const badge = $('[data-status-badge]', card)
        const toggleIcon = btn.querySelector('i')
        const toggleLabel = $('[data-toggle-label]', btn)
        const jobTitle = card.querySelector('.empresa-job-title')?.textContent.trim() || ''

        card.dataset.status = newDataset

        if (badge) {
          badge.className = `badge-status ${isAtiva ? 'badge-status-pausada' : 'badge-status-ativa'}`
          badge.textContent = newStatus
        }

        if (toggleIcon) toggleIcon.className = isAtiva ? 'ri-play-circle-line' : 'ri-pause-circle-line'
        if (toggleLabel) toggleLabel.textContent = isAtiva ? 'Ativar vaga' : 'Pausar vaga'
        card.setAttribute('aria-label', `${jobTitle} — ${newStatus}`)

        closeAllDropdowns()

        updateVaga(vagaData.id, { status: newStatus }).catch((err) => {
          console.error('Erro ao atualizar status:', err)
        })
      }

      if (action === 'delete') {
        closeAllDropdowns()
        openDeleteModal(vagaData, card)
      }
    })
  }

  /* ---------------------------------------------------------
     Carrega e renderiza vagas do repositório
     --------------------------------------------------------- */
  async function loadVagas() {
    vagasList.innerHTML = `
      <div class="empresa-vagas-loading" aria-live="polite">
        <i class="ri-loader-4-line ri-spin" aria-hidden="true"></i>
        <span>Carregando vagas...</span>
      </div>
    `
    try {
      const vagas = await listVagas()

      vagasList.innerHTML = ''

      if (!vagas.length) {
        vagasList.innerHTML = `
          <div class="empresa-vagas-empty">
            <i class="ri-inbox-line" aria-hidden="true"></i>
            <p>Nenhuma vaga publicada ainda.</p>
            <a href="criar-vaga.html" class="btn-publicar-nova" style="margin-top:var(--space-4)">
              <i class="ri-add-line"></i> Publicar primeira vaga
            </a>
          </div>
        `
        updateVagasCount()
        return
      }

      vagas.forEach((vaga) => {
        const card = renderJobCard(vaga)
        vagasList.appendChild(card)
        attachCardListeners(card, vaga)
      })

      updateVagasCount()
    } catch (err) {
      console.error('Erro ao carregar vagas:', err)
      vagasList.innerHTML = `
        <div class="empresa-vagas-empty">
          <i class="ri-error-warning-line" aria-hidden="true"></i>
          <p>Não foi possível carregar as vagas.</p>
        </div>
      `
    }
  }

  /* ---------------------------------------------------------
     Fecha dropdowns ao clicar fora
     --------------------------------------------------------- */
  document.addEventListener('click', () => closeAllDropdowns())
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns()
  })

  /* ---------------------------------------------------------
     Botão "Minhas vagas" — scroll suave
     --------------------------------------------------------- */
  const minhasVagasTab = $('#btn-minhas-vagas-tab')
  if (minhasVagasTab) {
    minhasVagasTab.addEventListener('click', () => {
      vagasList.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  /* ---------------------------------------------------------
     Inicia carregamento
     --------------------------------------------------------- */
  loadVagas()
}
