"""Técnicos de cada partida a partir da página do jogo no ge.globo, gravados em `bruto.ge_tecnicos`.

A ESPN não informa técnicos. A página de cada jogo no ge traz os dois, num JSON embutido ("squads").
- Todo dia: lê a página do Corinthians no ge e guarda os links dos próximos jogos (`bruto.ge_links`).
- Para cada partida da ESPN posterior à base legada ainda sem técnico: usa o link guardado ou, se não
  houver, tenta os padrões de endereço do ge. Partidas não encontradas viram pendência (auditoria.pendencias).
Baixo volume de propósito: poucas requisições por partida, com pausa entre elas.

Uso: python pipeline/extrai_ge.py
"""

import datetime
import json
import re
import time
import unicodedata
import urllib.error
import urllib.request

from google.cloud import bigquery

PROJETO = "corinthians-dados"
UA = "corinthians-dados/1.0 (github.com/niconalysis/corinthians)"
PAGINA_TIME = "https://ge.globo.com/futebol/times/corinthians/"
INICIO = "2026-02-02"  # antes disso, os técnicos vêm da base legada

COMPETICOES = {
    "Brasileirão": ["brasileirao-serie-a"],
    "Copa do Brasil": ["copa-do-brasil"],
    "Libertadores": ["libertadores"],
    "Sul-Americana": ["copa-sul-americana"],
    "Paulista": ["campeonato-paulista", "paulistao"],
    "Supercopa do Brasil": ["supercopa-do-brasil", "supercopa-rei"],
    "Amistoso": ["amistosos"],
}
# Nome na ESPN -> grafias possíveis no endereço do ge, quando a regra simples (minúsculas, sem acento, hífens) não basta.
SLUGS = {
    "Red Bull Bragantino": ["bragantino"],
    "Vasco da Gama": ["vasco"],
    "Atlético-MG": ["atletico-mg"],
    "Atlético Goianiense": ["atletico-go"],
    "Athletico Paranaense": ["athletico-pr", "athletico-paranaense", "atletico-pr"],
    "Sport Recife": ["sport"],
    "Estudiantes de La Plata": ["estudiantes", "estudiantes-de-la-plata", "estudiantes-lp"],
    "Barra FC": ["barra", "barra-sc", "barra-fc"],
}
# Sucursais regionais do ge no interior e litoral de SP: jogos fora de casa nessas cidades usam esses endereços.
REGIOES_SP = ["tem-esporte", "campinas-e-regiao", "santos-e-regiao", "ribeirao-preto-e-regiao",
              "vale-do-paraiba-regiao", "sorocaba", "mogi-das-cruzes-suzano", "presidente-prudente-regiao"]

SCHEMA_LINKS = [bigquery.SchemaField("url", "STRING"), bigquery.SchemaField("data_jogo", "DATE"),
                bigquery.SchemaField("coletado_em", "TIMESTAMP")]
SCHEMA_TECNICOS = [bigquery.SchemaField("id_partida", "STRING"), bigquery.SchemaField("url", "STRING"),
                   bigquery.SchemaField("tecnico_corinthians", "STRING"),
                   bigquery.SchemaField("tecnico_adversario", "STRING"),
                   bigquery.SchemaField("coletado_em", "TIMESTAMP")]


def baixa(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Encoding": "identity"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read().decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise
    finally:
        time.sleep(0.5)


def slugs(nome):
    s = unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode().lower()
    return SLUGS.get(nome, [re.sub(r"[^a-z0-9]+", "-", s).strip("-")])


def tecnicos(html):
    """(técnico do Corinthians, técnico adversário) a partir da página do jogo, ou None."""
    i = html.find('"squads":')
    if i < 0:
        return None
    squads, _ = json.JSONDecoder().raw_decode(html, i + len('"squads":'))
    mandante = re.search(r'"homeTeam":\s*\{\s*"@type":\s*"SportsTeam",\s*"name":\s*"([^"]+)"', html)
    casa = (squads.get("homeTeam") or {}).get("coach") or {}
    fora = (squads.get("awayTeam") or {}).get("coach") or {}
    if not mandante or not (casa or fora):
        return None
    cor, adv = (casa, fora) if mandante.group(1) == "Corinthians" else (fora, casa)
    return cor.get("popularName") or cor.get("name"), adv.get("popularName") or adv.get("name")


def candidatos(p, links):
    """Endereços prováveis da página do jogo no ge: o link guardado e, se não houver, os padrões conhecidos."""
    datas = [p["data"] + datetime.timedelta(days=x) for x in (0, -1, 1)]
    for d in datas:
        yield from (u for u in links if f"/jogo/{d:%d-%m-%Y}/" in u)
    uf = (p["uf"] or "").lower()
    regioes = [f"{uf}/" if uf else "", ""]
    if uf == "sp" and p["corinthians_mandante"] is False:
        regioes += [f"sp/{r}/" for r in REGIOES_SP]
    for d in datas:
        for comp in COMPETICOES.get(p["competicao"], []):
            for r in dict.fromkeys(regioes if d == p["data"] else regioes[:2]):
                for adv in slugs(p["adversario"]):
                    t = f"{adv}-corinthians" if p["corinthians_mandante"] is False else f"corinthians-{adv}"
                    yield f"https://ge.globo.com/{r}futebol/{comp}/jogo/{d:%d-%m-%Y}/{t}.ghtml"


def main():
    bq = bigquery.Client(project=PROJETO)
    agora = datetime.datetime.now(datetime.UTC).isoformat()
    for tabela, schema in (("ge_links", SCHEMA_LINKS), ("ge_tecnicos", SCHEMA_TECNICOS)):
        bq.create_table(bigquery.Table(f"{PROJETO}.bruto.{tabela}", schema=schema), exists_ok=True)

    # 1. Links dos próximos jogos (o ge publica antes da partida)
    pagina = baixa(PAGINA_TIME) or ""
    novos = {u for u in re.findall(r"https://ge\.globo\.com/[a-z0-9/_-]*/jogo/\d\d-\d\d-\d{4}/[a-z0-9-]+\.ghtml", pagina)
             if "feminino" not in u}
    conhecidos = {r[0] for r in bq.query(f"SELECT url FROM `{PROJETO}.bruto.ge_links`").result()}
    linhas = [{"url": u, "data_jogo": datetime.datetime.strptime(re.search(r"/jogo/([\d-]+)/", u).group(1), "%d-%m-%Y").date().isoformat(),
               "coletado_em": agora} for u in novos - conhecidos]
    if linhas:
        bq.load_table_from_json(linhas, f"{PROJETO}.bruto.ge_links", job_config=bigquery.LoadJobConfig(schema=SCHEMA_LINKS)).result()
    print(f"{len(linhas)} links novos de jogos")

    # 2. Técnicos das partidas encerradas que ainda não têm
    links = conhecidos | novos
    fila = list(bq.query(f"""
        select p.id_partida, p.data, p.competicao, p.corinthians_mandante, a.adversario, e.estado as uf
        from `{PROJETO}.marts.partidas` p
        join `{PROJETO}.marts.adversarios` a using (id_adversario)
        left join `{PROJETO}.marts.estadios` e using (id_estadio)
        where p.data >= '{INICIO}' and p.origem = 'espn'
          and p.id_partida not in (select id_partida from `{PROJETO}.bruto.ge_tecnicos`)
        order by p.data
    """).result())
    print(f"{len(fila)} partidas sem técnico")

    achados, faltando = [], []
    for p in fila:
        for url in dict.fromkeys(candidatos(p, links)):
            html = baixa(url)
            if html and (t := tecnicos(html)):
                achados.append({"id_partida": p["id_partida"], "url": url, "tecnico_corinthians": t[0],
                                "tecnico_adversario": t[1], "coletado_em": agora})
                print(f"{p['data']} · {p['adversario']} · {t[0]} x {t[1]} · ok", flush=True)
                break
        else:
            faltando.append(p)
            print(f"{p['data']} · {p['adversario']} · não encontrado", flush=True)

    if achados:
        bq.load_table_from_json(achados, f"{PROJETO}.bruto.ge_tecnicos",
                                job_config=bigquery.LoadJobConfig(schema=SCHEMA_TECNICOS)).result()
    print(f"{len(achados)} partidas com técnico gravadas; {len(faltando)} não encontradas")


if __name__ == "__main__":
    main()
