{{ config(severity="warn") }}
-- Partidas que a fonte só tem com placar, sem escalação nem lances (ex.: Florida Cup, jan/2020). O legado completa.
select id_partida, data
from {{ ref('partidas') }}
where id_partida not in (select id_partida from {{ ref('escalacoes') }})
