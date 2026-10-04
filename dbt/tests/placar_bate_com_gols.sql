-- O placar de cada partida precisa ser igual à soma dos gols registrados lance a lance.
-- Partidas sem nenhum detalhe na fonte ficam no teste partidas_sem_detalhe.
with contagem as (
    select
        id_partida,
        countif(a_favor_do_corinthians) as gols_cor,
        countif(not a_favor_do_corinthians) as gols_adv
    from {{ ref('gols') }}
    group by id_partida
)

select p.id_partida, p.data, p.gols_corinthians, p.gols_adversario, c.gols_cor, c.gols_adv
from {{ ref('partidas') }} p
left join contagem c using (id_partida)
where p.id_partida in (select id_partida from {{ ref('escalacoes') }})
  and (p.gols_corinthians != coalesce(c.gols_cor, 0)
   or p.gols_adversario != coalesce(c.gols_adv, 0))
