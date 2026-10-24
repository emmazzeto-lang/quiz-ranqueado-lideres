-- Tabela do quiz. Cole tudo no Supabase em: SQL Editor > New query > Run.
-- Pode rodar de novo sem medo: nada é apagado, só cria o que estiver faltando.

create table if not exists public.participantes (
  -- RA como chave: o próprio banco recusa o mesmo RA duas vezes,
  -- mesmo que duas pessoas cliquem no mesmo instante
  ra             text primary key,
  usuario        text not null,
  token          uuid not null,
  iniciado_em    timestamptz not null,
  finalizado_em  timestamptz,
  acertos        integer,
  total          integer,
  percentual     numeric,
  multiplicador  numeric,
  pontuacao      numeric,
  tempo_segundos integer
);

-- Deixa o ranking rápido: só quem terminou, mais pontos primeiro, desempate pelo tempo
create index if not exists participantes_ranking
  on public.participantes (pontuacao desc, tempo_segundos asc)
  where finalizado_em is not null;

-- Segurança: com RLS ligado e NENHUMA policy, ninguém de fora acessa a tabela
-- (nem com a chave pública). Só o servidor do quiz, com a chave secreta, lê e grava.
alter table public.participantes enable row level security;

-- Permissão só para o servidor (a chave secreta usa o papel "service_role").
-- Projetos novos do Supabase podem não dar essa permissão sozinhos.
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.participantes to service_role;

-- Respostas salvas uma a uma durante o quiz, no formato {"id da pergunta": alternativa}.
-- Se a pessoa bloquear a tela ou fechar a aba, o que ela respondeu a tempo não se perde.
alter table public.participantes
  add column if not exists respostas jsonb not null default '{}'::jsonb;

-- Salva UMA resposta, sem apagar as outras (duas respostas chegando juntas não se
-- sobrescrevem). Só grava se o quiz não foi enviado e o tempo ainda não acabou:
-- "p_limite" é o horário de início mais antigo que ainda está dentro do prazo.
-- Devolve true se gravou.
create or replace function public.salvar_resposta(
  p_ra text, p_token uuid, p_pergunta text, p_opcao integer, p_limite timestamptz
)
returns boolean
language sql
set search_path = ''
as $$
  with atualizada as (
    update public.participantes
       set respostas = respostas || jsonb_build_object(p_pergunta, p_opcao)
     where ra = p_ra
       and token = p_token
       and finalizado_em is null
       and iniciado_em >= p_limite
    returning 1
  )
  select exists (select 1 from atualizada);
$$;

-- Funções novas podem ser chamadas por qualquer um por padrão: deixa só o servidor
revoke execute on function public.salvar_resposta(text, uuid, text, integer, timestamptz) from public, anon, authenticated;
grant execute on function public.salvar_resposta(text, uuid, text, integer, timestamptz) to service_role;
