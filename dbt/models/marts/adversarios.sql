select id_adversario, any_value(adversario having max data) as adversario
from {{ ref('stg_espn__partidas') }}
group by id_adversario

union all

select concat('legado-', id_adversario_legado), any_value(adversario)
from {{ ref('stg_legado__partidas') }}
where not existe_na_espn
group by id_adversario_legado
