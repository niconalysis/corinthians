"""Exporta os dados da página "Público e Neo Química Arena" do site (site/publico.html) para JSON.

Gera `site/dados/publico.json` com um registro enxuto por jogo (data, temporada, adversário, mando, estádio, placar e
público) e um cadastro de adversários com o escudo. A página calcula médias, maiores públicos e aproveitamento no
navegador, para os filtros responderem na hora. Renda fica fora (decisão do Nico).

Público de jogo fora é o do estádio do adversário, então a página só usa o público dos jogos em casa.
Partida que só o legado tem não diz quem foi mandante: `casa` fica nulo e ela não entra em casa nem fora.
`nqa` marca os jogos na Neo Química Arena (id_estadio = 1 em marts.estadios).

Uso: python pipeline/exporta_publico.py
"""

import datetime
import json
import pathlib

PROJETO = "corinthians-dados"
SAIDA = pathlib.Path(__file__).resolve().parent.parent / "site" / "dados" / "publico.json"
ESCUDO_ESPN = "https://a.espncdn.com/i/teamlogos/soccer/500/{id}.png"
ID_NQA = 1

PARTIDAS = """
select
    p.id_partida,
    p.data,
    p.temporada,
    p.competicao,
    p.corinthians_mandante,
    p.id_adversario,
    a.adversario,
    p.gols_corinthians,
    p.gols_adversario,
    p.resultado,
    p.id_estadio,
    e.estadio,
    p.publico
from `corinthians-dados.marts.partidas` p
join `corinthians-dados.marts.adversarios` a using (id_adversario)
left join `corinthians-dados.marts.estadios` e using (id_estadio)
order by p.data, p.numero_no_ano
"""


def monta(partidas):
    """Junta as linhas da consulta (já ordenadas por data) no formato do site."""
    jogos, adversarios = [], {}
    for p in partidas:
        aid = str(p["id_adversario"])
        adversarios.setdefault(aid, {
            "nome": p["adversario"],
            "escudo_url": ESCUDO_ESPN.format(id=aid) if aid.isdigit() else None,
        })
        jogos.append({
            "id": str(p["id_partida"]),
            "d": p["data"],
            "t": p["temporada"],
            "comp": p["competicao"],
            "aid": aid,
            "casa": p["corinthians_mandante"],
            "nqa": p["id_estadio"] == ID_NQA,
            "est": p["estadio"],
            "f": p["gols_corinthians"],
            "c": p["gols_adversario"],
            "r": p["resultado"],
            "pub": p["publico"] or None,
        })
    return {
        "gerado_em": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "jogos": jogos,
        "adversarios": adversarios,
    }


def valor(v):
    return v.isoformat() if isinstance(v, (datetime.date, datetime.datetime)) else v


def main():
    from google.cloud import bigquery  # importado aqui para os testes e o exemplo rodarem sem a biblioteca

    bq = bigquery.Client(project=PROJETO)
    linhas = [{k: valor(v) for k, v in dict(l).items()} for l in bq.query(PARTIDAS).result()]
    conteudo = monta(linhas)
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(conteudo, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(conteudo['jogos'])} jogos gravados em {SAIDA}")


if __name__ == "__main__":
    main()
