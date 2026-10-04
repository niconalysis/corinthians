{{ config(severity="warn") }}
-- Aviso, não erro: a fonte às vezes omite um titular (ex.: Palmeiras x Corinthians, 01/07/2024). O legado corrige na reconciliação.
-- Toda partida começa com 11 titulares do Corinthians.
select id_partida, countif(titular) as titulares
from {{ ref('escalacoes') }}
group by id_partida
having countif(titular) != 11
