'use strict'

const form = document.getElementById('form-cadastro')
const tbody = document.getElementById('alunosTableBody')
const btnCadastrar = document.getElementById('btn-cadastrar')
const titulo = document.getElementById('titulo-form')
const campoId = document.getElementById('aluno-id')
const campoBusca = document.getElementById('busca')
const btnMenu = document.getElementById('btn-menu')
const menuFiltro = document.getElementById('menu-filtro')

const CAMPOS_FILTRO = {
  todos: ['id', 'nome', 'email', 'celular', 'cep', 'logradouro', 'bairro', 'estado', 'cidade'],
  id: ['id'],
  nome: ['nome'],
  email: ['email'],
  celular: ['celular'],
  endereco: ['cep', 'logradouro', 'bairro', 'estado', 'cidade']
}


let listaAlunos = []

const CAMPOS = ['nome', 'email', 'celular', 'cep', 'logradouro', 'bairro', 'estado', 'cidade']


const renderizarTabela = () => {
  const termo = campoBusca.value.trim().toLowerCase()
  const escolhido = document.querySelector('input[name="filtro"]:checked').value
  const campos = CAMPOS_FILTRO[escolhido]
  
  const filtrados = listaAlunos.filter(aluno =>
    campos.some(campo => String(aluno[campo] ?? '').toLowerCase().includes(termo))
  )

  tbody.innerHTML = ''

  filtrados.forEach(aluno => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${aluno.nome ?? ''}</td>
      <td>${aluno.celular ?? ''}</td>
      <td>${aluno.email ?? ''}</td>
      <td>${aluno.cidade ?? ''}</td>
      <td>${aluno.estado ?? ''}</td>
      <td>${aluno.cep ?? ''}</td>
      <td>
        <button type="button" data-acao="editar" data-id="${aluno.id}">Editar</button>
        <button type="button" data-acao="excluir" data-id="${aluno.id}">Excluir</button>
      </td>
    `
    tbody.appendChild(tr)
  })
}


const carregarAlunos = async () => {
  listaAlunos = await getAlunos()
  renderizarTabela()
}

const sairModoEdicao = () => {
  campoId.value = ''
  titulo.textContent = 'Cadastrar Aluno'
  btnCadastrar.textContent = 'Cadastrar'
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault()

  const aluno = {}
  CAMPOS.forEach(campo => {
    aluno[campo] = document.getElementById(campo).value.trim()
  })

  if (campoId.value) {
    aluno.id = campoId.value
    await putAluno(aluno)
  } else {
    await postAluno(aluno)
  }

  form.reset()
  sairModoEdicao()
  carregarAlunos()
})

form.addEventListener('reset', sairModoEdicao)

campoBusca.addEventListener('input', renderizarTabela)

tbody.addEventListener('click', async (evento) => {
  const botao = evento.target.closest('button[data-acao]')
  if (!botao) return

  const { acao, id } = botao.dataset

  if (acao === 'excluir') {
    await deleteAluno(id)
    carregarAlunos()
  }

  if (acao === 'editar') {
    const aluno = await getAluno(id)
    CAMPOS.forEach(campo => {
      document.getElementById(campo).value = aluno[campo] ?? ''
    })
    campoId.value = aluno.id
    titulo.textContent = 'Editar Aluno'
    btnCadastrar.textContent = 'Salvar alterações'
  }
})

btnMenu.addEventListener('click', () => {
  const vaiAbrir = menuFiltro.hidden
  menuFiltro.hidden = !vaiAbrir
  btnMenu.setAttribute('aria-expanded', vaiAbrir)
})

menuFiltro.addEventListener('change', (evento) => {
  const rotulo = evento.target.parentElement.textContent.trim()
  campoBusca.placeholder = evento.target.value === 'todos'
  ? 'Buscar em todos os campos'
  : `Buscar por ${rotulo.toLowerCase()}`
renderizarTabela()
menuFiltro.hidden = true
btnMenu.setAttribute('aria-expanded', false)
})

document.addEventListener('click', (evento) => {
  if (!evento.target.closest('.busca')) {
    menuFiltro.hidden = true
    btnMenu.setAttribute('aria-expanded', false)
  }
})

carregarAlunos()