select
    id_estadio,
    any_value(estadio having max data) as estadio,
    any_value(cidade having max data) as cidade,
    any_value(pais having max data) as pais
from {{ ref('stg_espn__partidas') }}
where id_estadio is not null
group by id_estadio
