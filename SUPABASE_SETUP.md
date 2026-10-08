# Supabase

O frontend já possui um repositório de vagas em `src/js/services/vagas-repository.js`. Sem configuração, ele usa `localStorage` para desenvolvimento. Para conectar ao Supabase, preencha `src/js/config/supabase.js` com a URL do projeto e a chave pública `anon`.

Nunca use a chave `service_role` no navegador.

## Tabela `vagas`

Execute no SQL Editor do Supabase:

```sql
create table public.vagas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  empresa text not null,
  localizacao text,
  tipo text not null,
  area text not null,
  modalidade text,
  carga text,
  descricao text,
  requisitos text,
  beneficios text,
  status text not null default 'ativa' check (status in ('ativa', 'pausada')),
  created_at timestamptz not null default now()
);

alter table public.vagas enable row level security;

create policy "Vagas ativas podem ser lidas publicamente"
  on public.vagas for select
  using (status = 'ativa');
```

As operações de criação, edição e exclusão já estão isoladas no repositório. Antes de liberar essas operações para usuários reais, adicione autenticação e políticas RLS baseadas no usuário ou na empresa responsável pela vaga.
