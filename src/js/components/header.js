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

  document.querySelectorAll('.user-profile-menu').forEach((profileMenu) => {
    const account = getCurrentAccount()
    const name =
      account?.name || profileMenu.querySelector('.user-name')?.textContent || 'Ana Silva'
    const avatar = profileMenu.querySelector('.user-avatar')
    const nameElement = profileMenu.querySelector('.user-name')
    if (avatar) avatar.textContent = name.charAt(0).toUpperCase()
    if (nameElement) nameElement.textContent = name

    profileMenu.setAttribute('role', 'button')
    profileMenu.setAttribute('tabindex', '0')
    profileMenu.setAttribute('aria-label', `Abrir menu da conta de ${name}`)
    const pagesBase = window.location.pathname.includes('/src/pages/') ? '' : 'src/pages/'
    const profilePath = account?.type === 'empresa' ? 'para-empresas.html' : 'curriculo.html'

    const menu = document.createElement('div')
    menu.className = 'account-menu'
    menu.hidden = true
    menu.innerHTML = `
      <a href="${pagesBase}${profilePath}" class="account-menu-item">${account?.type === 'empresa' ? 'Painel da empresa' : 'Meu perfil'}</a>
      <button type="button" class="account-menu-item account-menu-logout">Sair</button>
    `
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
    menu.querySelector('.account-menu-logout')?.addEventListener('click', () => {
      logoutAccount()
      window.location.href = `${pagesBase}login.html`
    })
  })
}
