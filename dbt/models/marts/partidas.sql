-- Uma linha por partida. Base ESPN; técnicos do ge (a partir de fev/2026), do legado (até fev/2026) e, para 2014 a
-- 2019, do seed tecnicos_periodos; o legado também completa árbitros e estádios ausentes na ESPN e as partidas que a
-- ESPN não tem.
with espn as (
    select
        p.id_partida,
        p.data,
        p.inicio_utc,
        p.temporada,
        coalesce(c.competicao, p.slug_competicao) as competicao,
        p.corinthians_mandante,
        p.id_adversario,
        p.gols_corinthians,
        p.gols_adversario,
        p.penaltis_corinthians,
        p.penaltis_adversario,
        p.posse_corinthians,
        coalesce(cp.id_estadio, de.id_estadio, l.id_estadio) as id_estadio,
        p.publico,
        coalesce(
            cp.arbitro,
            da.arbitro,
            -- grafia "Sobrenome, Nome" de árbitros que ainda não estão no de-para
            if(strpos(p.arbitro, ', ') > 0, concat(split(p.arbitro, ', ')[safe_offset(1)], ' ', split(p.arbitro, ', ')[offset(0)]), p.arbitro),
            l.arbitro
        ) as arbitro,
        coalesce(cp.tecnico_corinthians, ge.tecnico_corinthians, l.tecnico_corinthians, tp.tecnico) as tecnico_corinthians,
        coalesce(cp.tecnico_adversario, ge.tecnico_adversario, l.tecnico_adversario) as tecnico_adversario,
        'espn' as origem
    from {{ ref('stg_espn__partidas') }} p
    left join {{ ref('competicoes') }} c on c.slug_espn = p.slug_competicao
    left join {{ ref('de_para_estadios') }} de on de.id_estadio_espn = p.id_estadio
    left join {{ ref('de_para_arbitros') }} da on da.arbitro_espn = p.arbitro
    left join {{ ref('stg_legado__partidas') }} l on l.id_partida = p.id_partida
    left join {{ ref('correcoes_partidas') }} cp on cp.id_partida = p.id_partida
    left join {{ ref('tecnicos_periodos') }} tp on p.data between tp.inicio and tp.fim
    left join (
        select * from {{ source('bruto', 'ge_tecnicos') }}
        qualify row_number() over (partition by id_partida order by coletado_em desc) = 1
    ) ge on ge.id_partida = p.id_partida
),

so_legado as (
    select
        id_partida,
        data,
        timestamp(data, 'America/Sao_Paulo') as inicio_utc,
        extract(year from data) as temporada,
        competicao_legado as competicao,
        cast(null as bool) as corinthians_mandante,
        concat('legado-', id_adversario_legado) as id_adversario,
        gols_corinthians,
        gols_adversario,
        cast(null as int64) as penaltis_corinthians,
        cast(null as int64) as penaltis_adversario,
        cast(null as float64) as posse_corinthians,
        id_estadio,
        publico,
        arbitro,
        tecnico_corinthians,
        tecnico_adversario,
        'legado' as origem
    from {{ ref('stg_legado__partidas') }}
    where not existe_na_espn
),

todas as (
    select * from espn
    union all
    select * from so_legado
)

select
    * except (inicio_utc),
    row_number() over (partition by extract(year from data) order by inicio_utc) as numero_no_ano,
    case
        when gols_corinthians > gols_adversario then 'V'
        when gols_corinthians < gols_adversario then 'D'
        else 'E'
    end as resultado
from todas
