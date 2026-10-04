"""Copia a base legada (SQL Server local, banco Corinthians) para o dataset `legado` do BigQuery.

Carga única e fiel: mesmos nomes de tabelas e colunas, mesmo conteúdo. Pode ser
rodada de novo sem duplicar (cada tabela é substituída).

Dependências: pip install pyodbc google-cloud-bigquery
Autenticação: gcloud auth application-default login
"""

import datetime

import pyodbc
from google.cloud import bigquery

SQL_SERVER = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=Corinthians;Trusted_Connection=yes"
DATASET = "corinthians-dados.legado"
TIPOS = {"int": "INT64", "float": "FLOAT64", "date": "DATE", "varchar": "STRING"}


def main():
    origem = pyodbc.connect(SQL_SERVER).cursor()
    bq = bigquery.Client(project="corinthians-dados")

    colunas = {}
    for tabela, coluna, tipo in origem.execute("""
        SELECT t.name, c.name, ty.name
        FROM sys.tables t
        JOIN sys.columns c ON c.object_id = t.object_id
        JOIN sys.types ty ON ty.user_type_id = c.user_type_id
        WHERE t.name <> 'sysdiagrams'
        ORDER BY t.name, c.column_id
    """).fetchall():
        colunas.setdefault(tabela, []).append((coluna, TIPOS[tipo]))  # KeyError = tipo novo, mapear

    for tabela, cols in colunas.items():
        nomes = [c for c, _ in cols]
        linhas = [
            {n: v.isoformat() if isinstance(v, datetime.date) else v for n, v in zip(nomes, row)}
            for row in origem.execute(f"SELECT * FROM [{tabela}]").fetchall()
        ]
        config = bigquery.LoadJobConfig(
            schema=[bigquery.SchemaField(c, t) for c, t in cols],
            write_disposition="WRITE_TRUNCATE",
        )
        bq.load_table_from_json(linhas, f"{DATASET}.{tabela}", job_config=config).result()

        destino = next(bq.query(f"SELECT COUNT(*) FROM `{DATASET}.{tabela}`").result())[0]
        assert destino == len(linhas), f"{tabela}: origem {len(linhas)} != destino {destino}"
        print(f"{tabela:20} {len(linhas):>6} linhas ok")


if __name__ == "__main__":
    main()
