-- Todos os gols da partida, dos dois lados. Gol contra conta para o time oposto ao do autor.
select
    id_partida,
    id_lance as id_gol,
    id_autor as id_jogador,
    a_favor_do_corinthians != gol_contra as autor_do_corinthians,
    a_favor_do_corinthians,
    gol_contra,
    penalti,
    minuto,
    'espn' as origem
from {{ ref('stg_espn__gols') }}

union all

-- Partidas sem detalhe na ESPN: gols do Corinthians no legado (ID 1000 = gol contra de adversário, autor desconhecido)
select
    id_partida,
    concat(id_partida, '-cor-', row_number() over (partition by id_partida order by id_jogador)),
    id_jogador,
    id_jogador is not null,
    true,
    id_jogador is null,
    cast(null as bool),
    cast(null as int64),
    'legado'
from {{ ref('stg_legado__eventos') }}
where tipo = 'gol' and sem_detalhe_espn

union all

-- Partidas sem detalhe na ESPN: gols do adversário no legado (só o nome do autor)
select
    g.id_partida,
    concat(g.id_partida, '-adv-', row_number() over (partition by g.id_partida order by g.autor)),
    if(g.gol_contra, coalesce(dp.id_jogador, concat('legado-', j.ID_Jogador)), concat('legado:', g.autor)),
    g.gol_contra,
    false,
    g.gol_contra,
    cast(null as bool),
    cast(null as int64),
    'legado'
from {{ ref('stg_legado__gols_adversario') }} g
left join {{ source('legado', 'jogadores') }} j on g.gol_contra and trim(j.Nome) = g.autor
left join {{ ref('de_para_jogadores') }} dp on dp.id_jogador_legado = j.ID_Jogador
where g.sem_detalhe_espn
