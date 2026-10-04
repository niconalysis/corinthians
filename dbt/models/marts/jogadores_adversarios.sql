-- Atletas adversários que marcaram gol num jogo do Corinthians (inclusive gol contra a favor do Corinthians).
select
    g.id_autor as id_jogador,
    any_value(g.autor having max p.data) as nome
from {{ ref('stg_espn__gols') }} g
join {{ ref('stg_espn__partidas') }} p using (id_partida)
where g.a_favor_do_corinthians = g.gol_contra
group by g.id_autor

union all

select distinct concat('legado:', autor), autor
from {{ ref('stg_legado__gols_adversario') }}
where not gol_contra and sem_detalhe_espn
