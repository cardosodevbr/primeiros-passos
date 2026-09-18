<h1>Arquitetura geral</h1>

```text
primeiros-passos/
│
├── index.html                         # Entrada da aplicação
└── src/
      ├── assets/                        # recursos estáticos da aplicação
      │   ├── icons/                     # ícones organizados por contexto
      │   │   ├── navigation/
      │   │   ├── social/
      │   │   └── ui/
      │   ├── images/                    # imagens organizadas por finalidade
      │   │   ├── app/
      │   │   ├── hero/
      │   │   └── products/
      │   └── logos/                     # logotipos
      ├── components/                    # estrutura para componentes reutilizáveis
      │   ├── buttons/                   # botões
      │   ├── navbar/                    # navegação principal
      │   └── ui/                        # componentes visuais compartilhados
      ├── icons/                         # espaço reservado para ícones da interface
      ├── images/                        # espaço reservado para imagens da interface
      ├── js/                            # código JavaScript da aplicação
      │   ├── components/
      │   │   └── modal.js               # comportamento de modais
      │   ├── core/
      │   │   ├── dom.js                 # utilitários de manipulação do DOM
      │   │   └── utils.js               # utilitários gerais
      │   └── main.js                    # inicialização da aplicação
      ├── pages/                         # páginas e telas da aplicação
      ├── services/                      # serviços, regras de negócio e integrações
      └── styles/                        # estilos globais e tokens de design
            ├── base/
            │   ├── accessibility.css      # acessibilidade
            │   ├── reset.css              # reset de estilos
            │   └── typography.css         # tipografia base
            ├── components/                # estilos dos componentes
            ├── layout/                    # container, grid e seções
            ├── pages/                     # estilos específicos de páginas
            ├── tokens/
            │   ├── colors.css             # paletas primitivas e cores da marca
            │   ├── semantic.css           # cores com significado de uso
            │   └── tokens.css             # tipografia e demais tokens
            └── global.css                 # ponto de entrada dos estilos globais
```

<br/>

<h1>Fluxo de Design</h1>

```text
                    colors.css
                        │
          ┌─────────────┴─────────────┐
          ↓                           ↓
  Primitivas genericas         Primitivas do projeto
  yellow-200                    brand-primary
  blue-600                      surface-pink
  green-600                     text-primary
  ...                               ...
          │                           │
          └─────────────┬─────────────┘
                        ↓
                  semantic.css
                        │
                        ↓
                   components
```
