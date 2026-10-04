"""Exporta os dados da página "Jogadores e estádios" do site (site/jogadores.html) para JSON.

Gera `site/dados/jogadores.json` com:
- estadios: jogos, vitórias, empates e derrotas por estádio, com latitude e longitude;
- jogadores: por temporada (jogos, gols, assistências, vitórias, jogos sem sofrer gol, gols sofridos),
  gols por estádio e os últimos jogos de cada um.

Regra do "jogo sem sofrer gol" (definida pelo Nico em 04/10/2026): vale para quem jogou de goleiro naquela partida
e o adversário não marcou enquanto ele estava em campo. Sem minutos (partidas que só o legado tem), vale o placar final.

Uso: python pipeline/exporta_jogadores.py
"""

import collections
import datetime
import json
import pathlib

from google.cloud import bigquery

from exporta_site import FOTO_ESPN, JOGADORES_COM_FOTO_ESPN

PROJETO = "corinthians-dados"
SAIDA = pathlib.Path(__file__).resolve().parent.parent / "site" / "dados" / "jogadores.json"
ULTIMOS = 6

# Posições da ESPN agrupadas em goleiro, defensor, meio-campo e atacante.
GRUPOS = {
    "G": "G", "GK": "G",
    "CD": "D", "CD-L": "D", "CD-R": "D", "CB": "D", "LB": "D", "RB": "D", "LWB": "D", "RWB": "D", "SW": "D", "D": "D",
    "DM": "M", "CM": "M", "CM-L": "M", "CM-R": "M", "AM": "M", "LM": "M", "RM": "M", "M": "M",
    "LW": "A", "RW": "A", "CF": "A", "CF-L": "A", "CF-R": "A", "F": "A", "SS": "A", "ST": "A",
}

ESTADIOS = """
select
    e.id_estadio,
    e.estadio,
    e.cidade,
    coalesce(nullif(e.estado, ''), e.pais) as uf,
    e.latitude,
    e.longitude,
    count(*) as jogos,
    countif(p.resultado = 'V') as v,
    countif(p.resultado = 'E') as e,
    countif(p.resultado = 'D') as d
from `corinthians-dados.marts.estadios` e
join `corinthians-dados.marts.partidas` p using (id_estadio)
where e.latitude is not null and e.longitude is not null
group by 1, 2, 3, 4, 5, 6
order by jogos desc
"""

# Uma linha por jogador em cada partida em que entrou em campo. A posição segue a mesma regra do campinho do painel.
PARTICIPACOES = """
with marcou as (
    select id_partida, cast(id_jogador as string) as id_jogador, count(*) as n
    from `corinthians-dados.marts.gols`
    where a_favor_do_corinthians and not coalesce(gol_contra, false) and id_jogador is not null
    group by 1, 2
),

assistiu as (
    select id_partida, cast(id_jogador as string) as id_jogador, count(*) as n
    from `corinthians-dados.marts.assistencias`
    where id_jogador is not null
    group by 1, 2
),

sofridos as (
    select id_partida, array_agg(minuto ignore nulls) as minutos, countif(minuto is null) as sem_minuto
    from `corinthians-dados.marts.gols`
    where not a_favor_do_corinthians
    group by id_partida
),

posicao_legado as (
    select dp.id_jogador, min(nullif(trim(lj.Posicao), '')) as posicao
    from `corinthians-dados.staging.de_para_jogadores` dp
    join `corinthians-dados.legado.jogadores` lj on lj.ID_Jogador = dp.id_jogador_legado
    group by dp.id_jogador
)

select
    cast(e.id_jogador as string) as id_jogador,
    j.nome,
    j.imagem_url,
    case
        when pa.posicao is null or pa.posicao in ('D', 'M', 'F', 'SUB') then coalesce(
            case pl.posicao
                when 'GOL' then 'G' when 'ZAG' then 'CD' when 'LAD' then 'RB' when 'LAE' then 'LB'
                when 'VOL' then 'DM' when 'MEI' then 'CM' when 'POD' then 'RW' when 'POE' then 'LW'
                when 'ATA' then 'CF'
            end,
            pa.posicao, j.posicao)
        else pa.posicao
    end as pos,
    p.id_partida,
    p.data,
    p.temporada,
    p.resultado,
    p.gols_corinthians,
    p.gols_adversario,
    a.adversario,
    cast(p.id_estadio as string) as id_estadio,
    e.minuto_entrada,
    e.minuto_saida,
    coalesce(m.n, 0) as gols,
    coalesce(s.n, 0) as assistencias,
    coalesce(sf.minutos, []) as minutos_sofridos,
    coalesce(sf.sem_minuto, 0) as sofridos_sem_minuto
from `corinthians-dados.marts.escalacoes` e
join `corinthians-dados.marts.partidas` p using (id_partida)
join `corinthians-dados.marts.jogadores` j using (id_jogador)
left join `corinthians-dados.marts.adversarios` a on a.id_adversario = p.id_adversario
left join `corinthians-dados.staging.stg_espn__participacoes` pa
    on pa.id_partida = e.id_partida and pa.id_jogador = cast(e.id_jogador as string)
left join posicao_legado pl on pl.id_jogador = cast(e.id_jogador as string)
left join marcou m on m.id_partida = e.id_partida and m.id_jogador = cast(e.id_jogador as string)
left join assistiu s on s.id_partida = e.id_partida and s.id_jogador = cast(e.id_jogador as string)
left join sofridos sf on sf.id_partida = e.id_partida
order by p.data, p.numero_no_ano
"""


def gols_sofridos_em_campo(linha):
    """Gols que o adversário fez enquanto o jogador estava em campo."""
    entrada, saida = linha["minuto_entrada"], linha["minuto_saida"]
    if entrada is None:  # partida só do legado: sem minutos, vale o placar final
        return linha["gols_adversario"]
    saida = 120 if saida is None else saida
    no_campo = sum(1 for m in linha["minutos_sofridos"] if entrada <= m <= saida)
    return no_campo + linha["sofridos_sem_minuto"]  # gol sem minuto conhecido conta como sofrido, por segurança


def monta(linhas, estadios):
    """Junta as participações (já ordenadas por data) em um registro por jogador."""
    por_jogador = collections.OrderedDict()
    for l in linhas:
        j = por_jogador.setdefault(l["id_jogador"], {"linhas": [], "nome": l["nome"], "imagem_url": l["imagem_url"]})
        j["nome"] = l["nome"]
        j["linhas"].append(l)

    jogadores = []
    for id_jogador, j in por_jogador.items():
        votos = collections.Counter(GRUPOS.get((l["pos"] or "").upper()) for l in j["linhas"])
        votos.pop(None, None)
        grupo = votos.most_common(1)[0][0] if votos else "M"

        por_temporada, por_estadio, ultimos = {}, collections.Counter(), []
        for l in j["linhas"]:
            t = por_temporada.setdefault(str(l["temporada"]), {"jogos": 0, "gols": 0, "ass": 0, "cs": 0, "ga": 0, "vit": 0})
            t["jogos"] += 1
            t["gols"] += l["gols"]
            t["ass"] += l["assistencias"]
            t["vit"] += l["resultado"] == "V"
            if l["gols"] and l["id_estadio"] is not None:
                por_estadio[l["id_estadio"]] += l["gols"]
            sofreu = None
            if GRUPOS.get((l["pos"] or "").upper()) == "G":
                sofreu = gols_sofridos_em_campo(l)
                t["ga"] += sofreu
                t["cs"] += sofreu == 0
            ultimos.append({
                "d": l["data"].isoformat() if isinstance(l["data"], (datetime.date, datetime.datetime)) else l["data"],
                "adv": l["adversario"] or "Adversário",
                "f": l["gols_corinthians"], "c": l["gols_adversario"],
                "g": l["gols"], "a": l["assistencias"], "s": sofreu,
            })

        foto = FOTO_ESPN.format(id=id_jogador) if id_jogador in JOGADORES_COM_FOTO_ESPN else j["imagem_url"]
        jogadores.append({
            "id": id_jogador, "nome": j["nome"], "pos": grupo, "foto_url": foto,
            "porT": dict(sorted(por_temporada.items())),
            "porE": dict(por_estadio),
            "ult": ultimos[-ULTIMOS:][::-1],
        })
    return {
        "gerado_em": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "estadios": estadios,
        "jogadores": jogadores,
    }


def main():
    bq = bigquery.Client(project=PROJETO)
    estadios = [
        {"id": str(l["id_estadio"]), "nome": l["estadio"], "cidade": l["cidade"], "uf": l["uf"],
         "lat": l["latitude"], "lng": l["longitude"], "jogos": l["jogos"], "v": l["v"], "e": l["e"], "d": l["d"]}
        for l in bq.query(ESTADIOS).result()
    ]
    linhas = [dict(l) for l in bq.query(PARTICIPACOES).result()]
    conteudo = monta(linhas, estadios)
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(conteudo, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(conteudo['jogadores'])} jogadores e {len(estadios)} estádios gravados em {SAIDA}")


if __name__ == "__main__":
    main()
