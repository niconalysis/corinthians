-- Dois períodos de técnico não podem cobrir a mesma data (o dbt duplicaria a partida).
select a.tecnico as tecnico_a, b.tecnico as tecnico_b, a.inicio, a.fim
from {{ ref('tecnicos_periodos') }} a
join {{ ref('tecnicos_periodos') }} b
  on a.inicio < b.inicio and b.inicio <= a.fim
