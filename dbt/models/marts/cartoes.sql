-- Cartões de jogadores do Corinthians.
select id_partida, id_jogador, if(cartao_vermelho, 'vermelho', 'amarelo') as tipo, minuto
from {{ ref('stg_espn__lances') }}
where do_corinthians and (cartao_amarelo or cartao_vermelho)
