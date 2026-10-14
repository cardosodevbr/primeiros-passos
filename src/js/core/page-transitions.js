function isInternalNavigation(link) {
  if (!link.href || link.target === '_blank' || link.hasAttribute('download')) return false
  if (link.dataset.noTransition !== undefined) return false

  const target = new URL(link.href, window.location.href)
  const current = new URL(window.location.href)
  return (
    target.protocol === current.protocol &&
    target.host === current.host &&
    target.pathname !== current.pathname
  )
}

export function initPageTransitions() {
  document.body.classList.add('page-transition-enter')
  window.requestAnimationFrame(() => document.body.classList.remove('page-transition-enter'))

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a')
    if (!link || event.defaultPrevented || !isInternalNavigation(link)) return

    document.body.classList.add('page-transition-leave')
  })

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-transition-leave')
  })
}
