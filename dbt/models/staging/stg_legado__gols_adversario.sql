-- Gols do adversário na base legada, que guardava só o nome do autor.
-- "(gol contra)" no nome indicava gol contra de um jogador do Corinthians.
select
    p.id_partida,
    p.existe_na_espn,
    p.sem_detalhe_espn,
    trim(regexp_replace(g.Nome_Adversario, r'\(gol contra\)', '')) as autor,
    regexp_contains(g.Nome_Adversario, r'\(gol contra\)') as gol_contra
from {{ source('legado', 'gols_adversario') }} g
join {{ ref('stg_legado__partidas') }} p on p.id_partida_legado = g.ID_Partida
