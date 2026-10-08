;(() => {
  if (window.VLibras || document.querySelector('[data-vlibras-loader]')) return

  const widget = document.createElement('div')
  widget.innerHTML = `
    <div vw class="enabled">
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    </div>
  `
  document.body.appendChild(widget.firstElementChild)

  const script = document.createElement('script')
  script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
  script.async = true
  script.dataset.vlibrasLoader = 'true'
  script.onload = () => {
    if (window.VLibras) {
      new window.VLibras.Widget('https://vlibras.gov.br/app')
    }
  }
  document.head.appendChild(script)
})()
