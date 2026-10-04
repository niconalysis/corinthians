select id_partida, id_lance as id_gol, id_assistente as id_jogador, minuto, 'espn' as origem
from {{ ref('stg_espn__gols') }}
where a_favor_do_corinthians and id_assistente is not null

union all

select id_partida, cast(null as string), id_jogador, cast(null as int64), 'legado'
from {{ ref('stg_legado__eventos') }}
where tipo = 'assistencia' and sem_detalhe_espn
