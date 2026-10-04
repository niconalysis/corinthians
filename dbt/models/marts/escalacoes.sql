-- Jogadores do Corinthians que entraram em campo, com minutos jogados.
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

em_campo as (
    select
        pa.id_partida,
        pa.id_jogador,
        pa.titular,
        if(pa.titular, 0, e.primeira_substituicao) as minuto_entrada,
        coalesce(if(pa.saiu, e.ultima_substituicao, null), e.minuto_expulsao, d.minutos_partida) as minuto_saida
    from {{ ref('stg_espn__participacoes') }} pa
    join duracao d using (id_partida)
    left join eventos e using (id_partida, id_jogador)
    where pa.do_corinthians and (pa.titular or pa.entrou)
)

select *, greatest(minuto_saida - minuto_entrada, 0) as minutos_jogados
from em_campo
