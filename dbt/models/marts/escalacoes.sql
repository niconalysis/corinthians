-- Jogadores do Corinthians que entraram em campo, com minutos jogados.
-- Partidas que só existem com detalhe no legado entram sem titular/minutos (o legado não tinha essa informação).
-- Quando a ESPN lista menos de 11 titulares, o jogador que só o legado tem completa como titular.
with duracao as (
    select
        p.id_partida,
        if(p.status = 'STATUS_FINAL_AET' or max(l.minuto) > 90, 120, 90) as minutos_partida
    from {{ ref('stg_espn__partidas') }} p
    left join {{ ref('stg_espn__lances') }} l using (id_partida)
    group by p.id_partida, p.status
),

eventos as (
    select
        id_partida,
        id_jogador,
        min(if(substituicao, minuto, null)) as primeira_substituicao,
        max(if(substituicao, minuto, null)) as ultima_substituicao,
        min(if(cartao_vermelho, minuto, null)) as minuto_expulsao
    from {{ ref('stg_espn__lances') }}
    where do_corinthians
    group by id_partida, id_jogador
),

espn as (
    select
        pa.id_partida,
        pa.id_jogador,
        pa.titular,
        if(pa.titular, 0, e.primeira_substituicao) as minuto_entrada,
        coalesce(if(pa.saiu, e.ultima_substituicao, null), e.minuto_expulsao, d.minutos_partida) as minuto_saida,
        'espn' as origem
    from {{ ref('stg_espn__participacoes') }} pa
    join duracao d using (id_partida)
    left join eventos e using (id_partida, id_jogador)
    where pa.do_corinthians and (pa.titular or pa.entrou)
),

titulares_faltando as (
    select id_partida
    from espn
    group by id_partida
    having countif(titular) < 11
),

legado as (
    -- partidas sem detalhe na ESPN
    select
        id_partida,
        id_jogador,
        cast(null as bool) as titular,
        cast(null as int64) as minuto_entrada,
        cast(null as int64) as minuto_saida,
        'legado' as origem
    from {{ ref('stg_legado__eventos') }}
    where tipo = 'escalacao' and id_partida not in (select id_partida from espn)

    union all

    -- titular omitido pela ESPN
    select l.id_partida, l.id_jogador, true, 0, d.minutos_partida, 'legado'
    from {{ ref('stg_legado__eventos') }} l
    join titulares_faltando using (id_partida)
    join duracao d using (id_partida)
    where l.tipo = 'escalacao'
      and not exists (select 1 from espn e where e.id_partida = l.id_partida and e.id_jogador = l.id_jogador)
)

select *, greatest(minuto_saida - minuto_entrada, 0) as minutos_jogados
from (
    select * from espn
    union all
    select * from legado
)
