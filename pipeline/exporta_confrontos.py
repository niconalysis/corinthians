"""Exporta os dados da página "Histórico de confrontos" do site (site/confrontos.html) para JSON.

Gera `site/dados/confrontos.json` com um registro por adversário: placar geral, em casa e fora, artilheiros dos dois
lados, árbitro que mais apitou, maior vitória e maior derrota, cartões do Corinthians, competições e todos os jogos.

O árbitro só existe em parte das partidas (antes de 2020 ele fica em branco, decisão do Nico), então "o que mais apitou"
considera só os jogos com árbitro e o arquivo guarda quantos jogos entraram na conta.
Gol contra não entra na artilharia de ninguém. Partida que só o legado tem não diz quem foi mandante: não conta em casa nem fora.

Uso: python pipeline/exporta_confrontos.py
"""

import collections
import datetime
import json
import pathlib

PROJETO = "corinthians-dados"
SAIDA = pathlib.Path(__file__).resolve().parent.parent / "site" / "dados" / "confrontos.json"
ESCUDO_ESPN = "https://a.espncdn.com/i/teamlogos/soccer/500/{id}.png"
TOP = 3

PARTIDAS = """
select
    p.id_partida,
    p.data,
    p.competicao,
    p.corinthians_mandante,
    p.id_adversario,
    a.adversario,
    p.gols_corinthians,
    p.gols_adversario,
    p.resultado,
    e.estadio,
    p.publico,
    p.arbitro
from `corinthians-dados.marts.partidas` p
join `corinthians-dados.marts.adversarios` a using (id_adversario)
left join `corinthians-dados.marts.estadios` e using (id_estadio)
order by p.data, p.numero_no_ano
"""

GOLS = """
select
    g.id_partida,
    g.a_favor_do_corinthians as favor,
    coalesce(g.gol_contra, false) as contra,
    coalesce(j.nome, ja.nome) as autor
from `corinthians-dados.marts.gols` g
left join `corinthians-dados.marts.jogadores` j on j.id_jogador = g.id_jogador
left join `corinthians-dados.marts.jogadores_adversarios` ja on ja.id_jogador = g.id_jogador
"""

CARTOES = """
select id_partida, tipo
from `corinthians-dados.marts.cartoes`
"""


def zerado():
    return {"j": 0, "v": 0, "e": 0, "d": 0, "gp": 0, "gc": 0}


def soma(bloco, p):
    bloco["j"] += 1
    bloco[p["resultado"].lower()] += 1
    bloco["gp"] += p["gols_corinthians"]
    bloco["gc"] += p["gols_adversario"]


def ranking(contador):
    """Os que mais marcaram; empate em gols fica em ordem alfabética para o arquivo não mudar à toa."""
    ordem = sorted(contador.items(), key=lambda kv: (-kv[1], kv[0]))
    return [{"nome": n, "gols": g} for n, g in ordem[:TOP]]


def resumo_jogo(p):
    return {"d": p["data"], "f": p["gols_corinthians"], "c": p["gols_adversario"], "casa": p["corinthians_mandante"]}


def monta(partidas, gols, cartoes):
    """Junta as linhas das três consultas (partidas já ordenadas por data) em um registro por adversário."""
    marcadores = collections.defaultdict(lambda: ([collections.Counter(), collections.Counter()]))
    for g in gols:
        if g["contra"] or not g["autor"]:
            continue
        marcadores[g["id_partida"]][0 if g["favor"] else 1][g["autor"]] += 1
    cartoes_por_jogo = collections.defaultdict(collections.Counter)
    for c in cartoes:
        cartoes_por_jogo[c["id_partida"]][c["tipo"]] += 1

    por_adv = collections.OrderedDict()
    for p in partidas:
        por_adv.setdefault(str(p["id_adversario"]), []).append(p)

    adversarios = []
    for id_adv, jogos in por_adv.items():
        geral, casa, fora = zerado(), zerado(), zerado()
        pro, contra = collections.Counter(), collections.Counter()
        arbitros, comps, estadios = collections.Counter(), {}, collections.Counter()
        amarelos = vermelhos = 0
        publico, com_publico = 0, 0
        for p in jogos:
            soma(geral, p)
            if p["corinthians_mandante"] is True:
                soma(casa, p)
            elif p["corinthians_mandante"] is False:
                soma(fora, p)
            c = comps.setdefault(p["competicao"] or "Outras", {"nome": p["competicao"] or "Outras", "j": 0, "v": 0, "e": 0, "d": 0})
            c["j"] += 1
            c[p["resultado"].lower()] += 1
            if p["arbitro"]:
                arbitros[p["arbitro"]] += 1
            if p["estadio"]:
                estadios[p["estadio"]] += 1
            if p["publico"]:
                publico += p["publico"]
                com_publico += 1
            m = marcadores.get(p["id_partida"])
            if m:
                pro.update(m[0])
                contra.update(m[1])
            amarelos += cartoes_por_jogo[p["id_partida"]]["amarelo"]
            vermelhos += cartoes_por_jogo[p["id_partida"]]["vermelho"]

        vitorias = [p for p in jogos if p["resultado"] == "V"]
        derrotas = [p for p in jogos if p["resultado"] == "D"]
        saldo = lambda p: p["gols_corinthians"] - p["gols_adversario"]
        # Em empate de saldo, vale a mais recente (a lista vem em ordem de data, então max() fica com a primeira: invertemos).
        maior_v = max(reversed(vitorias), key=lambda p: (saldo(p), p["gols_corinthians"]), default=None)
        maior_d = min(reversed(derrotas), key=lambda p: (saldo(p), -p["gols_adversario"]), default=None)
        mais_apitou = sorted(arbitros.items(), key=lambda kv: (-kv[1], kv[0]))[:1]

        adversarios.append({
            "id": id_adv,
            "nome": jogos[-1]["adversario"],
            "escudo_url": ESCUDO_ESPN.format(id=id_adv) if id_adv.isdigit() else None,
            "geral": geral, "casa": casa, "fora": fora,
            "artilheiros_cor": ranking(pro),
            "artilheiros_adv": ranking(contra),
            "arbitro": {
                "nome": mais_apitou[0][0] if mais_apitou else None,
                "jogos": mais_apitou[0][1] if mais_apitou else 0,
                "com_arbitro": sum(arbitros.values()),
            },
            "primeiro": resumo_jogo(jogos[0]),
            "ultimo": resumo_jogo(jogos[-1]),
            "maior_vitoria": resumo_jogo(maior_v) if maior_v else None,
            "maior_derrota": resumo_jogo(maior_d) if maior_d else None,
            "amarelos": amarelos, "vermelhos": vermelhos,
            "publico_medio": round(publico / com_publico) if com_publico else None,
            "estadio_mais_usado": estadios.most_common(1)[0][0] if estadios else None,
            "competicoes": sorted(comps.values(), key=lambda c: -c["j"]),
            "jogos": [
                {"id": str(p["id_partida"]), "d": p["data"], "comp": p["competicao"], "casa": p["corinthians_mandante"],
                 "f": p["gols_corinthians"], "c": p["gols_adversario"], "r": p["resultado"], "est": p["estadio"]}
                for p in reversed(jogos)  # do mais recente para o mais antigo
            ],
        })
    adversarios.sort(key=lambda a: (-a["geral"]["j"], a["nome"]))
    return {
        "gerado_em": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "adversarios": adversarios,
    }


def valor(v):
    return v.isoformat() if isinstance(v, (datetime.date, datetime.datetime)) else v


def main():
    from google.cloud import bigquery  # importado aqui para os testes e o exemplo rodarem sem a biblioteca

    bq = bigquery.Client(project=PROJETO)
    consulta = lambda sql: [{k: valor(v) for k, v in dict(l).items()} for l in bq.query(sql).result()]
    conteudo = monta(consulta(PARTIDAS), consulta(GOLS), consulta(CARTOES))
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(conteudo, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(conteudo['adversarios'])} adversários gravados em {SAIDA}")


if __name__ == "__main__":
    main()
