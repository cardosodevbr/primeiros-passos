# Primeiros Passos 🚀

> Projeto desenvolvido pelos estudantes da turma SP09 durante o curso de Front-End do Instituto PROA.

O **Primeiros Passos** é uma plataforma focada em conectar jovens talentos a suas primeiras oportunidades no mercado de trabalho (Estágios e Jovem Aprendiz).

---

## 📁 Estrutura do Projeto

A organização de pastas segue o padrão especificado na [Documentação da Arquitetura](ARCHITECTURE.md):

```text
primeiros-passos/
├── index.html               # Página de entrada (Landing Page)
├── ARCHITECTURE.md          # Especificações da arquitetura e design tokens
├── SUPABASE_SETUP.md        # Guia de integração com banco Supabase
└── src/
    ├── assets/              # Logotipos, ícones e imagens estáticas
    ├── js/                  # Módulos JavaScript (componentes, páginas, serviços)
    ├── pages/               # Páginas HTML (kebab-case)
    └── styles/              # Design system em CSS (tokens, base, componentes, páginas)
```

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Semântico e estruturado seguindo boas práticas de acessibilidade.
- **CSS3 Moderno**: Design Tokens, CSS Variables, Flexbox e Grid Layout.
- **JavaScript (ES6+)**: Módulos nativos (`type="module"`) para dinamismo e consumo de dados.
- **Remix Icon**: Biblioteca de ícones vetoriais.
- **VLibras**: Acessibilidade para tradução em Libras.

---

## 📌 Convenções de Nomenclatura e Código

- **Arquivos HTML/CSS/JS**: Nomenclatura em `kebab-case` (ex: `cadastro-empresa.html`, `detalhes-vaga.js`).
- **Classes CSS**: Nomenclatura baseada no padrão BEM / utility classes (ex: `button button--primary`, `card-header`).
- **Arquivos de Teste/Rascunho**: Não devem ser versionados na pasta principal do projeto.

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais no âmbito do Instituto PROA. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
