-- Uma linha por jogador relacionado em cada partida, dos dois times (inclusive reservas não utilizados).
with ultima_coleta as (
    select id_evento, parse_json(payload) as j
    from {{ source('bruto', 'espn_partidas') }}
    qualify row_number() over (partition by id_evento order by coletado_em desc) = 1
)

select
    id_evento as id_partida,
    string(r.team.id) as id_time,
    string(r.team.id) = '874' as do_corinthians,
    string(a.athlete.id) as id_jogador,
    string(a.athlete.displayName) as nome,
    string(a.position.abbreviation) as posicao,
    safe_cast(string(a.jersey) as int64) as camisa,
    bool(a.starter) as titular,
    coalesce(bool(a.subbedIn), false) as entrou,
    coalesce(bool(a.subbedOut), false) as saiu,
    json_query_array(a, '$.plays') as lances
from ultima_coleta,
    unnest(json_query_array(j, '$.rosters')) r,
    unnest(json_query_array(r, '$.roster')) a
