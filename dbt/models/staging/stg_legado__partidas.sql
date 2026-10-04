-- Partidas da base legada, já com o ID da ESPN quando a partida existe lá (casamento pela data).
select
    l.ID_Partida as id_partida_legado,
    coalesce(e.id_partida, concat('legado-', l.ID_Partida)) as id_partida,
    e.id_partida is not null as existe_na_espn,
    -- a ESPN tem a partida mas sem escalação nem lances (ex.: Florida Cup 2020), ou nem tem a partida
    e.id_partida is null or e.id_partida not in (select id_partida from {{ ref('stg_espn__participacoes') }}) as sem_detalhe_espn,
    l.Data as data,
    l.Numero_Gols_Cor as gols_corinthians,
    l.Numero_Gols_Adv as gols_adversario,
    l.ID_Adversario as id_adversario_legado,
    trim(ad.Adversario) as adversario,
    trim(c.Nome_Campeonato) as competicao_legado,
    l.ID_Estadio as id_estadio,
    l.Publico as publico,
    coalesce(da.arbitro, trim(a.Nome_Arbitro)) as arbitro,
    trim(tc.Nome) as tecnico_corinthians,
    trim(t.Nome) as tecnico_adversario
from {{ source('legado', 'partidas_cor') }} l
left join {{ ref('stg_espn__partidas') }} e on e.data = l.Data
left join {{ source('legado', 'adversarios') }} ad on ad.ID_Adversario = l.ID_Adversario
left join {{ source('legado', 'campeonatos') }} c on c.ID_Campeonato = l.ID_Campeonato
left join {{ source('legado', 'arbitros') }} a on a.ID_Arbitro = l.ID_Arbitro
left join {{ ref('de_para_arbitros') }} da on da.arbitro_espn = trim(a.Nome_Arbitro)
left join {{ source('legado', 'tecnicos_cor') }} tc on tc.ID_Tecnico_Cor = l.ID_Tecnico_Cor
left join {{ source('legado', 'tecnicos') }} t on t.ID_Tecnico = l.ID_Tecnico
