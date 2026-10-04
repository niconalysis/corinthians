"""Gera as tabelas de correspondência (de-para) entre a base legada e a ESPN, gravadas em dbt/seeds/.

Método:
- Partidas: casam pela data (não há duas partidas no mesmo dia). 420 de 421; o amistoso com o Londrina
  (27/03/2024) não existe na ESPN.
- Jogadores: para cada jogador do legado, o atleta da ESPN que aparece nas mesmas escalações (≥ 80% dos
  jogos), desempatado pela semelhança do nome. Os casos que a regra não resolve foram revisados um a um
  (CORRECOES_JOGADORES).
- Estádios: o estádio do legado mais frequente nas partidas de cada estádio da ESPN, mais as correções
  revisadas (CORRECOES_ESTADIOS). Coordenadas do legado com sinais trocados foram corrigidas.
- Árbitros: o nome do legado mais frequente para cada nome da ESPN (a ESPN escreve "Sobrenome, Nome" e
  sem acentos).

Rodar uma vez: python legado/gera_de_para.py
"""

import collections
import csv
import difflib
import pathlib
import unicodedata

from google.cloud import bigquery

SEEDS = pathlib.Path(__file__).resolve().parent.parent / "dbt" / "seeds"
bq = bigquery.Client(project="corinthians-dados")

PARTIDAS_CASADAS = """
    select l.ID_Partida, e.id_partida as id_espn
    from legado.partidas_cor l
    join staging.stg_espn__partidas e on e.data = l.Data
"""

# Revisados manualmente: a coocorrência empata com titulares para quem jogou pouco ou tem apelido.
CORRECOES_JOGADORES = {
    53: [("371496", "apelido: Bahia = Luiz Gustavo (4 de 4 jogos juntos)")],
    13: [("361471", "apelido: Tchoca = João Pedro (21 de 21 jogos juntos)")],
    # Mesmo nome, pessoas diferentes: o legado lançou os jogos de 2025-26 do homônimo no mesmo ID.
    # O primeiro da lista é o dono do cadastro (data de nascimento confere com a ESPN).
    81: [("213260", "João Pedro, lateral, nasc. 15/11/1996 (2021-22)"),
         ("361471", "homônimo: jogos do Tchoca (zagueiro, nasc. 2003) lançados como João Pedro")],
    124: [("266673", "Vitinho, meia, nasc. 04/01/2000 (2021)"),
          ("171652", "homônimo: jogos do Vitinho atacante (nasc. 1993, 2025-26) lançados no mesmo ID")],
}

# id_estadio_espn -> id_estadio (legado ou novo). Revisados manualmente.
CORRECOES_ESTADIOS = {
    "5623": (57, "Serra Dourada; o legado chamava de Governo do Estado de Goiás (mesmas coordenadas)"),
    "7140": (38, "Hailé Pinheiro (Serrinha); a contagem por votos apontava para o Serra Dourada"),
    "6502": (47, "Jorge Ismael de Biasi (Novorizontino)"),
    "5294": (71, "Monumental Banco Pichincha = Isidro Romero Carbo; a ESPN informa a cidade errada (Quito)"),
    "10812": (54, "mesmo estádio, novo ID na ESPN"),
    "10773": (69, "mesmo estádio, novo ID na ESPN"),
    "5039": (32, "mesmo estádio"),
    "10770": (22, "mesmo estádio, novo ID na ESPN"),
    "10707": (26, "Engenhão: João Havelange = Nilton Santos"),
    "8296": (44, "mesmo estádio"),
    "10775": (76, "novo"),
    "5482": (77, "novo"),
    "10553": (78, "novo"),
    "3250": (79, "novo"),
}

# O legado tinha o mesmo árbitro cadastrado com duas grafias.
CORRECOES_ARBITROS = {"André Luis Skettino Policarpo Bento": "André Luiz Skettino Policarpo Bento"}

# Correções de dados do legado: sinal trocado nas coordenadas, cidade ou país errados.
CORRECOES_COORDENADAS = {
    40: {"longitude": -78.4707},
    41: {"longitude": -76.93568},
    42: {"longitude": -51.23678},
    43: {"longitude": -60.66146},
    44: {"longitude": -57.93856, "estadio": "Estádio Jorge Luis Hirschi"},
    46: {"latitude": -23.6697},
    29: {"cidade": "Avellaneda"},
    48: {"estado": "", "pais": "Bolívia"},
    57: {"estadio": "Estádio Serra Dourada"},
}

# Estádios que não existiam no legado (coordenadas do OpenStreetMap).
ESTADIOS_NOVOS = [
    (76, "Estadio Gigante de Arroyito", "Rosario", "", "Argentina", -32.914023, -60.674499),
    (77, "Estádio do Canindé", "São Paulo", "SP", "Brasil", -23.5205812, -46.6188461),
    (78, "Estadio Nemesio Camacho El Campín", "Bogotá", "", "Colômbia", 4.6459495, -74.0776054),
    (79, "Estadio Ciudad de Vicente López", "Florida", "", "Argentina", -34.5402643, -58.4816683),
]


def normaliza(nome):
    return " ".join(unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode().lower().split())


def semelhanca(a, b):
    a, b = normaliza(a), normaliza(b)
    por_palavra = max((difflib.SequenceMatcher(None, x, y).ratio() for x in a.split() for y in b.split()), default=0)
    return max(difflib.SequenceMatcher(None, a, b).ratio(), por_palavra * 0.9, 1.0 if a in b or b in a else 0)


def grava(nome, cabecalho, linhas):
    with open(SEEDS / nome, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(cabecalho)
        w.writerows(linhas)
    print(f"{nome}: {len(linhas)} linhas")


def jogadores():
    linhas = bq.query(f"""
        with m as ({PARTIDAS_CASADAS}),
        le as (select m.id_espn, e.ID_Jogador from m join legado.escalacoes e using (ID_Partida)),
        pa as (select id_partida as id_espn, id_jogador as espn, nome from staging.stg_espn__participacoes where do_corinthians),
        tot as (select ID_Jogador, count(*) as jogos from le group by 1)
        select le.ID_Jogador, j.Nome, t.jogos, pa.espn, any_value(pa.nome) as nome_espn, count(*) as n
        from le join pa using (id_espn) join tot t using (ID_Jogador) join legado.jogadores j using (ID_Jogador)
        group by 1, 2, 3, 4
    """).result()
    melhor = {}
    for r in linhas:
        taxa = r["n"] / r["jogos"]
        s = semelhanca(r["Nome"], r["nome_espn"])
        # Nome idêntico basta com taxa menor: jogos da Florida Cup não têm escalação na ESPN.
        if taxa < 0.8 and not (s == 1.0 and taxa >= 0.5):
            continue
        if r["ID_Jogador"] not in melhor or s + 0.2 * taxa > melhor[r["ID_Jogador"]][0]:
            melhor[r["ID_Jogador"]] = (s + 0.2 * taxa, r["espn"], f"coocorrência {r['n']}/{r['jogos']}, nome {s:.2f}")
    saida = []
    for id_legado, (_, espn, obs) in sorted(melhor.items()):
        if id_legado not in CORRECOES_JOGADORES:
            saida.append((id_legado, espn, obs))
    for id_legado, pares in CORRECOES_JOGADORES.items():
        saida += [(id_legado, espn, obs) for espn, obs in pares]
    repetidos = [e for e, c in collections.Counter(e for _, e, _ in saida).items() if c > 1]
    assert set(repetidos) <= {"361471"}, f"atleta ESPN casado com dois jogadores do legado: {repetidos}"
    grava("de_para_jogadores.csv", ["id_jogador_legado", "id_jogador", "observacao"], sorted(saida))


def estadios():
    votos = bq.query(f"""
        with m as ({PARTIDAS_CASADAS})
        select e.id_estadio, m2.ID_Estadio as id_legado, count(*) as n
        from m join staging.stg_espn__partidas e on e.id_partida = m.id_espn
        join legado.partidas_cor m2 on m2.ID_Partida = m.ID_Partida
        where e.id_estadio is not null
        group by 1, 2
        qualify row_number() over (partition by e.id_estadio order by count(*) desc) = 1
    """).result()
    de_para = {r["id_estadio"]: (r["id_legado"], f"mais frequente no legado ({r['n']} jogos)") for r in votos}
    de_para.update(CORRECOES_ESTADIOS)
    grava("de_para_estadios.csv", ["id_estadio_espn", "id_estadio", "observacao"],
          sorted((k, v, obs) for k, (v, obs) in de_para.items()))

    canonicos = []
    for r in bq.query("select * from legado.estadios order by ID_Estadio").result():
        num = lambda v: float(str(v).replace(",", ".")) if v not in (None, "") else None
        linha = {"id_estadio": r["ID_Estadio"], "estadio": r["Nome_Estadio"].strip(), "cidade": r["Cidade"].strip(),
                 "estado": (r["Estado"] or "").strip(), "pais": (r["País"] or "").strip(),
                 "latitude": num(r["Latitude"]), "longitude": num(r["Longitude"]), "origem": "legado"}
        linha.update(CORRECOES_COORDENADAS.get(r["ID_Estadio"], {}))
        canonicos.append(list(linha.values()))
    canonicos += [list(e) + ["openstreetmap"] for e in ESTADIOS_NOVOS]
    grava("cadastro_estadios.csv", ["id_estadio", "estadio", "cidade", "estado", "pais", "latitude", "longitude", "origem"], canonicos)


def arbitros():
    votos = bq.query(f"""
        with m as ({PARTIDAS_CASADAS})
        select e.arbitro as arbitro_espn, a.Nome_Arbitro as arbitro, count(*) as n
        from m join staging.stg_espn__partidas e on e.id_partida = m.id_espn
        join legado.partidas_cor l on l.ID_Partida = m.ID_Partida
        join legado.arbitros a using (ID_Arbitro)
        where e.arbitro is not null
        group by 1, 2
        qualify row_number() over (partition by e.arbitro order by count(*) desc) = 1
    """).result()
    de_para = {r["arbitro_espn"]: r["arbitro"].strip() for r in votos}
    de_para.update(CORRECOES_ARBITROS)
    grava("de_para_arbitros.csv", ["arbitro_espn", "arbitro"], sorted(de_para.items()))


def cadastro_jogadores():
    """Planilha de cadastro manual, pré-preenchida com os dados do legado."""
    de_para = {}
    with open(SEEDS / "de_para_jogadores.csv", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if "homônimo" not in r["observacao"]:
                de_para.setdefault(int(r["id_jogador_legado"]), []).append(r["id_jogador"])
    linhas = []
    for r in bq.query("select * from legado.jogadores order by ID_Jogador").result():
        ids = de_para.get(r["ID_Jogador"], [])
        if len(ids) != 1:  # sem par na ESPN
            continue
        linhas.append([ids[0], r["Nome"].strip(), r["Data_Nasc"] if r["Data_Nasc"] and r["Data_Nasc"].year > 1900 else "",
                       r["Cidade_Nasc"], r["Estado_Nasc"], r["Pais_Nasc"], r["Altura"] or "", r["Pe_Preferido"] or "",
                       r["Valor_Mercado"] or "", r["Imagem"] or ""])
    grava("cadastro_jogadores.csv", ["id_jogador", "nome", "data_nascimento", "cidade_nascimento", "estado_nascimento",
                                     "pais_nascimento", "altura_cm", "pe_preferido", "valor_mercado_eur", "imagem_url"],
          sorted(linhas))


if __name__ == "__main__":
    jogadores()
    estadios()
    arbitros()
    cadastro_jogadores()
