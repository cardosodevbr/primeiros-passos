/* =========================================================
   CRIAR VAGA
   =========================================================
   Responsabilidades:
   - Preview ao vivo do card de vaga enquanto o usuário preenche
   - Ícone do preview muda conforme a área selecionada
   - Validação dos campos obrigatórios antes do submit
   - Redireciona para para-empresas.html após publicação válida
   ========================================================= */

import { $ } from '../core/dom.js'

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

export function initCriarVagaPage() {
  const form = $('#criar-vaga-form')
  if (!form) return

  /* ---------------------------------------------------------
     1. REFERÊNCIAS AOS CAMPOS DO FORMULÁRIO
     --------------------------------------------------------- */
  const tituloInput = $('#vaga-titulo', form)
  const empresaInput = $('#vaga-empresa', form)
  const localizacaoInput = $('#vaga-localizacao', form)
  const tipoSelect = $('#vaga-tipo', form)
  const areaSelect = $('#vaga-area', form)
  const modalidadeSelect = $('#vaga-modalidade', form)

  /* ---------------------------------------------------------
     2. REFERÊNCIAS AOS ELEMENTOS DO PREVIEW
     --------------------------------------------------------- */
  const previewTitulo = $('#preview-titulo')
  const previewEmpresa = $('#preview-empresa')
  const previewMeta = $('#preview-meta')
  const previewIcon = $('#preview-icon')

  if (!previewTitulo || !previewEmpresa || !previewMeta || !previewIcon) return

  /* ---------------------------------------------------------
     3. FUNÇÕES DE ATUALIZAÇÃO DO PREVIEW
     --------------------------------------------------------- */

  /** Substitui o conteúdo do nó por texto ou pelo shimmer placeholder */
  function setPreviewText(el, text, placeholderClass = 'medium') {
    if (text && text.trim()) {
      el.textContent = text.trim()
    } else {
      el.innerHTML = `<span class="preview-placeholder ${placeholderClass}"></span>`
    }
  }

  /** Recria os badges de meta (localização, modalidade, tipo, área) */
  function updatePreviewMeta() {
    const loc = localizacaoInput?.value.trim() || ''
    const modalidade = modalidadeSelect?.value || ''
    const tipo = tipoSelect?.value || ''
    const area = areaSelect?.value || ''

    const hasAnyMeta = loc || modalidade || tipo || area

    if (!hasAnyMeta) {
      previewMeta.innerHTML = `
        <span class="preview-placeholder short" style="height:20px;border-radius:var(--radius-full);width:80px;"></span>
        <span class="preview-placeholder short" style="height:20px;border-radius:var(--radius-full);width:72px;"></span>
      `
      return
    }

    let html = ''

    if (loc) {
      html += `<span>${loc}</span>`
    }
    if (loc && (modalidade || tipo || area)) {
      html += `<span>•</span>`
    }
    if (modalidade) {
      html += `<span>${modalidade}</span>`
    }
    if (tipo) {
      html += `<span class="badge badge-tag">${tipo}</span>`
    }
    if (area) {
      html += `<span class="badge badge-tag-alt">${area}</span>`
    }

    previewMeta.innerHTML = html
  }

  /** Atualiza o ícone com base na área selecionada */
  function updatePreviewIcon() {
    const areaVal = areaSelect?.value?.toLowerCase() || ''
    const iconClass = AREA_ICON_MAP[areaVal] || 'ri-briefcase-line'
    previewIcon.className = iconClass
  }

  /** Executa todas as atualizações do preview de uma vez */
  function refreshPreview() {
    setPreviewText(previewTitulo, tituloInput?.value, 'medium')
    setPreviewText(previewEmpresa, empresaInput?.value, 'short')
    updatePreviewMeta()
    updatePreviewIcon()
  }

  /* ---------------------------------------------------------
     4. LISTENERS PARA ATUALIZAÇÃO DO PREVIEW EM TEMPO REAL
     --------------------------------------------------------- */
  const liveFields = [
    tituloInput,
    empresaInput,
    localizacaoInput,
    tipoSelect,
    areaSelect,
    modalidadeSelect,
  ]

  liveFields.forEach((field) => {
    if (!field) return
    const event = field.tagName === 'SELECT' ? 'change' : 'input'
    field.addEventListener(event, refreshPreview)
  })

  // Inicializa o preview com os valores já presentes (ex: empresa pré-preenchida)
  refreshPreview()

  /* ---------------------------------------------------------
     5. VALIDAÇÃO E SUBMIT
     --------------------------------------------------------- */

  /** Campos obrigatórios: [inputEl, errorMsgEl] */
  const requiredFields = [
    { input: tituloInput, error: $('#vaga-titulo-error') },
    { input: empresaInput, error: $('#vaga-empresa-error') },
    { input: tipoSelect, error: $('#vaga-tipo-error') },
    { input: areaSelect, error: $('#vaga-area-error') },
  ]

  /** Mostra ou esconde a mensagem de erro de um campo */
  function setFieldError(inputEl, errorEl, hasError) {
    if (!inputEl || !errorEl) return

    if (hasError) {
      inputEl.classList.add('input-error')
      errorEl.classList.add('is-visible')
      inputEl.setAttribute('aria-invalid', 'true')
    } else {
      inputEl.classList.remove('input-error')
      errorEl.classList.remove('is-visible')
      inputEl.removeAttribute('aria-invalid')
    }
  }

  /** Limpa o erro ao usuário começar a corrigir o campo */
  requiredFields.forEach(({ input, error }) => {
    if (!input) return
    const event = input.tagName === 'SELECT' ? 'change' : 'input'
    input.addEventListener(event, () => {
      if (input.value.trim()) {
        setFieldError(input, error, false)
      }
    })
  })

  /** Valida todos os campos obrigatórios; retorna true se tudo OK */
  function validateForm() {
    let isValid = true

    requiredFields.forEach(({ input, error }) => {
      const isEmpty = !input?.value?.trim()
      if (isEmpty) {
        setFieldError(input, error, true)
        isValid = false
      } else {
        setFieldError(input, error, false)
      }
    })

    return isValid
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    if (!validateForm()) {
      // Rola até o primeiro campo com erro
      const firstError = form.querySelector('.input-error')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
        firstError.focus()
      }
      return
    }

    // Submissão válida -> navega de volta ao dashboard da empresa
    window.location.href = 'para-empresas.html'
  })
}
