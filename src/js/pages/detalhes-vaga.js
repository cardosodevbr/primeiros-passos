import { $, $$ } from '../core/dom.js'
import { deleteVaga, getVaga } from '../services/vagas-repository.js'

function splitItems(value) {
  return value
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function initDetalhesVagaPage() {
  const id = new URLSearchParams(window.location.search).get('id')
  const title = $('.job-main-details .job-title')
  if (!title || !id) return

  const vaga = await getVaga(id)
  if (!vaga) {
    title.textContent = 'Vaga não encontrada'
    return
  }

  title.textContent = vaga.titulo
  $('.company-name').textContent = vaga.empresa
  $('.job-intro').textContent = vaga.descricao || 'Confira os detalhes desta oportunidade.'

  const tags = $$('.job-tags .tag')
  if (tags[0]) tags[0].lastChild.textContent = ` ${vaga.localizacao}`
  if (tags[1]) tags[1].lastChild.textContent = ` ${vaga.modalidade}`
  if (tags[2]) tags[2].lastChild.textContent = ` ${vaga.carga}`

  const sections = $$('.job-main-details .job-section')
  const description = sections[0]?.querySelector('p')
  if (description) description.textContent = vaga.descricao || 'Descrição não informada.'

  const activities = sections[1]?.querySelector('ul')
  if (activities) {
    activities.innerHTML = ''
    splitItems(vaga.descricao || 'Atividades da vaga serão informadas pela empresa.').forEach(
      (item) => {
        const li = document.createElement('li')
        li.textContent = item
        activities.appendChild(li)
      },
    )
  }

  const requirements = sections[2]?.querySelector('ul')
  if (requirements) {
    requirements.innerHTML = ''
    splitItems(vaga.requisitos || 'Requisitos não informados.').forEach((item) => {
      const li = document.createElement('li')
      li.textContent = item
      requirements.appendChild(li)
    })
  }

  const infoValues = $$('.info-card .info-value')
  ;[vaga.tipo, vaga.area, vaga.carga, vaga.modalidade, vaga.beneficios || 'A combinar'].forEach(
    (value, index) => {
      if (infoValues[index]) infoValues[index].textContent = value || 'Não informado'
    },
  )

  const editButton = $('.btn-edit-vaga')
  if (editButton) editButton.href = `criar-vaga.html?id=${encodeURIComponent(vaga.id)}`

  const deleteButton = $('.btn-danger')
  if (deleteButton) {
    deleteButton.addEventListener('click', async () => {
      if (!window.confirm('Excluir esta vaga? Essa ação não pode ser desfeita.')) return
      deleteButton.disabled = true
      try {
        await deleteVaga(vaga.id)
        window.location.href = 'vagas.html'
      } catch (error) {
        console.error('Não foi possível excluir a vaga.', error)
        deleteButton.disabled = false
      }
    })
  }
}

initDetalhesVagaPage().catch((error) =>
  console.error('Não foi possível carregar os detalhes.', error),
)
