<h1>Arquitetura geral</h1>

```text
src/
│
├── index.html                # Entrada da aplicação
├── assets/                   # recursos gerais: fontes, icons, arquivos estáticos, etc
├── img/                      # imagens
├── components/               # componentes reutilizáveis da interface
│   ├── buttons/              # botões
│   ├── navbar/               # navegação principal
│   └── ui/                   # componentes visuais compartilhados
├── pages/                    # páginas e telas da aplicação
├── services/                 # serviços, regras de negócio e integrações
└── styles/                   # estilos globais e tokens de design
      ├── tokens/
      │   ├── colors.css        # paletas primitivas e cores da marca
      │   ├── semantic.css      # cores com significado de uso
      │   └── tokens.css        # tipografia e demais tokens
      └── global.css            # reset e estilos globais
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