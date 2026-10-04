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
SAIDA = pathlib.Path(__file__).resolve().parent.parent / "site" / "dados" / "partidas.json"

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


def valor(v):
    return v.isoformat() if isinstance(v, (datetime.date, datetime.datetime)) else v


def main():
    bq = bigquery.Client(project=PROJETO)
    partidas = [{k: valor(v) for k, v in dict(linha).items()} for linha in bq.query(CONSULTA).result()]
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    conteudo = {"gerado_em": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"), "partidas": partidas}
    SAIDA.write_text(json.dumps(conteudo, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(partidas)} partidas gravadas em {SAIDA}")


if __name__ == "__main__":
    main()
