<h1>Arquitetura geral</h1>

```text
primeiros-passos/
│
├── index.html                         # Entrada da aplicação
├── ARCHITECTURE.md                    # Documentação da arquitetura
├── CODE_OF_CONDUCT.md                 # Código de conduta
├── LICENSE                            # Licença do projeto
├── README.md                          # Documentação do projeto
├── SUPABASE_SETUP.md                  # Instruções de configuração do banco Supabase
└── src/
      ├── assets/                        # Recursos estáticos da aplicação
      │   ├── icons/                     # Ícones organizados por contexto
      │   ├── images/                    # Imagens organizadas por finalidade
      │   └── logos/                     # Logotipos da marca
      ├── js/                            # Código JavaScript da aplicação
      │   ├── components/                # Componentes utilitários de JS (header, sidebar, modais)
      │   ├── config/                    # Configurações gerais e clientes de API (ex: Supabase)
      │   ├── core/                      # Utilitários core (DOM, helpers)
      │   ├── pages/                     # Scripts específicos por página
      │   ├── services/                  # Camada de integração com serviços/dados
      │   ├── main.js                    # Inicialização global dos componentes JS
      │   └── vlibras.js                 # Widget de acessibilidade Vlibras
      ├── pages/                         # Páginas HTML da aplicação (kebab-case)
      └── styles/                        # Estilos CSS modulares
            ├── base/                    # Estilos base (reset, acessibilidade, tipografia)
            ├── components/              # Estilos de componentes visuais reutilizáveis
            ├── layout/                  # Estilos de estrutura/layout (grid, container, seções)
            ├── pages/                   # Estilos específicos por página
            ├── tokens/                  # Tokens de design (colors, semantic, tokens)
            └── global.css               # Ponto de entrada dos estilos CSS
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
