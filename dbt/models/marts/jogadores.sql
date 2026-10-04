-- Atletas que entraram em campo pelo Corinthians. Nome e posição da partida mais recente,
-- mais o cadastro manual (seed cadastro_jogadores) quando preenchido.
with nomes as (
    select pa.id_jogador, pa.nome, pa.posicao, p.data
    from {{ ref('stg_espn__participacoes') }} pa
    join {{ ref('stg_espn__partidas') }} p using (id_partida)
    where pa.do_corinthians

    union all

    select id_jogador, nome, cast(null as string), data
    from {{ ref('stg_legado__eventos') }}
    where tipo = 'escalacao'
),

jogadores as (
    select
        e.id_jogador,
        any_value(n.nome having max n.data) as nome,
        any_value(n.posicao having max n.data) as posicao
    from (select distinct id_jogador from {{ ref('escalacoes') }}) e
    join nomes n using (id_jogador)
    group by e.id_jogador
)

select j.*, c.* except (id_jogador, nome)
from jogadores j
left join {{ ref('cadastro_jogadores') }} c using (id_jogador)
