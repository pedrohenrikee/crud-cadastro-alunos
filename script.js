'use strict'

const form = document.getElementById('form-cadastro')
const tbody = document.getElementById('alunosTableBody')
const btnCadastrar = document.getElementById('btn-cadastrar')
const titulo = document.getElementById('titulo-form')
const campoId = document.getElementById('aluno-id')
const campoBusca = document.getElementById('busca')

// Lista carregada da API (a busca filtra em cima dela)
let listaAlunos = []

const CAMPOS = ['nome', 'email', 'celular', 'cep', 'logradouro', 'bairro', 'estado', 'cidade']

// Desenha a tabela, aplicando o filtro da busca (nome ou e-mail)
const renderizarTabela = () => {
  const termo = campoBusca.value.trim().toLowerCase()
  const filtrados = listaAlunos.filter(aluno =>
    (aluno.nome ?? '').toLowerCase().includes(termo) ||
    (aluno.email ?? '').toLowerCase().includes(termo)
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

// Busca os alunos na API e atualiza a tabela
const carregarAlunos = async () => {
  listaAlunos = await getAlunos()
  renderizarTabela()
}

// Volta o formulário para o modo "cadastrar"
const sairModoEdicao = () => {
  campoId.value = ''
  titulo.textContent = 'Cadastrar Aluno'
  btnCadastrar.textContent = 'Cadastrar'
}

// CREATE / UPDATE
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

// Botão Limpar
form.addEventListener('reset', sairModoEdicao)

// Busca: filtra enquanto digita
campoBusca.addEventListener('input', renderizarTabela)

// EDITAR / EXCLUIR
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

carregarAlunos()