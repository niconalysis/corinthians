-- Atletas que entraram em campo pelo Corinthians. Nome e posição da partida mais recente.
select
    e.id_jogador,
    any_value(pa.nome having max p.data) as nome,
    any_value(pa.posicao having max p.data) as posicao
from {{ ref('escalacoes') }} e
join {{ ref('stg_espn__participacoes') }} pa using (id_partida, id_jogador)
join {{ ref('stg_espn__partidas') }} p using (id_partida)
group by e.id_jogador
