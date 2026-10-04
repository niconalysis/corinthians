---
name: resolver-pendencias
description: Resolve as pendências de dados do projeto Corinthians (jogador sem cadastro, estádio sem coordenada, partida sem técnico ou árbitro) pesquisando na web com subagentes Haiku e abrindo um PR com as respostas e as fontes. Use quando o usuário pedir para resolver pendências, quando auditoria.pendencias tiver linhas, ou quando aparecer uma dúvida factual sobre uma partida ou jogador.
---

# Resolver pendências

O fluxo principal de dados é ESPN + ge.globo, automático. Esta skill cobre só o que eles não resolvem, e nunca grava nada sem passar por um PR que o Nico aprova (ADR 0004).

## 1. Ler a fila

```sql
select tipo, chave, descricao, destino from `corinthians-dados.auditoria.pendencias` order by tipo
```

Rode com o cliente Python da `.venv` (`google.cloud.bigquery`, projeto `corinthians-dados`). Antes, `dbt build` em `dbt/` para a fila estar atualizada.

Antes de pesquisar, informe ao Nico quantas pendências há, por tipo, e espere o ok: ele decide se vale gastar tokens.

## 2. Pesquisar em paralelo

Dispare **um subagente por pendência** (Agent, `model: haiku`, em background, todos na mesma mensagem). Com mais de 10 pendências, agrupe até 5 por subagente. Prompt-base:

> Pesquise na web e responda só com JSON. Pendência: {descricao}. Campos pedidos: {campos}.
> Regras: cada valor precisa de **duas fontes independentes que concordem** (Wikipedia, ge.globo, site oficial do clube ou da competição, imprensa esportiva). Se as fontes discordarem ou só houver uma, devolva o campo como null e explique em "duvidas". Não use dados de raspagem nem contorne bloqueios; leia só o que a busca entrega. Não invente.
> Formato: {"chave": "...", "campos": {...}, "fontes": ["url1", "url2"], "duvidas": "..."}

Campos por tipo:
- `jogador_sem_cadastro`: data_nascimento (AAAA-MM-DD), cidade_nascimento, estado_nascimento (sigla, só Brasil), pais_nascimento (em português), altura_cm, pe_preferido (Direito/Esquerdo/Ambidestro). Não pedir valor de mercado em lote: a fonte natural (Transfermarkt) proíbe extração automatizada.
- `estadio_sem_cadastro`: nome oficial, cidade, estado, país, latitude, longitude (coordenadas com sinal: hemisfério sul e oeste são negativos).
- `partida_sem_tecnico`: tecnico_corinthians, tecnico_adversario.
- `partida_sem_arbitro`: arbitro (árbitro principal).

## 3. Gravar e abrir o PR

- Grave cada resposta no `destino` indicado, com as URLs na coluna `observacao` (`correcoes_*.csv`) ou `fontes` (`cadastro_*.csv`), começando por "agente:" e registrando divergências entre fontes. No `cadastro_jogadores.csv`, mantenha a ordem por `id_jogador`.
- Confira a chave antes de gravar: os subagentes às vezes devolvem o ID do site pesquisado no lugar do ID da ESPN. Quando possível, valide a data de nascimento na API da ESPN (`site.web.api.espn.com/apis/common/v3/sports/soccer/athletes/{id}`).
- Campos null ficam vazios; liste-os no PR como "não resolvido".
- `dbt build` precisa passar.
- Branch `pendencias-AAAA-MM-DD`, commit, push e PR com uma tabela: pendência, valor, fontes, dúvidas. O Nico revisa e faz o merge.
