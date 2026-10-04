# Corinthians em Números

Pipeline ESPN (+ ge.globo para técnicos) → BigQuery (`corinthians-dados`, região US) → dbt → dashboard.

**Leia `docs/HISTORICO.md` antes de decidir qualquer coisa**: ele tem tudo o que já foi discutido, testado e descartado, com o porquê. Glossário em `CONTEXT.md`, decisões formais em `docs/adr/`, roteiro no `README.md`, estado operacional no `HANDOFF.md`.

## Fatos que não devem ser redescobertos

- O repositório **`niconalysis/corinthians` é público**.
- **Divergência não é pendência.** `auditoria.divergencias_legado_espn` lista onde o legado e a ESPN discordam; já foi decidido que **vale a ESPN** e que o legado completa só o que falta. Não pesquisar divergência por conta própria: só se o Nico pedir. O que já foi tratado está no seed `divergencias_resolvidas.csv`.
- Pendência de verdade é só o que está em `auditoria.pendencias`.
- Fontes bloqueadas e descartadas (Meu Timão, ogol, FPF, Sofascore, FotMob, FBref, Transfermarkt): ver `docs/HISTORICO.md` seção 3. **Nunca contornar bloqueio anti-robô.**

## Como trabalhar aqui

- Responder em português do Brasil. O Nico está aprendendo git, cloud e dbt: explique cada comando novo na primeira vez que usar.
- Toda mudança vai em branch própria e PR; o Nico revisa e faz o merge. Nunca commitar direto na `main`. Depois de abrir o PR, ligue o monitor de comentários (`ccd_pr set_monitor`, auto_fix + address_comments) — já autorizado.
- Encontrou dúvida factual ou dado faltando? **Diga ao Nico quantas pendências são e de que tipo e espere o ok** (ele controla o gasto de tokens). Com o ok, use a skill `resolver-pendencias`, que termina num PR.
- Custo zero: nada que exija API paga sem o Nico decidir.
- Nunca presumir: em pedido ambíguo, pergunte. Confirme antes de trabalho grande.

## Comandos

- Python: `.venv/Scripts/python` (Windows). O gcloud fica em `%LOCALAPPDATA%/Google/Cloud SDK/google-cloud-sdk/bin` e precisa estar no PATH para o BigQuery autenticar: `export PATH="$(cygpath "$LOCALAPPDATA/Google/Cloud SDK/google-cloud-sdk/bin"):$PATH"`.
- Extração: `.venv/Scripts/python pipeline/extrai_espn.py` e `pipeline/extrai_ge.py`
- Transformação e testes: `cd dbt && ../.venv/Scripts/dbt build --profiles-dir .`
- Armadilhas do ambiente Windows (acentos, parênteses, sandbox, heredocs): `docs/HISTORICO.md` seção 10.
