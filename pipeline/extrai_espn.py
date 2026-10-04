"""Baixa da ESPN o JSON completo de cada partida do Corinthians e grava cru em `bruto.espn_partidas`.

Incremental: busca só partidas encerradas que ainda não estão no bruto, mais as
dos últimos 7 dias (a fonte corrige dados depois do jogo). A tabela só recebe
linhas novas; a versão mais recente de cada partida é escolhida na transformação.

Uso: python pipeline/extrai_espn.py [--desde 2020]
"""

import argparse
import datetime
import json
import time
import urllib.request

from google.cloud import bigquery

TIME_ESPN = 874  # Corinthians
API = "https://site.api.espn.com/apis/site/v2/sports/soccer/all"
TABELA = "corinthians-dados.bruto.espn_partidas"
ENCERRADA = {"STATUS_FULL_TIME", "STATUS_FINAL_AET", "STATUS_FINAL_PEN"}
SCHEMA = [
    bigquery.SchemaField("id_evento", "STRING"),
    bigquery.SchemaField("data_partida", "TIMESTAMP"),
    bigquery.SchemaField("coletado_em", "TIMESTAMP"),
    bigquery.SchemaField("payload", "STRING"),  # JSON cru da ESPN
]


def baixa(url):
    req = urllib.request.Request(url, headers={"User-Agent": "corinthians-dados (github.com/niconalysis/corinthians)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def partidas_encerradas(desde):
    for temporada in range(desde, datetime.date.today().year + 1):
        for e in baixa(f"{API}/teams/{TIME_ESPN}/schedule?season={temporada}")["events"]:
            if e["competitions"][0]["status"]["type"]["name"] in ENCERRADA:
                yield temporada, e


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--desde", type=int, default=2020)
    args = parser.parse_args()

    bq = bigquery.Client(project="corinthians-dados")
    bq.create_table(bigquery.Table(TABELA, schema=SCHEMA), exists_ok=True)
    ja_coletadas = {r[0] for r in bq.query(f"SELECT DISTINCT id_evento FROM `{TABELA}`").result()}
    corte = (datetime.datetime.now(datetime.UTC) - datetime.timedelta(days=7)).isoformat()

    fila = [(t, e) for t, e in partidas_encerradas(args.desde) if e["id"] not in ja_coletadas or e["date"] >= corte]
    print(f"{len(ja_coletadas)} partidas já no bruto · {len(fila)} para baixar")

    linhas = []
    for i, (temporada, e) in enumerate(fila, 1):
        payload = baixa(f"{API}/summary?event={e['id']}")
        linhas.append({
            "id_evento": e["id"],
            "data_partida": e["date"],
            "coletado_em": datetime.datetime.now(datetime.UTC).isoformat(),
            "payload": json.dumps(payload, ensure_ascii=False),
        })
        print(f"{temporada} · {i}/{len(fila)} · {e['date'][:10]} · {e['name']} · ok", flush=True)
        time.sleep(0.5)  # gentileza com a API

    if linhas:
        config = bigquery.LoadJobConfig(schema=SCHEMA, write_disposition="WRITE_APPEND")
        bq.load_table_from_json(linhas, TABELA, job_config=config).result()
    print(f"{len(linhas)} partidas gravadas em {TABELA}")


if __name__ == "__main__":
    main()
