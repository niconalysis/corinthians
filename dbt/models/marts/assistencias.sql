select id_partida, id_lance as id_gol, id_assistente as id_jogador, minuto
from {{ ref('stg_espn__gols') }}
where a_favor_do_corinthians and id_assistente is not null
