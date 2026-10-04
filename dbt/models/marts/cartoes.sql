-- Cartões de jogadores do Corinthians.
select id_partida, id_jogador, if(cartao_vermelho, 'vermelho', 'amarelo') as tipo, minuto, 'espn' as origem
from {{ ref('stg_espn__lances') }}
where do_corinthians and (cartao_amarelo or cartao_vermelho)

union all

select id_partida, id_jogador, tipo, cast(null as int64), 'legado'
from {{ ref('stg_legado__eventos') }}
where tipo in ('amarelo', 'vermelho') and sem_detalhe_espn
