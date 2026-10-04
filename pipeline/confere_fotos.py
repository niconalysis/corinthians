"""Mede quantos jogadores do cadastro têm foto na ESPN (e quantos teriam reserva no Transfermarkt).

Regra combinada com o Nico: se a ESPN cobrir 90% ou mais dos jogadores, o site usa só ela; senão, usa a ESPN e
completa com a foto do legado (Transfermarkt). O id do jogador no projeto é o id da ESPN.

Não precisa de BigQuery: lê o seed `dbt/seeds/cadastro_jogadores.csv`. Faz uma requisição HEAD por jogador, com pausa.

Uso: python pipeline/confere_fotos.py
"""

import csv
import json
import pathlib
import time
import urllib.error
import urllib.request

SEED = pathlib.Path(__file__).resolve().parent.parent / "dbt" / "seeds" / "cadastro_jogadores.csv"
FOTO_ESPN = "https://a.espncdn.com/i/headshots/soccer/players/full/{id}.png"
UA = "corinthians-dados/1.0 (github.com/niconalysis/corinthians)"
META = 0.90


def tem_foto(id_jogador):
    req = urllib.request.Request(FOTO_ESPN.format(id=id_jogador), method="HEAD", headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status == 200 and r.headers.get("Content-Type", "").startswith("image/")
    except urllib.error.HTTPError:
        return False


def main():
    with SEED.open(encoding="utf-8") as f:
        jogadores = list(csv.DictReader(f))

    com, sem = [], []
    for j in jogadores:
        (com if tem_foto(j["id_jogador"]) else sem).append(j)
        time.sleep(0.3)

    total = len(jogadores)
    reserva = [j for j in sem if (j.get("imagem_url") or "").startswith("http")]
    pct = len(com) / total if total else 0
    linhas = [
        f"Jogadores no cadastro: {total}",
        f"Com foto na ESPN: {len(com)} ({pct:.0%})",
        f"Sem foto na ESPN: {len(sem)}, dos quais {len(reserva)} têm reserva no Transfermarkt",
        f"Meta de {META:.0%}: {'atingida, usar só a ESPN' if pct >= META else 'não atingida, usar ESPN e completar com Transfermarkt'}",
        "Sem foto na ESPN: " + ", ".join(f"{j['nome']} ({j['id_jogador']})" for j in sem),
        "IDS_COM_FOTO_ESPN=" + json.dumps(sorted(j["id_jogador"] for j in com)),
    ]
    print("\n".join(linhas))


if __name__ == "__main__":
    main()
