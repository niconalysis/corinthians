select id_adversario, any_value(adversario having max data) as adversario
from {{ ref('stg_espn__partidas') }}
group by id_adversario
