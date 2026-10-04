{{ config(severity="warn") }}
-- Aviso, não erro: a fonte às vezes omite um titular. Até fev/2026 o legado completa; depois disso, o aviso pede correção.
-- Toda partida começa com 11 titulares do Corinthians.
select id_partida, countif(titular) as titulares
from {{ ref('escalacoes') }}
where id_partida in (select id_partida from {{ ref('escalacoes') }} where origem = 'espn')
group by id_partida
having countif(titular) != 11
