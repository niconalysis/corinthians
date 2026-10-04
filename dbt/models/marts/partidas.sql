select
    p.id_partida,
    p.data,
    row_number() over (partition by extract(year from p.data) order by p.inicio_utc) as numero_no_ano,
    p.temporada,
    coalesce(c.competicao, p.slug_competicao) as competicao,
    p.corinthians_mandante,
    p.id_adversario,
    p.gols_corinthians,
    p.gols_adversario,
    case
        when p.gols_corinthians > p.gols_adversario then 'V'
        when p.gols_corinthians < p.gols_adversario then 'D'
        else 'E'
    end as resultado,
    p.penaltis_corinthians,
    p.penaltis_adversario,
    p.posse_corinthians,
    p.id_estadio,
    p.publico,
    p.arbitro
from {{ ref('stg_espn__partidas') }} p
left join {{ ref('competicoes') }} c on c.slug_espn = p.slug_competicao
