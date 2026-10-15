/* =========================================================
   HEADER COMPONENT JS
   ========================================================= */

import { $ } from '../core/dom.js'
import { getCurrentAccount, logoutAccount } from '../services/account-service.js'

export function initHeader() {
  const notificationBtn = $('.header-user-controls .icon-button')

  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      const dot = $('.notification-dot', notificationBtn)
      if (dot) {
        dot.style.display = 'none'
      }
    })
  }

  const account = getCurrentAccount()
  const headerActions = document.querySelector('.header-actions')

  if (headerActions && account) {
    const avatarLetter = (account.name || 'U').charAt(0).toUpperCase()
    headerActions.innerHTML = `
      <div class="user-profile-menu" role="button" tabindex="0" aria-label="Abrir menu da conta de ${account.name}">
        <div class="user-avatar">${avatarLetter}</div>
        <span class="user-name">${account.name}</span>
        <i class="ri-arrow-down-s-line user-chevron"></i>
      </div>
    `
  }

  document.querySelectorAll('.user-profile-menu').forEach((profileMenu) => {
    if (profileMenu.dataset.menuAttached) return
    profileMenu.dataset.menuAttached = 'true'

    const pagesBase = window.location.pathname.includes('/src/pages/') ? '' : 'src/pages/'
    const avatar = profileMenu.querySelector('.user-avatar')
    const nameElement = profileMenu.querySelector('.user-name')

    profileMenu.setAttribute('role', 'button')
    profileMenu.setAttribute('tabindex', '0')

    const menu = document.createElement('div')
    menu.className = 'account-menu'
    menu.hidden = true

    if (account) {
      const name = account.name || 'Usuário'
      if (avatar) avatar.textContent = name.charAt(0).toUpperCase()
      if (nameElement) nameElement.textContent = name
      profileMenu.setAttribute('aria-label', `Abrir menu da conta de ${name}`)

      const profilePath = account.type === 'empresa' ? 'para-empresas.html' : 'curriculo.html'
      menu.innerHTML = `
        <a href="${pagesBase}${profilePath}" class="account-menu-item">${account.type === 'empresa' ? 'Painel da empresa' : 'Meu perfil'}</a>
        <button type="button" class="account-menu-item account-menu-logout">Sair</button>
      `
    } else {
      if (avatar) avatar.innerHTML = '<i class="ri-user-line"></i>'
      if (nameElement) nameElement.textContent = 'Entrar'
      profileMenu.setAttribute('aria-label', 'Entrar ou criar conta')

      menu.innerHTML = `
        <a href="${pagesBase}login.html" class="account-menu-item">Entrar como Candidato</a>
        <a href="${pagesBase}login-empresa.html" class="account-menu-item">Entrar como Empresa</a>
        <a href="${pagesBase}cadastro.html" class="account-menu-item">Criar conta</a>
      `
    }

    profileMenu.appendChild(menu)

    const toggleMenu = () => {
      menu.hidden = !menu.hidden
      profileMenu.setAttribute('aria-expanded', String(!menu.hidden))
    }
    profileMenu.addEventListener('click', (event) => {
      if (event.target.closest('.account-menu')) return
      toggleMenu()
    })
    profileMenu.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        toggleMenu()
      }
      if (event.key === 'Escape' && !menu.hidden) {
        menu.hidden = true
        profileMenu.setAttribute('aria-expanded', 'false')
      }
    })
    menu.querySelector('.account-menu-logout')?.addEventListener('click', async () => {
      await logoutAccount()
      window.location.href = `${pagesBase}login.html`
    })
  })
}
