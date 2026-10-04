-- Uma linha por partida: a coleta mais recente de cada evento, já com o Corinthians e o adversário separados.
with ultima_coleta as (
    select id_evento, data_partida, parse_json(payload) as j
    from {{ source('bruto', 'espn_partidas') }}
    qualify row_number() over (partition by id_evento order by coletado_em desc) = 1
),

lados as (
    select
        *,
        (select c from unnest(json_query_array(j, '$.header.competitions[0].competitors')) c where string(c.team.id) = '874') as cor,
        (select c from unnest(json_query_array(j, '$.header.competitions[0].competitors')) c where string(c.team.id) != '874') as adv
    from ultima_coleta
)

select
    id_evento as id_partida,
    date(data_partida, 'America/Sao_Paulo') as data,
    data_partida as inicio_utc,
    int64(j.header.season.year) as temporada,
    string(j.header.league.slug) as slug_competicao,
    string(j.header.competitions[0].status.type.name) as status,
    string(cor.homeAway) = 'home' as corinthians_mandante,
    cast(string(cor.score) as int64) as gols_corinthians,
    cast(string(adv.score) as int64) as gols_adversario,
    lax_int64(cor.shootoutScore) as penaltis_corinthians,
    lax_int64(adv.shootoutScore) as penaltis_adversario,
    string(adv.team.id) as id_adversario,
    string(adv.team.displayName) as adversario,
    lax_float64(cor.possession) as posse_corinthians,
    string(j.gameInfo.venue.id) as id_estadio,
    string(j.gameInfo.venue.fullName) as estadio,
    string(j.gameInfo.venue.address.city) as cidade,
    string(j.gameInfo.venue.address.country) as pais,
    lax_int64(j.gameInfo.attendance) as publico,
    (select string(o.fullName) from unnest(json_query_array(j, '$.gameInfo.officials')) o where int64(o.order) = 1) as arbitro
from lados
