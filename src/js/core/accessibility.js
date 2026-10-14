export function initAccessibility() {
  const main = document.querySelector('main')
  if (!main) return

  if (!main.id) main.id = 'main-content'
  main.tabIndex = -1

  if (!document.querySelector('.skip-link')) {
    const skipLink = document.createElement('a')
    skipLink.className = 'skip-link'
    skipLink.href = `#${main.id}`
    skipLink.textContent = 'Pular para o conteúdo principal'
    document.body.prepend(skipLink)
  }
}
