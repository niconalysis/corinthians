"""Exporta os dados da página "Rankings e recordes" do site (site/rankings.html) para JSON.

Gera `site/dados/rankings.json` com:
- jogadores: por temporada (jogos, gols, assistências, amarelos, vermelhos, jogos sem sofrer gol, gols sofridos);
  o site soma as temporadas que a pessoa escolher, então um único arquivo serve para "todas" e para cada ano;
- goleadas: todas as vitórias do Corinthians por 3 gols ou mais de diferença;
- cobertura: por temporada, quantos jogos existem, quantos têm escalação e quantos têm algum cartão registrado
  (a ESPN não registra cartões em alguns anos; o site avisa isso na página).

Regra do "jogo sem sofrer gol" (definida pelo Nico em 04/10/2026): vale para quem jogou de goleiro naquela partida e o
adversário não marcou enquanto ele estava em campo. É a mesma da página 2, por isso o código vem de exporta_jogadores.py.

Uso: python pipeline/exporta_rankings.py
"""

import datetime
import json
import pathlib

from google.cloud import bigquery

from exporta_jogadores import GRUPOS, PARTICIPACOES, gols_sofridos_em_campo
from exporta_site import FOTO_ESPN, JOGADORES_COM_FOTO_ESPN

PROJETO = "corinthians-dados"
SAIDA = pathlib.Path(__file__).resolve().parent.parent / "site" / "dados" / "rankings.json"
ESCUDO_ESPN = "https://a.espncdn.com/i/teamlogos/soccer/500/{id}.png"
SALDO_MINIMO_GOLEADA = 3

CARTOES = """
select
    cast(c.id_jogador as string) as id_jogador,
    j.nome,
    j.imagem_url,
    p.temporada,
    countif(c.tipo = 'amarelo') as amarelos,
    countif(c.tipo = 'vermelho') as vermelhos
from `corinthians-dados.marts.cartoes` c
join `corinthians-dados.marts.partidas` p using (id_partida)
join `corinthians-dados.marts.jogadores` j using (id_jogador)
group by 1, 2, 3, 4
"""

GOLEADAS = """
select
    p.id_partida,
    p.data,
    p.temporada,
    p.competicao,
    p.corinthians_mandante,
    cast(p.id_adversario as string) as id_adversario,
    a.adversario,
    p.gols_corinthians,
    p.gols_adversario,
    e.estadio
from `corinthians-dados.marts.partidas` p
left join `corinthians-dados.marts.adversarios` a using (id_adversario)
left join `corinthians-dados.marts.estadios` e using (id_estadio)
where p.gols_corinthians - p.gols_adversario >= {saldo}
order by p.gols_corinthians - p.gols_adversario desc, p.gols_corinthians desc, p.data desc
"""

COBERTURA = """
select
    p.temporada,
    count(*) as jogos,
    countif(p.id_partida in (select id_partida from `corinthians-dados.marts.escalacoes` where origem = 'espn')) as com_escalacao,
    countif(p.id_partida in (select id_partida from `corinthians-dados.marts.cartoes`)) as com_cartao
from `corinthians-dados.marts.partidas` p
group by 1
order by 1
"""


def zerada():
    return {"jogos": 0, "gols": 0, "ass": 0, "am": 0, "vm": 0, "cs": 0, "ga": 0}


def foto_do(id_jogador, imagem_url):
    return FOTO_ESPN.format(id=id_jogador) if id_jogador in JOGADORES_COM_FOTO_ESPN else imagem_url


def monta(participacoes, cartoes, goleadas, cobertura):
    """Junta as consultas no JSON da página. As participações já vêm ordenadas por data."""
    por_jogador = {}

    def registro(id_jogador, nome, imagem_url):
        j = por_jogador.setdefault(id_jogador, {"nome": nome, "imagem_url": imagem_url, "votos": {}, "porT": {}})
        j["nome"] = nome  # a linha mais recente vence
        return j

    for l in participacoes:
        j = registro(l["id_jogador"], l["nome"], l["imagem_url"])
        grupo = GRUPOS.get((l["pos"] or "").upper())
        if grupo:
            j["votos"][grupo] = j["votos"].get(grupo, 0) + 1
        t = j["porT"].setdefault(str(l["temporada"]), zerada())
        t["jogos"] += 1
        t["gols"] += l["gols"]
        t["ass"] += l["assistencias"]
        if grupo == "G":
            sofreu = gols_sofridos_em_campo(l)
            t["ga"] += sofreu
            t["cs"] += sofreu == 0

    for c in cartoes:
        j = registro(c["id_jogador"], c["nome"], c["imagem_url"])
        t = j["porT"].setdefault(str(c["temporada"]), zerada())
        t["am"] += c["amarelos"]
        t["vm"] += c["vermelhos"]

    jogadores = []
    for id_jogador, j in por_jogador.items():
        grupo = max(j["votos"], key=j["votos"].get) if j["votos"] else "M"
        jogadores.append({
            "id": id_jogador, "nome": j["nome"], "pos": grupo, "foto_url": foto_do(id_jogador, j["imagem_url"]),
            "porT": dict(sorted(j["porT"].items())),
        })

    return {
        "gerado_em": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "jogadores": jogadores,
        "goleadas": [
            {
                "id": g["id_partida"],
                "d": g["data"].isoformat() if isinstance(g["data"], (datetime.date, datetime.datetime)) else g["data"],
                "t": g["temporada"], "comp": g["competicao"], "casa": g["corinthians_mandante"],
                "adv": g["adversario"] or "Adversário",
                "escudo_url": ESCUDO_ESPN.format(id=g["id_adversario"]) if (g["id_adversario"] or "").isdigit() else None,
                "f": g["gols_corinthians"], "c": g["gols_adversario"], "est": g["estadio"],
            }
            for g in goleadas
        ],
        "cobertura": {
            str(c["temporada"]): {"jogos": c["jogos"], "escalacao": c["com_escalacao"], "cartoes": c["com_cartao"]}
            for c in cobertura
        },
    }


def main():
    bq = bigquery.Client(project=PROJETO)
    consulta = lambda sql: [dict(l) for l in bq.query(sql).result()]
    conteudo = monta(
        consulta(PARTICIPACOES),
        consulta(CARTOES),
        consulta(GOLEADAS.format(saldo=SALDO_MINIMO_GOLEADA)),
        consulta(COBERTURA),
    )
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(conteudo, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(conteudo['jogadores'])} jogadores e {len(conteudo['goleadas'])} goleadas gravados em {SAIDA}")


if __name__ == "__main__":
    main()
