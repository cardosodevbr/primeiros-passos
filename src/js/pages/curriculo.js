/* =========================================================
   CURRICULO PAGE JS (Wizard Step-by-Step via DOM)
   ========================================================= */

import { $, $$ } from '../core/dom.js';

export function initCurriculoPage() {
  const form = $('#form-curriculo');
  if (!form) return;

  // ── Seletores principais ─────────────────────────────────
  const steps = $$('.form-step', form);
  const btnNext = $('#btn-next');
  const btnPrev = $('#btn-prev');
  const btnSubmit = $('#btn-submit');
  const stepperProgress = $('#stepperProgress');
  const topSteps = $$('.step');
  const vSteps = $$('.v-step');

  let currentStep = 0;
  const totalSteps = steps.length;

  /* =========================================================
     WIZARD — Navegação entre etapas
     ========================================================= */
  function updateUI() {
    steps.forEach((step, i) => step.classList.toggle('active', i === currentStep));

    if (btnPrev) btnPrev.style.display = currentStep === 0 ? 'none' : 'inline-flex';
    if (btnNext && btnSubmit) {
      const isLast = currentStep === totalSteps - 1;
      btnNext.style.display = isLast ? 'none' : 'inline-flex';
      btnSubmit.style.display = isLast ? 'inline-flex' : 'none';
    }

    if (stepperProgress) {
      const percent = ((currentStep + 1) / totalSteps) * 100;
      stepperProgress.style.width = percent + '%';
    }

    topSteps.forEach((s, i) => {
      s.classList.toggle('active', i === currentStep);
      s.classList.toggle('completed', i < currentStep);
    });

    vSteps.forEach((s, i) => s.classList.toggle('active', i <= currentStep));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateCurrentStep() {
    const currentEl = steps[currentStep];
    if (!currentEl) return true;

    const fields = currentEl.querySelectorAll('input, select, textarea');
    let valid = true;

    const radios = currentEl.querySelectorAll('input[type="radio"][required]');
    if (radios.length) {
      const names = new Set();
      radios.forEach(r => names.add(r.name));
      names.forEach(name => {
        const group = currentEl.querySelectorAll(`input[name="${name}"]`);
        if (![...group].some(r => r.checked)) {
          valid = false;
          group[0].setCustomValidity('Selecione uma opção');
          group[0].reportValidity();
          group[0].setCustomValidity('');
        }
      });
    }

    fields.forEach(field => {
      if (field.type === 'radio') return;
      if (!field.checkValidity()) {
        field.reportValidity();
        valid = false;
      }
    });

    return valid;
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (!validateCurrentStep()) return;
      if (currentStep < totalSteps - 1) {
        currentStep++;
        updateUI();
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        updateUI();
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      alert('🎉 Currículo salvo com sucesso!');
    }
  });

  /* =========================================================
     CONTADOR DE CARACTERES (textarea)
     ========================================================= */
  function attachCharCounter(textarea) {
    const counter = textarea.parentElement.querySelector('.char-counter');
    if (!counter) return;
    const max = textarea.getAttribute('maxlength');
    textarea.addEventListener('input', () => {
      counter.textContent = `${textarea.value.length}/${max}`;
    });
  }

  $$('textarea[maxlength]').forEach(attachCharCounter);

  /* =========================================================
     BOTÕES "ADICIONAR OUTRO" (Formação / Experiências)
     ========================================================= */
  function attachRemoveListener(block) {
    const removeBtn = block.querySelector('.btn-remove-block');
    if (!removeBtn) return;

    const newBtn = removeBtn.cloneNode(true);
    removeBtn.parentNode.replaceChild(newBtn, removeBtn);

    newBtn.addEventListener('click', () => {
      const container = block.closest('.form-section');
      const blockType = block.dataset.block;
      const siblings = $$(`.repeatable-block[data-block="${blockType}"]`, container);

      if (siblings.length <= 1) {
        block.querySelectorAll('input, select, textarea').forEach(field => {
          if (field.type === 'checkbox' || field.type === 'radio') {
            field.checked = false;
          } else {
            field.value = '';
          }
        });
        newBtn.style.display = 'none';
        return;
      }

      block.remove();
    });
  }

  $$('.repeatable-block').forEach(attachRemoveListener);

  $$('.btn-add-more[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const blockType = btn.dataset.add;
      const container = btn.closest('.form-section');
      if (!container) return;

      const existingBlocks = $$(`.repeatable-block[data-block="${blockType}"]`, container);
      const lastBlock = existingBlocks[existingBlocks.length - 1];
      if (!lastBlock) return;

      const clone = lastBlock.cloneNode(true);

      clone.querySelectorAll('input, select, textarea').forEach(field => {
        if (field.type === 'checkbox' || field.type === 'radio') {
          field.checked = false;
        } else if (field.tagName === 'SELECT') {
          field.selectedIndex = 0;
        } else {
          field.value = '';
        }
      });

      const charCounter = clone.querySelector('.char-counter');
      if (charCounter) {
        const max = clone.querySelector('textarea')?.getAttribute('maxlength') || 500;
        charCounter.textContent = `0/${max}`;
      }

      clone.querySelectorAll('textarea[maxlength]').forEach(attachCharCounter);

      const removeBtn = clone.querySelector('.btn-remove-block');
      if (removeBtn) removeBtn.style.display = 'inline-flex';

      btn.parentElement.insertBefore(clone, btn);
      attachRemoveListener(clone);
      clone.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  /* =========================================================
     SISTEMA DE TAGS REUTILIZÁVEL
     (usado em: Habilidades técnicas, Outras habilidades)
     ========================================================= */
  function setupTagSystem({ inputId, btnId, tagsContainerId, labelId, progressFillId, max = 10, labelSingular = 'Habilidades' }) {
    const inputEl = document.getElementById(inputId);
    const btnEl = document.getElementById(btnId);
    const containerEl = document.getElementById(tagsContainerId);
    const labelEl = document.getElementById(labelId);
    const fillEl = document.getElementById(progressFillId);

    if (!inputEl || !containerEl) return;

    const items = [];

    function render() {
      containerEl.innerHTML = '';

      items.forEach((item, index) => {
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.innerHTML = `
          <span>${item}</span>
          <button type="button" class="skill-tag-remove" data-index="${index}" aria-label="Remover ${item}">
            <i class="ri-close-line"></i>
          </button>
        `;
        containerEl.appendChild(tag);
      });

      if (fillEl) fillEl.style.width = (items.length / max) * 100 + '%';
      if (labelEl) labelEl.textContent = `${labelSingular} (${items.length}/${max})`;

      containerEl.querySelectorAll('.skill-tag-remove').forEach(b => {
        b.addEventListener('click', (e) => {
          e.preventDefault();
          const i = parseInt(b.dataset.index, 10);
          items.splice(i, 1);
          render();
        });
      });
    }

    function add() {
      const value = inputEl.value.trim();
      if (!value) return;

      if (items.length >= max) {
        inputEl.value = '';
        return;
      }

      if (items.some(s => s.toLowerCase() === value.toLowerCase())) {
        inputEl.value = '';
        return;
      }

      items.push(value);
      inputEl.value = '';
      render();
    }

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        add();
      }
    });

    if (btnEl) {
      btnEl.addEventListener('click', (e) => {
        e.preventDefault();
        add();
      });
    }

    render();
  }

  // Habilidades técnicas (etapa 4)
  setupTagSystem({
    inputId: 'input-skill',
    btnId: 'btn-add-skill',
    tagsContainerId: 'skills-tags',
    labelId: 'skill-label',
    progressFillId: 'skillProgressFill',
    max: 10,
    labelSingular: 'Habilidades adicionais'
  });

  // Outras habilidades (etapa 4)
  setupTagSystem({
    inputId: 'input-outras',
    btnId: 'btn-add-outras',
    tagsContainerId: 'outras-tags',
    labelId: 'outras-label',
    progressFillId: 'outrasProgressFill',
    max: 10,
    labelSingular: 'Outras habilidades'
  });

  /* =========================================================
     MODAL: ADICIONAR IDIOMA (prompt estilizado)
     ========================================================= */
  const modalIdioma = $('#modal-idioma');
  const btnAddIdioma = $('#btn-add-idioma');
  const btnFechar = $('#modal-idioma-fechar');
  const btnCancelar = $('#modal-idioma-cancelar');
  const btnConfirmar = $('#modal-idioma-adicionar');
  const modalInput = $('#modal-idioma-input');
  const modalSelect = $('#modal-nivel-select');
  const idiomasTagsContainer = $('#idiomas-tags');

  const idiomas = []; // { idioma: string, nivel: string }

  function renderIdiomasTags() {
    if (!idiomasTagsContainer) return;
    idiomasTagsContainer.innerHTML = '';

    idiomas.forEach((item, index) => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.innerHTML = `
        <span><i class="ri-translate-2"></i> ${item.idioma} — <strong>${item.nivel}</strong></span>
        <button type="button" class="skill-tag-remove" data-index="${index}" aria-label="Remover ${item.idioma}">
          <i class="ri-close-line"></i>
        </button>
      `;
      idiomasTagsContainer.appendChild(tag);
    });

    idiomasTagsContainer.querySelectorAll('.skill-tag-remove').forEach(b => {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        const i = parseInt(b.dataset.index, 10);
        idiomas.splice(i, 1);
        renderIdiomasTags();
      });
    });
  }

  function abrirModal() {
    if (!modalIdioma) return;
    modalIdioma.hidden = false;
    // Pequeno delay para a transição CSS
    requestAnimationFrame(() => modalIdioma.classList.add('active'));
    if (modalInput) {
      modalInput.value = '';
      modalInput.focus();
    }
    if (modalSelect) modalSelect.selectedIndex = 0;
  }

  function fecharModal() {
    if (!modalIdioma) return;
    modalIdioma.classList.remove('active');
    setTimeout(() => {
      modalIdioma.hidden = true;
    }, 200);
  }

  function adicionarIdioma() {
    const idioma = modalInput?.value.trim();
    const nivel = modalSelect?.value;

    if (!idioma) {
      modalInput?.focus();
      return;
    }
    if (!nivel) {
      modalSelect?.focus();
      return;
    }

    // Evita duplicata
    if (idiomas.some(i => i.idioma.toLowerCase() === idioma.toLowerCase())) {
      alert(`O idioma "${idioma}" já foi adicionado.`);
      modalInput.value = '';
      modalInput.focus();
      return;
    }

    idiomas.push({ idioma, nivel });
    renderIdiomasTags();
    fecharModal();
  }

  if (btnAddIdioma) {
    btnAddIdioma.addEventListener('click', abrirModal);
  }
  if (btnFechar) btnFechar.addEventListener('click', fecharModal);
  if (btnCancelar) btnCancelar.addEventListener('click', fecharModal);
  if (btnConfirmar) btnConfirmar.addEventListener('click', adicionarIdioma);

  // Enter no input do modal confirma
  if (modalInput) {
    modalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        adicionarIdioma();
      }
    });
  }

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalIdioma && !modalIdioma.hidden) {
      fecharModal();
    }
  });

  // Fechar clicando fora do dialog
  if (modalIdioma) {
    modalIdioma.addEventListener('click', (e) => {
      if (e.target === modalIdioma) fecharModal();
    });
  }

  // Inicializa UI
  updateUI();
}