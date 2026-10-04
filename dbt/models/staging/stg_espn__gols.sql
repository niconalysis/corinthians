-- Gols a partir da narração (keyEvents), que bate com o placar em mais partidas do que os lances por jogador.
-- Na narração, o time do evento é sempre o que ganhou o gol, inclusive no gol contra.
-- Disputas de pênaltis (shootout) ficam de fora.
-- Em algumas partidas a ESPN lança o mesmo gol duas vezes (um com assistência, outro sem, ids diferentes): fica uma
-- linha por time, minuto e autor, a que traz mais participantes. Lançamentos errados que não são cópia ficam
-- no seed gols_descartados.
with ultima_coleta as (
    select id_evento, parse_json(payload) as j
    from {{ source('bruto', 'espn_partidas') }}
    qualify row_number() over (partition by id_evento order by coletado_em desc) = 1
)

select
    id_evento as id_partida,
    string(e.id) as id_lance,
    string(e.team.id) = '874' as a_favor_do_corinthians,
    string(e.type.type) = 'own-goal' as gol_contra,
    string(e.type.type) = 'penalty---scored' as penalti,
    string(e.participants[0].athlete.id) as id_autor,
    string(e.participants[0].athlete.displayName) as autor,
    if(string(e.type.type) = 'own-goal', null, string(e.participants[1].athlete.id)) as id_assistente,
    -- ponytail: ignora os acréscimos (90'+3' vira 90); trocar por clock.value se precisar de precisão de segundos
    cast(regexp_extract(string(e.clock.displayValue), r'^\d+') as int64) as minuto
from ultima_coleta,
    unnest(json_query_array(j, '$.keyEvents')) e
where bool(e.scoringPlay) and not coalesce(bool(e.shootout), false)
    and string(e.id) not in (select cast(id_gol as string) from {{ ref('gols_descartados') }})
qualify row_number() over (
    partition by
        id_evento,
        string(e.team.id),
        string(e.clock.displayValue),
        coalesce(string(e.participants[0].athlete.id), string(e.id))
    order by array_length(json_query_array(e, '$.participants')) desc, string(e.id)
) = 1
