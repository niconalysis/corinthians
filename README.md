# Corinthians em Números

Base histórica de todas as partidas do time principal do Sport Club Corinthians Paulista desde 2020 (placar, escalação, minutos jogados, gols, assistências, cartões, público, árbitro e técnicos), atualizada automaticamente e consolidada em um dashboard.

Dashboard (versão atual, alimentada pela base legada):
https://app.powerbi.com/view?r=eyJrIjoiMDIwNjU5ZWEtNWY2My00MmFiLThkNDUtNTY4YWQ3MDNjNjZlIiwidCI6Ijc0ZDI2NTU1LTE3MjgtNDcwNy1iNDk4LTYyYmQ2ZTdlYjQ1NiJ9

## Fases do projeto

**v1 – coleta manual (2020 a fev/2026)** em [`legado/`](legado/): fichas técnicas copiadas do portal Meu Timão, convertidas em IDs por notebooks Python e inseridas manualmente num SQL Server. Foram 421 partidas. O projeto pausou porque a coleta manual não escalava.

**v2 – pipeline automatizado com IA (em construção)**:

| Etapa | Status |
|---|---|
| 0. Organização do repositório e do legado | ✅ |
| 1. Projeto no Google Cloud / BigQuery | ✅ |
| 2. Carga da base legada no BigQuery | ✅ |
| 3. Extração automática (ESPN) | ✅ |
| 4. Modelagem e testes com dbt | ✅ |
| 5. Reconciliação legado × fonte automática, com IA | ✅ |
| 6. Árbitro e técnicos (ogol) | ⏳ |
| 7. Execução diária no GitHub Actions | ⏳ |
| 8. Novo dashboard | ⏳ |
| 9. Modelos preditivos com BigQuery ML | ⏳ |
| 10. Perguntas em linguagem natural | ⏳ |

## Documentação

- [`CONTEXT.md`](CONTEXT.md): glossário do domínio (o que é uma Partida, Escalação, Gol contra etc.)
- [`docs/adr/`](docs/adr/): registro das decisões de arquitetura e do porquê de cada uma

## Contato

- e-mail: nicolas.emerenciano@gmail.com
- LinkedIn: www.linkedin.com/in/nico-data
