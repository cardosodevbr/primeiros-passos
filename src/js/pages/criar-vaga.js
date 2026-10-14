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
import { createVaga, getVaga, updateVaga } from '../services/vagas-repository.js'

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
  const cargaSelect = $('#vaga-carga', form)
  const descricaoInput = $('#vaga-descricao', form)
  const requisitosInput = $('#vaga-requisitos', form)
  const editId = new URLSearchParams(window.location.search).get('id')
  const submitButton = $('#btn-publicar-vaga', form)

  /* ---------------------------------------------------------
     2. REFERÊNCIAS AOS ELEMENTOS DO PREVIEW
     --------------------------------------------------------- */
  const previewTitulo = $('#preview-titulo')
  const previewEmpresa = $('#preview-empresa')
  const previewMeta = $('#preview-meta')
  const previewIcon = $('#preview-icon')

  if (!previewTitulo || !previewEmpresa || !previewMeta || !previewIcon) return

  async function loadEditVaga() {
    if (!editId) return
    const vaga = await getVaga(editId)
    if (!vaga) return

    const values = {
      '#vaga-titulo': vaga.titulo,
      '#vaga-empresa': vaga.empresa,
      '#vaga-localizacao': vaga.localizacao,
      '#vaga-tipo': vaga.tipo,
      '#vaga-area': vaga.area,
      '#vaga-modalidade': vaga.modalidade,
      '#vaga-carga': vaga.carga,
      '#vaga-descricao': vaga.descricao,
      '#vaga-requisitos': vaga.requisitos,
    }
    Object.entries(values).forEach(([selector, value]) => {
      const field = $(selector, form)
      if (field) field.value = value || ''
    })
    if (submitButton) {
      submitButton.innerHTML = '<i class="ri-save-line"></i> Salvar alterações'
    }
    refreshPreview()
  }

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

  form.addEventListener('submit', async (e) => {
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

    const payload = {
      titulo: tituloInput.value.trim(),
      empresa: empresaInput.value.trim(),
      localizacao: localizacaoInput?.value.trim() || '',
      tipo: tipoSelect.value,
      area: areaSelect.value,
      modalidade: modalidadeSelect?.value || '',
      carga: cargaSelect?.value || '',
      descricao: descricaoInput?.value.trim() || '',
      requisitos: requisitosInput?.value.trim() || '',
    }

    if (submitButton) submitButton.disabled = true
    try {
      if (editId) {
        await updateVaga(editId, payload)
      } else {
        await createVaga(payload)
      }
      window.location.href = 'para-empresas.html'
    } catch (error) {
      console.error('Não foi possível salvar a vaga.', error)
      if (submitButton) submitButton.disabled = false
    }
  })

  loadEditVaga().catch((error) => console.error('Não foi possível carregar a vaga.', error))
}
