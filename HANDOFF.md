# HANDOFF — Corinthians em Números (atualizado em 04-10-2026)

Leia também: `CLAUDE.md` (regras do projeto), `CONTEXT.md` (glossário), `docs/adr/` (decisões), `README.md` (roteiro de etapas). Report completo no vault do Nico: `F:\Obsidian Vault\books by nico\30-projetos\Corinthians em Números\`.

## Goal

Portfólio de dados e IA do Nico (analista de Marketing Ops, quer migrar para data science/ML) sobre todas as partidas do time principal do Corinthians desde 2020. Pipeline 100% automático e com custo zero: ESPN + ge.globo → BigQuery → dbt → dashboard. O Nico não escreve código: o Claude constrói, e ele revisa e faz o merge de cada PR, aprendendo git e cloud no caminho.

## Current Progress

Etapas 0 a 7 concluídas e mergeadas (PRs #1 a #10 em niconalysis/corinthians):

- **0** Repositório organizado: base manual antiga em `legado/`, `.gitignore`, `CONTEXT.md`, ADRs.
- **1** Projeto GCP pessoal `corinthians-dados` (número 168885872868), faturamento ativo + alerta de orçamento de R$ 1, região **US**.
- **2** `legado/carga_bigquery.py`: cópia fiel das 17 tabelas do SQL Server local (banco `Corinthians`) para o dataset `legado`.
- **3** `pipeline/extrai_espn.py`: JSON cru de cada partida em `bruto.espn_partidas` (append-only, incremental, reprocessa os últimos 7 dias).
- **4/5** dbt em `dbt/`: `staging` (ESPN e legado), `marts` (partidas, escalacoes com minutos, gols com gol contra como tipo, assistencias, cartoes, jogadores, jogadores_adversarios, adversarios, estadios), `auditoria` (divergencias_legado_espn, pendencias). Seeds de de-para gerados por `legado/gera_de_para.py`, mais cadastros editáveis (`cadastro_jogadores.csv`, `cadastro_estadios.csv`) e correções com fonte (`correcoes_partidas.csv`, `correcoes_gols.csv`). **72 testes, 0 erros, 0 avisos.**
- **5b** Skill do projeto `.claude/skills/resolver-pendencias/` (subagentes Haiku, duas fontes, resultado vira PR) e ADR 0004.
- **6** `pipeline/extrai_ge.py`: técnicos lidos do JSON `"squads"` da página do jogo no ge; guarda o link do próximo jogo (`bruto.ge_links`) a partir da página do Corinthians no ge.
- **7** `.github/workflows/pipeline.yml`: diário às 09:00 UTC (06h BRT), ESPN → dbt → ge → dbt; `ci.yml` roda `dbt parse` em PRs. Autenticação sem chave via Workload Identity Federation (pool `github`, provedor `github-oidc`, conta de serviço `pipeline-github@corinthians-dados.iam.gserviceaccount.com`, só o repositório niconalysis/corinthians). A primeira execução passou (3m22s).
- Tarefa agendada no app desktop `corinthians-pendencias-semanais` (segunda, 8h): roda o dbt, lê `auditoria.pendencias` e **só informa**, sem disparar agentes.

Estado dos dados: 467 partidas (466 ESPN + amistoso Londrina 27/03/2024, só no legado), todas com estádio, coordenada, árbitro e técnicos; 0 pendências.

## What Worked

- **Casar partidas legado ↔ ESPN pela data local** (não há duas partidas no mesmo dia): 420/421. Placar bate em 420/420.
- **Jogadores:** coocorrência nas escalações (≥ 80%) + semelhança de nome; casos difíceis revisados à mão (apelidos, homônimos: João Pedro 81 e Vitinho 124 juntavam duas pessoas, resolvido pela data de nascimento da ESPN).
- **Gols pela narração (`keyEvents`), não pelos lances por jogador:** bate com o placar em 464/466. Na narração, o time do evento é sempre quem ganhou o gol (inclusive gol contra); `participants[1]` é a assistência.
- **ge.globo para técnicos:** o `robots.txt` permite, sem Cloudflare. Endereço `ge.globo.com/{uf}/futebol/{competicao}/jogo/{dd-mm-aaaa}/{mandante}-{visitante}.ghtml`; o interior de SP usa sucursais (`sp/santos-e-regiao/`, `sp/tem-esporte/`...); jogo fora do Brasil vai sem prefixo.
- **API de atleta da ESPN** (`site.web.api.espn.com/apis/common/v3/sports/soccer/athletes/{id}`) para validar a data de nascimento.
- **Geocodificação** no OpenStreetMap Nominatim (1 requisição/s, com User-Agent).
- **Subagentes Haiku** com regra de duas fontes, conferidos depois (chave e data de nascimento).

## What Didn't Work / armadilhas

- **Meu Timão, ogol, FPF, Sofascore, FotMob, FBref:** bloqueados (Cloudflare) ou com termos proibitivos. **Nunca contornar bloqueio anti-robô.** API-Football grátis não cobre a temporada atual.
- **ESPN não tem técnicos**; árbitro só a partir de 2022; Florida Cup 2020 só com placar (o legado completa).
- **Windows/ambiente:**
  - O gcloud não está no PATH do Git Bash: use `export PATH="$(cygpath "$LOCALAPPDATA/Google/Cloud SDK/google-cloud-sdk/bin"):$PATH"` e chame `gcloud.cmd`/`bq.cmd`.
  - Parênteses em argumentos quebram o `gcloud.cmd`.
  - O console exibe acento como "�" (os dados estão certos): use `PYTHONIOENCODING=utf-8`.
  - Acesso a rede/SQL Server/BigQuery exige rodar fora do sandbox.
  - Heredocs grandes com aspas no bash falharam silenciosamente: prefira a ferramenta Write.
  - O painel Terminal do app não abre (integração do PowerShell quebrada): peça para o Nico rodar no PowerShell dele.
- **BigQuery:** nomes de coluna não diferenciam maiúsculas: `USING (ID_Partida)` colide com `id_partida`; use `ON`.
- **Seed e modelo com o mesmo nome** quebram o dbt (por isso existe `cadastro_estadios`).
- **Subagentes** às vezes devolvem o ID do site pesquisado em vez do ID da ESPN; pistas erradas no prompt desviam a busca.

## Preferências do Nico (importante)

- Português do Brasil; explicar cada comando novo de git ou cloud na primeira vez.
- Toda mudança em branch + PR; ele revisa e faz o merge. **Ligar o monitor de comentários do PR** (`set_monitor` auto_fix + address_comments) em todo PR, sem perguntar (já autorizado).
- Confirmar antes de trabalho grande; **antes de disparar agentes, informar quantas pendências e esperar o ok** (tokens).
- Crítico e honesto (nota 0–10 quando avaliar ideias); custo zero sem decisão dele.
- Não quis nota sobre termos de uso do ge na ADR.
- Decisões: nas divergências do histórico vale a ESPN (Q28); renda só no legado; cadastros manuais em CSV no GitHub.

## Next Steps

1. **Etapa 8, dashboard:** fazer um grill rápido (o que mostrar, para quem) antes de escolher a ferramenta: Power BI apontando para o BigQuery (o v1 está em `legado/powerbi/Corinthians - Versao Derradeira.pbix`, imagens em `legado/imagens/`) ou outra. Requisito confirmado: **mapa com pinos por estádio** (gols por jogador por estádio, usando latitude/longitude de `marts.estadios`).
2. Opcional: fixar `runs-on: ubuntu-24.04` no `pipeline.yml` e no `ci.yml` (o `ubuntu-latest` migra para 26 em 19/10/2026).
3. **Etapa 9:** BigQuery ML (modelos preditivos). **Etapa 10:** perguntas em linguagem natural (reavaliar chat público, que teria custo de API).
4. Depois da etapa 7 estabilizar: avaliar `no-mistakes` (portão de PR com IA). `lavish-axi` e Hermes foram descartados para este projeto.
5. Vault: o Nico gostou da skill `novo-projeto` (`90-sistema/skills/novo-projeto.md`); sugerido registrar os outros projetos (BookTube, formulário de incentivos da Loft, MEI de troféus 3D). Sugerido também configurar o Obsidian para criar notas novas em `00-inbox/`.
6. Ao fim de cada etapa: report novo em `30-projetos/Corinthians em Números/outputs/` e estado atualizado na nota-capa `Corinthians em Números.md` do vault.
