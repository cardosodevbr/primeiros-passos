/* =========================================================
   PRIMEIROS PASSOS — ACCOUNTS (Login & Cadastro)
   ========================================================= */

export function initAccountsPage() {
  /* ─────────────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────────────── */

  /**
   * Mostra uma mensagem de erro inline abaixo do campo.
   * @param {HTMLElement} input  - O input com problema
   * @param {string}      msg    - Texto do erro
   * @param {string}      errorId - ID do span de erro
   */
  function showError(input, msg, errorId) {
    input.classList.add('is-error')
    input.classList.remove('is-success')
    const el = document.getElementById(errorId)
    if (el) {
      el.textContent = msg
      el.classList.add('visible')
    }
  }

  /**
   * Limpa o estado de erro de um input.
   */
  function clearError(input, errorId) {
    input.classList.remove('is-error')
    const el = document.getElementById(errorId)
    if (el) {
      el.textContent = ''
      el.classList.remove('visible')
    }
  }

  /**
   * Marca o input como válido (borda verde).
   */
  function markSuccess(input) {
    input.classList.remove('is-error')
    input.classList.add('is-success')
  }

  /** Regex simples de e-mail */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  /* ─────────────────────────────────────────────────────
     TOGGLE VISIBILIDADE DA SENHA
     Funciona para todos os botões .auth-toggle-password
  ───────────────────────────────────────────────────── */

  const EYE_OPEN = `<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
  const EYE_SHUT = `<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`

  document.querySelectorAll('.auth-toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.auth-input-wrapper').querySelector('.auth-input')
      const isHidden = input.type === 'password'
      input.type = isHidden ? 'text' : 'password'
      btn.innerHTML = isHidden ? EYE_OPEN : EYE_SHUT
      btn.setAttribute('aria-label', isHidden ? 'Esconder senha' : 'Mostrar senha')
    })
  })

  /* ─────────────────────────────────────────────────────
     INDICADOR DE FORÇA DE SENHA
     Só ativo na tela de cadastro :)
  ───────────────────────────────────────────────────── */

  const passwordInput = document.getElementById('register-password')
  const strengthBars = [1, 2, 3, 4].map((i) => document.getElementById(`strength-bar-${i}`))
  const strengthLabel = document.getElementById('password-strength-label')

  /**
   * Retorna um score de 0–4 para a senha fornecida.
   * Critérios acumulativos:
   *   1 — tem pelo menos 8 chars
   *   2 — tem letra minúscula + maiúscula
   *   3 — tem pelo menos 1 número
   *   4 — tem pelo menos 1 símbolo especial
   */
  function getPasswordScore(pwd) {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const STRENGTH_META = [
    null, // 0 — vazio, sem exibição
    { label: 'Fraca', cls: 'weak', active: 'active-weak' },
    { label: 'Razoável', cls: 'fair', active: 'active-fair' },
    { label: 'Boa', cls: 'good', active: 'active-good' },
    { label: 'Forte', cls: 'strong', active: 'active-strong' },
  ]

  function updateStrengthUI(score) {
    if (!strengthBars[0] || !strengthLabel) return

    // Limpa todas as barras
    strengthBars.forEach((bar) => {
      bar.className = 'auth-strength-bar'
    })
    strengthLabel.className = 'auth-strength-label'
    strengthLabel.textContent = ''

    if (score === 0) return

    const meta = STRENGTH_META[score]

    // Pinta as barras até o score
    strengthBars.forEach((bar, i) => {
      if (i < score) bar.classList.add(meta.active)
    })

    strengthLabel.classList.add(meta.cls)
    strengthLabel.textContent = meta.label
  }

  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      const score = getPasswordScore(passwordInput.value)
      updateStrengthUI(passwordInput.value ? score : 0)

      // Revalida confirmação em tempo real se já preenchida
      const confirmInput = document.getElementById('register-password-confirm')
      if (confirmInput && confirmInput.value) {
        validatePasswordMatch(confirmInput)
      }
    })
  }

  /* ─────────────────────────────────────────────────────
     VALIDAÇÃO DE CONFIRMAÇÃO DE SENHA
  ───────────────────────────────────────────────────── */

  function validatePasswordMatch(confirmInput) {
    const pwd = document.getElementById('register-password')?.value ?? ''
    const confirm = confirmInput.value

    if (!confirm) {
      showError(confirmInput, 'Confirme sua senha.', 'register-confirm-error')
      return false
    }
    if (pwd !== confirm) {
      showError(confirmInput, 'As senhas não coincidem.', 'register-confirm-error')
      return false
    }
    clearError(confirmInput, 'register-confirm-error')
    markSuccess(confirmInput)
    return true
  }

  const confirmInput = document.getElementById('register-password-confirm')
  if (confirmInput) {
    confirmInput.addEventListener('input', () => validatePasswordMatch(confirmInput))
  }

  /* ─────────────────────────────────────────────────────
     LIMPAR ERRO AO FOCAR
  ───────────────────────────────────────────────────── */

  document.querySelectorAll('.auth-input').forEach((input) => {
    // Obtém o ID do erro a partir do aria-describedby
    input.addEventListener('focus', () => {
      const errorId = (input.getAttribute('aria-describedby') ?? '')
        .split(' ')
        .find((id) => id.includes('error'))
      if (errorId) clearError(input, errorId)
    })
  })

  /* ─────────────────────────────────────────────────────
     FORMULÁRIO DE LOGIN
  ───────────────────────────────────────────────────── */

  const loginForm = document.getElementById('login-form')

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault()
      let valid = true

      const emailInput = document.getElementById('login-email')
      const pwdInput = document.getElementById('login-password')

      // Valida e-mail
      if (!emailInput.value.trim()) {
        showError(emailInput, 'Informe seu e-mail.', 'login-email-error')
        valid = false
      } else if (!EMAIL_RE.test(emailInput.value.trim())) {
        showError(emailInput, 'E-mail inválido.', 'login-email-error')
        valid = false
      } else {
        clearError(emailInput, 'login-email-error')
        markSuccess(emailInput)
      }

      // Valida senha
      if (!pwdInput.value) {
        showError(pwdInput, 'Informe sua senha.', 'login-password-error')
        valid = false
      } else if (pwdInput.value.length < 6) {
        showError(pwdInput, 'Senha deve ter no mínimo 6 caracteres.', 'login-password-error')
        valid = false
      } else {
        clearError(pwdInput, 'login-password-error')
        markSuccess(pwdInput)
      }

      if (valid) submitWithLoading(loginForm, 'btn-login', 'Entrando…')
    })
  }

  /* ─────────────────────────────────────────────────────
     FORMULÁRIO DE CADASTRO
  ───────────────────────────────────────────────────── */

  const registerForm = document.getElementById('register-form')

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault()
      let valid = true

      const nameInput = document.getElementById('register-name')
      const emailInput = document.getElementById('register-email')
      const pwdInput = document.getElementById('register-password')
      const confirmInp = document.getElementById('register-password-confirm')
      const termsInput = document.getElementById('register-terms')

      // Nome
      if (!nameInput.value.trim()) {
        showError(nameInput, 'Informe seu nome completo.', 'register-name-error')
        valid = false
      } else if (nameInput.value.trim().split(' ').length < 2) {
        showError(nameInput, 'Informe nome e sobrenome.', 'register-name-error')
        valid = false
      } else {
        clearError(nameInput, 'register-name-error')
        markSuccess(nameInput)
      }

      // E-mail
      if (!emailInput.value.trim()) {
        showError(emailInput, 'Informe seu e-mail.', 'register-email-error')
        valid = false
      } else if (!EMAIL_RE.test(emailInput.value.trim())) {
        showError(emailInput, 'E-mail inválido.', 'register-email-error')
        valid = false
      } else {
        clearError(emailInput, 'register-email-error')
        markSuccess(emailInput)
      }

      // Senha
      if (!pwdInput.value) {
        showError(pwdInput, 'Crie uma senha.', 'register-password-error')
        valid = false
      } else if (pwdInput.value.length < 8) {
        showError(pwdInput, 'Senha deve ter no mínimo 8 caracteres.', 'register-password-error')
        valid = false
      } else {
        clearError(pwdInput, 'register-password-error')
        markSuccess(pwdInput)
      }

      // Confirmação de senha
      if (!validatePasswordMatch(confirmInp)) {
        valid = false
      }

      // Termos de uso
      if (termsInput && !termsInput.checked) {
        showError(
          termsInput,
          'Você precisa aceitar os termos para continuar.',
          'register-terms-error',
        )
        valid = false
      } else if (termsInput) {
        clearError(termsInput, 'register-terms-error')
      }

      if (valid) submitWithLoading(registerForm, 'btn-register', 'Criando conta…')
    })
  }

  /* ─────────────────────────────────────────────────────
     ESTADO DE LOADING NO BOTÃO DE SUBMIT
  ───────────────────────────────────────────────────── */

  /**
   * Desabilita o botão e mostra um spinner enquanto "processa".
   * Em produção, remova o setTimeout e conecte ao backend.
   */
  function submitWithLoading(form, btnId, loadingText) {
    const btn = document.getElementById(btnId)
    if (!btn) return

    const original = btn.innerHTML
    btn.innerHTML = `<span class="btn-spinner"></span> ${loadingText}`
    btn.disabled = true

    // Simulação — remover quando houver backend
    setTimeout(() => {
      btn.innerHTML = original
      btn.disabled = false
    }, 2000)
  }

  /* ─────────────────────────────────────────────────────
     MÁSCARA DE CNPJ (tela empresa)
  ───────────────────────────────────────────────────── */

  const cnpjInput = document.getElementById('empresa-cnpj')
  if (cnpjInput) {
    cnpjInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 14)
      if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5')
      else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4')
      else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3')
      else if (v.length > 2) v = v.replace(/^(\d{2})(\d{1,3})/, '$1.$2')
      e.target.value = v
    })
  }
}
