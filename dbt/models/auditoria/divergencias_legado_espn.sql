-- Onde a base legada e a ESPN discordam, partida a partida, nas partidas que existem nas duas com detalhe.
-- Nas tabelas finais vale a ESPN (Q28); esta tabela existe para revisão e transparência.
-- A coluna `status` diz o que já foi decidido: NADA AQUI É PENDÊNCIA. Não pesquisar por conta própria;
-- pendências de verdade estão em auditoria.pendencias.
with casadas as (
    select l.*, e.id_estadio as id_estadio_espn, e.arbitro as arbitro_espn
    from {{ ref('stg_legado__partidas') }} l
    join {{ ref('stg_espn__partidas') }} e using (id_partida)
    where not l.sem_detalhe_espn
),

placar as (
    select c.id_partida, 'placar' as tipo,
        format('%d x %d', c.gols_corinthians, c.gols_adversario) as legado,
        format('%d x %d', p.gols_corinthians, p.gols_adversario) as espn
    from casadas c
    join {{ ref('partidas') }} p using (id_partida)
    where c.gols_corinthians != p.gols_corinthians or c.gols_adversario != p.gols_adversario
),

estadio as (
    select c.id_partida, 'estadio', el.estadio, ee.estadio
    from casadas c
    join {{ ref('de_para_estadios') }} d on d.id_estadio_espn = c.id_estadio_espn
    join {{ ref('cadastro_estadios') }} el on el.id_estadio = c.id_estadio
    join {{ ref('cadastro_estadios') }} ee on ee.id_estadio = d.id_estadio
    where c.id_estadio != d.id_estadio
),

arbitro as (
    select c.id_partida, 'arbitro', c.arbitro, coalesce(d.arbitro, c.arbitro_espn)
    from casadas c
    left join {{ ref('de_para_arbitros') }} d on d.arbitro_espn = c.arbitro_espn
    where c.arbitro_espn is not null and c.arbitro != coalesce(d.arbitro, c.arbitro_espn)
),

-- Mesma lógica para escalação, gols, assistências e cartões: quem aparece só de um lado.
eventos_legado as (
    select id_partida, tipo, id_jogador, count(*) as n
    from {{ ref('stg_legado__eventos') }}
    where not sem_detalhe_espn and id_jogador is not null
    group by 1, 2, 3
),

eventos_espn as (
    select id_partida, 'escalacao' as tipo, id_jogador, count(*) as n from {{ ref('escalacoes') }} where origem = 'espn' group by 1, 3
    union all
    select id_partida, 'gol', id_jogador, count(*) from {{ ref('gols') }} where autor_do_corinthians and not gol_contra and origem = 'espn' group by 1, 3
    union all
    select id_partida, 'assistencia', id_jogador, count(*) from {{ ref('assistencias') }} where origem = 'espn' group by 1, 3
    union all
    select id_partida, tipo, id_jogador, count(*) from {{ ref('cartoes') }} where origem = 'espn' group by 1, 2, 3
),

eventos as (
    select
        id_partida,
        tipo,
        coalesce(j.nome, id_jogador) as jogador,
        coalesce(l.n, 0) as n_legado,
        coalesce(e.n, 0) as n_espn
    from eventos_legado l
    full join eventos_espn e using (id_partida, tipo, id_jogador)
    left join {{ ref('jogadores') }} j using (id_jogador)
    where id_partida in (select id_partida from casadas)
      and coalesce(l.n, 0) != coalesce(e.n, 0)
),

eventos_agrupados as (
    select
        id_partida,
        tipo,
        string_agg(if(n_legado > n_espn, format('%s (%d)', jogador, n_legado), null), ', ') as legado,
        string_agg(if(n_espn > n_legado, format('%s (%d)', jogador, n_espn), null), ', ') as espn
    from eventos
    group by 1, 2
),

todas as (
    select * from placar
    union all select * from estadio
    union all select * from arbitro
    union all select * from eventos_agrupados
)

select
    p.data,
    a.adversario,
    t.tipo,
    t.legado as so_no_legado,
    t.espn as so_na_espn,
    coalesce(r.status, 'aceita') as status,
    coalesce(r.decisao, 'Vale a ESPN (Q28); o legado completa só o que falta.') as decisao,
    t.id_partida
from todas t
join {{ ref('partidas') }} p using (id_partida)
join {{ ref('adversarios') }} a using (id_adversario)
left join {{ ref('divergencias_resolvidas') }} r on r.id_partida = t.id_partida and r.tipo = t.tipo
order by p.data, t.tipo
