/* =========================================================
   TELA DE SUCESSO DE CANDIDATURA
   ========================================================= */

import { $, $$ } from '../core/dom.js'

/* ─── Confetti Engine ──────────────────────────────────────── */
function runConfetti(canvas) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  const parent = canvas.parentElement
  canvas.width = parent?.clientWidth || window.innerWidth
  canvas.height = parent?.clientHeight || window.innerHeight

  const COLORS = [
    '#a855f7',
    '#d946ef',
    '#c084fc',
    '#e879f9',
    '#38bdf8',
    '#818cf8',
    '#f472b6',
    '#facc15',
  ]

  const PARTICLE_COUNT = 120

  /** Cria uma partícula com posição aleatória acima do canvas */
  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * -1,
      r: Math.random() * 6 + 3,
      d: Math.random() * PARTICLE_COUNT,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncrement: Math.random() * 0.07 + 0.05,
      tiltAngle: 0,
      speedX: Math.random() * 2 - 1,
      speedY: Math.random() * 3 + 1.5,
      opacity: Math.random() * 0.5 + 0.5,
    }
  }

  const particles = Array.from({ length: PARTICLE_COUNT }, createParticle)

  let frame
  let elapsed = 0
  let stopped = false

  function draw() {
    if (stopped) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    elapsed++

    particles.forEach((p) => {
      p.tiltAngle += p.tiltAngleIncrement
      p.y += p.speedY
      p.x += Math.sin(p.d + elapsed * 0.02) * 1.2 + p.speedX
      p.tilt = Math.sin(p.tiltAngle) * 15

      // Fade-out após a fase inicial
      if (elapsed > 90) {
        p.opacity = Math.max(0, p.opacity - 0.01)
      }

      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.beginPath()
      ctx.lineWidth = p.r
      ctx.strokeStyle = p.color
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y)
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4)
      ctx.stroke()
      ctx.restore()
    })

    const allFaded = particles.every((p) => p.opacity <= 0)
    if (allFaded) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    frame = requestAnimationFrame(draw)
  }

  function stop() {
    stopped = true
    cancelAnimationFrame(frame)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  frame = requestAnimationFrame(draw)
  return stop
}

/* ─── Controller ─────────────────────────────────────── */
export function initModalCandidatura() {
  const successView = $('#candidatura-success-view')
  const btnVoltar = $('#btn-voltar-vagas')
  const btnContinuar = $('#btn-continuar-vagas')
  const btnVerCandid = $('#btn-ver-candidaturas')
  const jobNameEl = $('#success-job-name')
  const companyEl = $('#success-company-name')
  const confettiCanvas = $('#confetti-canvas')

  // Elementos da view de vagas que ocultamos ao mostrar o sucesso
  const heroSection = $('.vagas-hero-section')
  const filterBar = $('.category-filter-bar')
  const layoutGrid = $('.vagas-layout-grid')

  // Guard: só ativa se a página tiver a success view
  if (!successView) return

  let stopConfetti = null
  let isVisible = false

  /* ── Dimensiona o canvas para cobrir o pai ── */
  function resizeCanvas() {
    if (!confettiCanvas) return
    const parent = confettiCanvas.parentElement
    confettiCanvas.width = parent?.clientWidth || window.innerWidth
    confettiCanvas.height = parent?.clientHeight || window.innerHeight
  }

  /* ── Mostra a tela de sucesso ── */
  function showSuccessView(jobName, companyName) {
    if (isVisible) return // previne duplo clique
    isVisible = true

    // Preenche os dados dinâmicos da vaga
    if (jobNameEl) jobNameEl.textContent = jobName || 'esta vaga'
    if (companyEl) companyEl.textContent = companyName || 'a empresa'

    // Oculta o conteúdo principal de vagas
    if (heroSection) heroSection.style.display = 'none'
    if (filterBar) filterBar.style.display = 'none'
    if (layoutGrid) layoutGrid.style.display = 'none'

    // Exibe a success view
    successView.removeAttribute('hidden')
    successView.focus?.()
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Dispara o confetti
    if (confettiCanvas) {
      if (stopConfetti) stopConfetti()
      resizeCanvas()
      stopConfetti = runConfetti(confettiCanvas)
    }
  }

  /* ── Esconde a tela de sucesso e volta para a listagem ── */
  function hideSuccessView() {
    if (!isVisible) return
    isVisible = false

    successView.setAttribute('hidden', '')

    // Restaura o conteúdo de vagas
    if (heroSection) heroSection.style.display = ''
    if (filterBar) filterBar.style.display = ''
    if (layoutGrid) layoutGrid.style.display = ''

    // Para o confetti
    if (stopConfetti) {
      stopConfetti()
      stopConfetti = null
    }
  }

  /* ── Bind: botões "Candidatar-se" nos cards ── */
  $$('.btn-candidatar').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      const card = btn.closest('.job-card')
      const jobName = card?.dataset.job || card?.querySelector('.job-title')?.textContent?.trim()
      const company =
        card?.dataset.company || card?.querySelector('.job-company')?.textContent?.trim()
      showSuccessView(jobName, company)
    })
  })

  /* ── Bind: botões de saída da tela de sucesso ── */
  btnVoltar?.addEventListener('click', hideSuccessView)
  btnContinuar?.addEventListener('click', hideSuccessView)

  // "Ver minhas candidaturas" — fecha a view (futuramente navegará para /candidaturas)
  btnVerCandid?.addEventListener('click', (e) => {
    e.preventDefault()
    hideSuccessView()
  })

  /* ── Redimensiona o canvas quando a janela muda de tamanho ── */
  window.addEventListener('resize', () => {
    if (!isVisible || !confettiCanvas) return
    resizeCanvas()
  })
}
