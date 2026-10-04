"""Exporta os dados da página "Técnicos" do site (site/tecnicos.html) para JSON.

Gera `site/dados/tecnicos.json` com um registro por técnico do Corinthians: retrospecto geral, em casa e fora, por
temporada e por campeonato, artilheiros sob o comando dele, cartões, maiores sequências, melhor e pior resultado e a
lista de todos os jogos.

Partida sem técnico registrado fica de fora (o arquivo guarda quantas foram). Gol contra não entra na artilharia.
Partida que só o legado tem não diz quem foi mandante: não conta em casa nem fora.
A foto vem do seed cadastro_tecnicos (Transfermarkt, coleta do legado); técnico sem foto aparece com as iniciais.

Uso: python pipeline/exporta_tecnicos.py
"""

import collections
import datetime
import json
import pathlib

PROJETO = "corinthians-dados"
SAIDA = pathlib.Path(__file__).resolve().parent.parent / "site" / "dados" / "tecnicos.json"
TOP = 3
# Dois jogos separados por mais que isso, sem outro técnico no meio, contam como passagens diferentes.
DIAS_ENTRE_PASSAGENS = 120

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
    p.tecnico_corinthians as tecnico
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
    j.nome as autor
from `corinthians-dados.marts.gols` g
join `corinthians-dados.marts.jogadores` j on j.id_jogador = g.id_jogador
"""

CARTOES = """
select id_partida, tipo
from `corinthians-dados.marts.cartoes`
"""

FOTOS = """
select tecnico, foto_url
from `corinthians-dados.staging.cadastro_tecnicos`
"""


def zerado():
    return {"j": 0, "v": 0, "e": 0, "d": 0, "gp": 0, "gc": 0}


def soma(bloco, p):
    bloco["j"] += 1
    bloco[p["resultado"].lower()] += 1
    bloco["gp"] += p["gols_corinthians"]
    bloco["gc"] += p["gols_adversario"]


def resumo_jogo(p):
    return {"d": p["data"], "adv": p["adversario"], "f": p["gols_corinthians"], "c": p["gols_adversario"], "casa": p["corinthians_mandante"]}


def maior_sequencia(jogos, vale):
    """Maior sequência seguida de jogos (em ordem de data) em que `vale(jogo)` é verdadeiro."""
    melhor = atual = 0
    for p in jogos:
        atual = atual + 1 if vale(p) else 0
        melhor = max(melhor, atual)
    return melhor


def passagens(jogos):
    """Quantas vezes o técnico assumiu o time: um intervalo longo entre dois jogos dele vira uma nova passagem."""
    n = 1
    for antes, depois in zip(jogos, jogos[1:]):
        dias = (datetime.date.fromisoformat(depois["data"]) - datetime.date.fromisoformat(antes["data"])).days
        if dias > DIAS_ENTRE_PASSAGENS:
            n += 1
    return n


def monta(partidas, gols, cartoes, fotos):
    """Junta as linhas das consultas (partidas já ordenadas por data) em um registro por técnico."""
    artilharia = collections.defaultdict(collections.Counter)
    for g in gols:
        if g["favor"] and not g["contra"] and g["autor"]:
            artilharia[g["id_partida"]][g["autor"]] += 1
    cartoes_por_jogo = collections.defaultdict(collections.Counter)
    for c in cartoes:
        cartoes_por_jogo[c["id_partida"]][c["tipo"]] += 1

    por_tecnico = collections.OrderedDict()
    sem_tecnico = 0
    for p in partidas:
        if not p["tecnico"]:
            sem_tecnico += 1
            continue
        por_tecnico.setdefault(p["tecnico"], []).append(p)

    tecnicos = []
    for nome, jogos in por_tecnico.items():
        geral, casa, fora = zerado(), zerado(), zerado()
        por_temporada, comps, marcadores = {}, {}, collections.Counter()
        amarelos = vermelhos = 0
        for p in jogos:
            soma(geral, p)
            if p["corinthians_mandante"] is True:
                soma(casa, p)
            elif p["corinthians_mandante"] is False:
                soma(fora, p)
            soma(por_temporada.setdefault(str(p["data"])[:4], zerado()), p)
            c = comps.setdefault(p["competicao"] or "Outras", {"nome": p["competicao"] or "Outras", **zerado()})
            soma(c, p)
            marcadores.update(artilharia.get(p["id_partida"], {}))
            amarelos += cartoes_por_jogo[p["id_partida"]]["amarelo"]
            vermelhos += cartoes_por_jogo[p["id_partida"]]["vermelho"]

        vitorias = [p for p in jogos if p["resultado"] == "V"]
        derrotas = [p for p in jogos if p["resultado"] == "D"]
        saldo = lambda p: p["gols_corinthians"] - p["gols_adversario"]
        # Em empate de saldo, vale a mais recente (a lista vem em ordem de data, então max() fica com a primeira: invertemos).
        maior_v = max(reversed(vitorias), key=lambda p: (saldo(p), p["gols_corinthians"]), default=None)
        maior_d = min(reversed(derrotas), key=lambda p: (saldo(p), -p["gols_adversario"]), default=None)
        ordem = sorted(marcadores.items(), key=lambda kv: (-kv[1], kv[0]))

        tecnicos.append({
            "nome": nome,
            "foto_url": fotos.get(nome),
            "passagens": passagens(jogos),
            "geral": geral, "casa": casa, "fora": fora,
            "porT": dict(sorted(por_temporada.items())),
            "competicoes": sorted(comps.values(), key=lambda c: -c["j"]),
            "artilheiros": [{"nome": n, "gols": g} for n, g in ordem[:TOP]],
            "gols_com_autor": sum(marcadores.values()),
            "amarelos": amarelos, "vermelhos": vermelhos,
            "seq_invicto": maior_sequencia(jogos, lambda p: p["resultado"] != "D"),
            "seq_vitorias": maior_sequencia(jogos, lambda p: p["resultado"] == "V"),
            "primeiro": resumo_jogo(jogos[0]),
            "ultimo": resumo_jogo(jogos[-1]),
            "maior_vitoria": resumo_jogo(maior_v) if maior_v else None,
            "maior_derrota": resumo_jogo(maior_d) if maior_d else None,
            "jogos": [
                {"id": str(p["id_partida"]), "d": p["data"], "comp": p["competicao"], "casa": p["corinthians_mandante"],
                 "adv": p["adversario"], "adv_id": str(p["id_adversario"]),
                 "f": p["gols_corinthians"], "c": p["gols_adversario"], "r": p["resultado"], "est": p["estadio"]}
                for p in reversed(jogos)  # do mais recente para o mais antigo
            ],
        })
    tecnicos.sort(key=lambda t: (-t["geral"]["j"], t["nome"]))
    return {
        "gerado_em": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "sem_tecnico": sem_tecnico,
        "tecnicos": tecnicos,
    }


def valor(v):
    return v.isoformat() if isinstance(v, (datetime.date, datetime.datetime)) else v


def main():
    from google.cloud import bigquery  # importado aqui para os testes e o exemplo rodarem sem a biblioteca

    bq = bigquery.Client(project=PROJETO)
    consulta = lambda sql: [{k: valor(v) for k, v in dict(l).items()} for l in bq.query(sql).result()]
    fotos = {l["tecnico"]: l["foto_url"] for l in consulta(FOTOS) if l["foto_url"]}
    conteudo = monta(consulta(PARTIDAS), consulta(GOLS), consulta(CARTOES), fotos)
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(conteudo, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(conteudo['tecnicos'])} técnicos gravados em {SAIDA} ({conteudo['sem_tecnico']} partidas sem técnico)")


if __name__ == "__main__":
    main()
