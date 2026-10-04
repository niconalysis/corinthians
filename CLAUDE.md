# Corinthians em Números

Pipeline ESPN (+ ge.globo para técnicos) → BigQuery (`corinthians-dados`, região US) → dbt → dashboard. Glossário em `CONTEXT.md`, decisões em `docs/adr/`, roteiro no `README.md`.

## Como trabalhar aqui

- Responder em português do Brasil. O Nico está aprendendo git, cloud e dbt: explique cada comando novo na primeira vez que usar.
- Toda mudança vai em branch própria e PR; o Nico revisa e faz o merge. Nunca commitar direto na `main`.
- Fluxo principal de dados: ESPN + ge, automático. Nunca contornar bloqueio anti-robô (Meu Timão, FPF, Sofascore ficam de fora).
- Encontrou dado faltando ou dúvida factual (pendência)? Antes de disparar agentes, diga ao Nico quantas pendências são e de que tipo, e espere o ok: ele decide se vale gastar tokens. Com o ok, use a skill `resolver-pendencias`, que termina num PR.
- Custo zero: nada que exija API paga sem o Nico decidir.

## Comandos

- Python: `.venv/Scripts/python` (Windows). O gcloud fica em `%LOCALAPPDATA%/Google/Cloud SDK/google-cloud-sdk/bin` e precisa estar no PATH para o BigQuery autenticar.
- Extração: `.venv/Scripts/python pipeline/extrai_espn.py`
- Transformação e testes: `cd dbt && ../.venv/Scripts/dbt build --profiles-dir .`
