-- Escalações, gols, assistências e cartões do Corinthians na base legada, com o jogador já traduzido
-- para o ID da ESPN (de_para_jogadores). Quando o legado juntava dois atletas num ID só, vale o que
-- aparece na escalação da ESPN daquela partida. Jogador sem par na ESPN fica como "legado-<id>".
-- O ID 1000 era o "Gol Contra" fictício: vira gol sem autor do Corinthians.
with eventos as (
    select ID_Partida, ID_Jogador, 'escalacao' as tipo from {{ source('legado', 'escalacoes') }}
    union all select ID_Partida, ID_Jogador, 'gol' from {{ source('legado', 'gols_corinthians') }}
    union all select ID_PARTIDA, ID_Jogador, 'assistencia' from {{ source('legado', 'assistencias_cor') }}
    union all select ID_Partida, ID_Jogador, 'amarelo' from {{ source('legado', 'cartoes_amarelos') }}
    union all select ID_Partida, ID_Jogador, 'vermelho' from {{ source('legado', 'cartoes_vermelhos') }}
),

numerados as (
    select *, row_number() over (partition by ID_Partida, ID_Jogador, tipo) as seq from eventos
)

select
    p.id_partida,
    p.existe_na_espn,
    p.sem_detalhe_espn,
    ev.tipo,
    ev.ID_Jogador as id_jogador_legado,
    if(ev.ID_Jogador = 1000, null, coalesce(dp.id_jogador, concat('legado-', ev.ID_Jogador))) as id_jogador,
    trim(j.Nome) as nome,
    p.data
from numerados ev
join {{ ref('stg_legado__partidas') }} p on p.id_partida_legado = ev.ID_Partida
left join {{ source('legado', 'jogadores') }} j on j.ID_Jogador = ev.ID_Jogador
left join {{ ref('de_para_jogadores') }} dp on dp.id_jogador_legado = ev.ID_Jogador
left join {{ ref('stg_espn__participacoes') }} pa on pa.id_partida = p.id_partida and pa.id_jogador = dp.id_jogador
qualify row_number() over (partition by p.id_partida, ev.tipo, ev.ID_Jogador, ev.seq order by pa.id_jogador is not null desc) = 1
