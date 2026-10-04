-- Dados que nenhuma fonte automática preencheu. É a fila de trabalho da skill resolver-pendencias:
-- cada linha traz o que procurar (descricao) e onde gravar a resposta (destino).
with partidas as (
    select p.*, a.adversario
    from {{ ref('partidas') }} p
    join {{ ref('adversarios') }} a using (id_adversario)
)

select
    'jogador_sem_cadastro' as tipo,
    j.id_jogador as chave,
    format('Jogador do Corinthians "%s" (posição ESPN: %s), jogou de %t a %t',
        j.nome, coalesce(j.posicao, '?'), min(p.data), max(p.data)) as descricao,
    'dbt/seeds/cadastro_jogadores.csv' as destino
from {{ ref('jogadores') }} j
join {{ ref('escalacoes') }} e using (id_jogador)
join partidas p using (id_partida)
where j.data_nascimento is null
group by j.id_jogador, j.nome, j.posicao

union all

select
    'estadio_sem_cadastro',
    e.id_estadio,
    format('Estádio "%s" (%s, %s), partida %s x Corinthians em %t',
        e.estadio, coalesce(e.cidade, '?'), coalesce(e.pais, '?'), p.adversario, p.data),
    'dbt/seeds/cadastro_estadios.csv + dbt/seeds/de_para_estadios.csv'
from partidas p
join {{ ref('stg_espn__partidas') }} e using (id_partida)
where p.id_estadio is null

union all

select
    'partida_sem_tecnico',
    p.id_partida,
    format('Técnicos do Corinthians e do %s na partida de %t (%s)', p.adversario, p.data, p.competicao),
    'dbt/seeds/correcoes_partidas.csv'
from partidas p
-- o ge tem 7 dias para preencher antes de virar pendência
where p.tecnico_corinthians is null and p.data < date_sub(current_date('America/Sao_Paulo'), interval 7 day)

union all

select
    'partida_sem_arbitro',
    p.id_partida,
    format('Árbitro principal da partida %s x Corinthians em %t (%s)', p.adversario, p.data, p.competicao),
    'dbt/seeds/correcoes_partidas.csv'
from partidas p
where p.arbitro is null
