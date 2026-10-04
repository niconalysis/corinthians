"""Exporta as partidas do BigQuery para JSON, que o site (pasta `site/`) lê direto no navegador.

O navegador nunca acessa o BigQuery: o site é só HTML, CSS e JavaScript lendo `site/dados/partidas.json`.
O arquivo é regerado pelo pipeline diário e substitui o de exemplo que vem no repositório.

Uso: python pipeline/exporta_site.py
"""

import datetime
import json
import pathlib

from google.cloud import bigquery

PROJETO = "corinthians-dados"
PASTA = pathlib.Path(__file__).resolve().parent.parent / "site" / "dados"
SAIDA = PASTA / "partidas.json"
SAIDA_DETALHES = PASTA / "detalhes.json"

CONSULTA = """
select
    p.id_partida,
    p.data,
    p.temporada,
    p.competicao,
    p.corinthians_mandante,
    a.adversario,
    p.gols_corinthians,
    p.gols_adversario,
    p.resultado,
    e.estadio,
    p.publico,
    p.tecnico_corinthians as tecnico
from `corinthians-dados.marts.partidas` p
left join `corinthians-dados.marts.adversarios` a using (id_adversario)
left join `corinthians-dados.marts.estadios` e using (id_estadio)
order by p.data, p.numero_no_ano
"""

GOLS = """
select
    g.id_partida,
    g.minuto as min,
    g.a_favor_do_corinthians as favor,
    coalesce(g.gol_contra, false) as contra,
    coalesce(g.penalti, false) as penalti,
    coalesce(j.nome, ja.nome, 'Desconhecido') as autor,
    aj.nome as assist
from `corinthians-dados.marts.gols` g
left join `corinthians-dados.marts.jogadores` j on j.id_jogador = g.id_jogador
left join `corinthians-dados.marts.jogadores_adversarios` ja on ja.id_jogador = g.id_jogador
left join `corinthians-dados.marts.assistencias` a on a.id_gol = g.id_gol
left join `corinthians-dados.marts.jogadores` aj on aj.id_jogador = a.id_jogador
order by g.id_partida, g.minuto
"""

CARTOES = """
select c.id_partida, c.minuto as min, c.tipo, j.nome
from `corinthians-dados.marts.cartoes` c
join `corinthians-dados.marts.jogadores` j using (id_jogador)
order by c.id_partida, c.minuto
"""

ESCALACOES = """
select
    e.id_partida,
    j.nome,
    j.posicao as pos,
    coalesce(e.titular, false) as titular,
    coalesce(e.minuto_entrada, 0) as entrada,
    coalesce(e.minuto_saida, 90) as saida
from `corinthians-dados.marts.escalacoes` e
join `corinthians-dados.marts.jogadores` j using (id_jogador)
order by e.id_partida, titular desc, e.minuto_entrada
"""


def valor(v):
    return v.isoformat() if isinstance(v, (datetime.date, datetime.datetime)) else v


def main():
    bq = bigquery.Client(project=PROJETO)
    partidas = [{k: valor(v) for k, v in dict(linha).items()} for linha in bq.query(CONSULTA).result()]
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    conteudo = {"gerado_em": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"), "partidas": partidas}
    SAIDA.write_text(json.dumps(conteudo, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(partidas)} partidas gravadas em {SAIDA}")

    # Detalhe de cada jogo (gols, cartões e escalação), lido pelo painel que abre ao clicar no jogo.
    jogos = {p["id_partida"]: {"gols": [], "cartoes": [], "escalacao": []} for p in partidas}
    for chave, consulta in (("gols", GOLS), ("cartoes", CARTOES), ("escalacao", ESCALACOES)):
        for linha in bq.query(consulta).result():
            item = {k: valor(v) for k, v in dict(linha).items()}
            destino = jogos.get(item.pop("id_partida"))
            if destino is not None:
                destino[chave].append(item)
    SAIDA_DETALHES.write_text(json.dumps({"jogos": jogos}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"detalhe de {len(jogos)} jogos gravado em {SAIDA_DETALHES}")


if __name__ == "__main__":
    main()
