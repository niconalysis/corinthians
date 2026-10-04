-- Todos os gols da partida, dos dois lados. Gol contra conta para o time oposto ao do autor.
select
    id_partida,
    id_lance as id_gol,
    id_autor as id_jogador,
    a_favor_do_corinthians != gol_contra as autor_do_corinthians,
    a_favor_do_corinthians,
    gol_contra,
    penalti,
    minuto
from {{ ref('stg_espn__gols') }}
