# Histórico completo do projeto — tudo o que foi discutido e decidido

Registro integral da sessão de retomada (03 e 04 de outubro de 2026), para que qualquer sessão futura tenha o mesmo contexto de quem participou dela. Nada aqui é opcional: se algo contradizer este arquivo, este arquivo é o que valeu na decisão original.

Leia também: `CLAUDE.md` (regras curtas), `CONTEXT.md` (glossário), `docs/adr/` (decisões formais), `README.md` (roteiro), `HANDOFF.md` (resumo operacional).

---

## 1. Ponto de partida

O Nico mantinha desde 2020 uma base das partidas do time principal do Corinthians, feita assim:
- Copiava à mão a ficha técnica de cada jogo no portal Meu Timão.
- Colava em notebooks Python que, com dicionários fixos (nome → ID) e cadeias de `if/elif` para apelidos ("Matheus França" → Matheuzinho), geravam os comandos `INSERT`.
- Rodava os inserts num SQL Server local (banco `Corinthians`).
- O Power BI lia esse banco e gerava o dashboard publicado.

**Por que parou:** em fev/2026, com 421 partidas registradas. O gargalo nunca foi copiar o texto, era mapear nomes e cadastrar entidades novas à mão. O Nico tentou fazer um crawler e não conseguiu.

**Por que o crawler não funcionava:** o Meu Timão está atrás de um desafio anti-robô da Cloudflare. Não é bug no código dele. **Regra do projeto: nunca contornar bloqueio anti-robô**, nem com autorização, por três motivos: viola os termos do site; fica ruim num repositório público de portfólio; e é frágil (quebra quando o desafio muda).

**O que já existia no repositório:** `SQL Queries/` (DDL e inserts soltos), `Python/` (4 notebooks de conversão), `PBi/` (3 arquivos .pbix) e `PowerPoint/` (imagens de fundo do dashboard e rascunhos).

---

## 2. O grill: todas as perguntas e respostas

As decisões abaixo foram tomadas pelo Nico em entrevista estruturada. Elas valem até ele mudar explicitamente.

| # | Pergunta | Resposta do Nico |
|---|---|---|
| Q1 | Objetivo: hobby, portfólio ou os dois? | **Os dois, com o portfólio decidindo em caso de conflito** |
| Q2 | Como os dados entram, já que o site bloqueia? | **Zero trabalho manual**; trocar de fonte sem problema |
| Q3 | Onde a base vive? | **BigQuery**, para aprender hospedagem, stack e git no caminho |
| Q4 | Manter o modelo ou corrigir fragilidades? | Manter, **mas quer minutos jogados e IDs dos adversários** |
| Q5 | De onde vinham assistências e posse? | Do Sofascore, anotadas à mão, jogo por jogo |
| Q6 | O que "implementar IA" significa? | **As quatro camadas** (construção, dados, ML, linguagem natural); não pretende mais escrever código |
| Q7 | Histórico: reconstruir ou migrar? | **Reconstruir pela fonte** e usar o legado para o que ela não trouxer |
| Q8 | Onde o pipeline roda? | **GitHub Actions** |
| Q9 | Conta no Google Cloud com cartão? | **Sim, desde que o custo seja zero** |
| Q10 | Organização do repositório e aula de git? | Aprovado; **manter o legado para comparar o antes e o depois** |
| Q11 | Gol contra: tipo de gol ou jogador? | **Tipo de gol** |
| Q12 | Aceita fontes não oficiais (ESPN + ogol)? | **Aceito** |
| Q13 | O que fazer com a renda? | **Abandonar no modelo novo** e manter só público |
| Q14 | Identidade da partida: número no ano ou ID da fonte? | **ID da fonte** |
| Q15 | Bio dos jogadores? | Usar os dados do legado e **gerar planilha para preencher quando convier** |
| Q16 | Renda histórica (2020 a fev/2026)? | **Manter só no legado**, fora do dashboard |
| Q17 | Como encaixar as 4 IAs com custo zero? | **Proposta de custo zero agora**; reavaliar o chat público depois |
| Q18 | Como transformar no BigQuery? | **dbt** |
| Q19/Q22 | Frequência do pipeline? | Primeiro sugeriu terça e sexta; ao saber que **não gasta tokens, aceitou todo dia** |
| Q20 | Acesso à base legada? | Autorizou conexão direta ao SQL Server local |
| Q21 | Quais .pbix versionar? | Só a "Versão Derradeira"; os de teste e rascunhos ficam fora |
| Q23 | O que é a tabela `aux`? | Não lembra; é uma lista de nomes de técnicos com repetição, sem uso conhecido |
| Q24 | Copiar o legado inteiro para o BigQuery? | **Sim** |
| Q25 | Ordem das etapas (0 a 10)? | Aprovada, **com explicação do conceito de PR aplicado ao projeto** |
| Q26 | lavish-axi e no-mistakes? | **lavish fora**; no-mistakes só depois da etapa 7 |
| Q27 | Região do BigQuery? | **US** (recursos de IA chegam primeiro) |
| Q28 | Nas divergências do histórico, qual fonte vale? | **Vale a ESPN sempre**; a auditoria guarda tudo |
| Q29 | Quatro conflitos que só quem viu resolve | Respondeu: **Jorge Ismael com o Novorizontino mandante; Antônio Accioly; Serrinha; gol do Wesley**. Sugeriu usar subagentes com busca no Google nesses casos |
| Q30 | Como editar os cadastros manuais? | **CSV no GitHub**, com a opção de agentes preencherem |
| Q31 | De onde vêm os técnicos? | Primeiro perguntou por que não contornar o ogol e sugeriu ge, UOL e Lance; depois de testar, aprovou o **ge.globo**. Pediu para **avisar quantas pendências sobram antes de gastar tokens** e para **não citar termos de uso da Globo na ADR** |
| Q32 | Autenticação do GitHub no Google Cloud? | **Workload Identity Federation** (sem chave) |

### Pedidos e observações do Nico fora das perguntas numeradas
- **Coordenadas dos estádios:** ele havia anotado latitude e longitude de todos os estádios para fazer um mapa no Power BI com pinos (por exemplo, gols por jogador por estádio). Isso precisa ser preservado. Estádios novos são geocodificados automaticamente no OpenStreetMap, com a planilha manual como reserva.
- **Agentes de pesquisa:** ele quer que o Claude os acione sozinho ao encontrar dúvida, mas **informando o volume antes**, para controlar o gasto de tokens.
- **Revisão por comentário no PR:** autorizou ligar o monitor (auto_fix + address_comments) em **todo** PR do projeto, para poder comentar na linha e o Claude corrigir.
- **Repositório é público** (`niconalysis/corinthians`). Já houve sessão afirmando que era privado, sem verificar: não repetir.
- **Hermes Agent:** avaliado e descartado para este projeto (API paga, pipeline precisa ser determinístico). Pode fazer sentido para a vida pessoal dele, em outra conversa.
- **Segundo cérebro:** pediu o report completo no vault Obsidian e a criação da skill `novo-projeto`. Quer que todo projeto dele vire uma nota.
- **Contexto:** sabe que contexto grande piora o desempenho; prefere sessão nova por etapa, com o estado em arquivos.

---

## 3. Pesquisa de fontes (feita antes de decidir)

Testadas com requisição simples, sem contornar bloqueio:

| Fonte | Resultado |
|---|---|
| **ESPN** (`site.api.espn.com`, API pública não documentada) | **Escolhida como principal.** Sem chave, sem bloqueio, 2020 até hoje, todas as competições juntas. Traz placar, estádio, público, escalação com titular/reserva e minutos, gols com minuto, cartões e posse |
| **ge.globo** | **Escolhida para técnicos** (etapa 6). `robots.txt` permite, sem Cloudflare, dado estruturado em JSON na página do jogo |
| ogol / zerozero | Era o plano inicial para técnicos; **passou a bloquear** (Cloudflare) e saiu |
| Meu Timão | Bloqueado (Cloudflare). Fonte da v1, abandonada |
| FPF (borderôs do Paulistão) | Bloqueado |
| Sofascore, FotMob, FBref, worldfootball | Bloqueados ou proibidos pelos termos |
| Transfermarkt | Tem valor de mercado e pé, mas os termos proíbem extração automatizada. Fora do pipeline |
| API-Football (grátis) | Não cobre a temporada atual |
| football-data.org (grátis) | Só placar |
| Súmulas e borderôs da CBF | Têm renda e público oficiais, mas parte é imagem escaneada (exigiria OCR) e só cobrem competições da CBF. Fora, junto com a decisão de abandonar a renda |
| Wikidata | Testado para técnicos; tem buracos (o Santos aparecia sem Diniz, Bustos e Lisca) e exigiria mapear cada clube. Descartado |

---

## 4. Arquitetura final

```
ESPN (API pública) ──┐
                     ├─► BigQuery "bruto" (JSON cru) ─► dbt staging ─► dbt marts ─► dashboard
ge.globo (técnicos) ─┘                                       ▲
SQL Server local → BigQuery "legado" ────────────────────────┘ (completa e confere)
```

- **Padrão ELT:** guarda cru primeiro, transforma depois. Se a fonte mudar, o histórico cru permite reprocessar.
- **Datasets:** `bruto`, `legado`, `staging`, `marts`, `auditoria`.
- **Projeto GCP:** `corinthians-dados`, número 168885872868, região **US**, faturamento ativo com alerta de orçamento de R$ 1. Custo esperado: R$ 0.

---

## 5. As etapas, uma por PR

| Etapa | PR | O que foi feito |
|---|---|---|
| 0 | #1 | Legado movido para `legado/` (com histórico preservado), `.gitignore`, `CONTEXT.md`, ADRs 0001 e 0002, README |
| 1 | #2 | Projeto GCP, faturamento, alerta, datasets `legado` e `bruto` na região US, ADR 0003 |
| 2 | #3 | `legado/carga_bigquery.py`: 17 tabelas copiadas, contagem conferida em todas |
| 3 | #4 | `pipeline/extrai_espn.py`: 466 partidas (182 MB de JSON cru), incremental |
| 4 | #5 | dbt: staging, marts (modelo estrela novo) e 43 testes |
| 5 | #6 | `legado/gera_de_para.py`, seeds de de-para e cadastro, auditoria de divergências |
| 5b | #7 | Skill `resolver-pendencias`, `auditoria.pendencias`, `CLAUDE.md`, ADR 0004; 5 jogadores cadastrados |
| — | #9 | Pendências: técnicos de 4 jogos da Libertadores |
| 6 | #8 | `pipeline/extrai_ge.py`: técnicos pelo ge |
| 7 | #10 | `pipeline.yml` (diário), `ci.yml` (dbt parse em PRs), autenticação sem chave |

---

## 6. O que o modelo novo tem a mais que a v1

- **Titular ou reserva e minutos jogados** por jogador e partida.
- **Gol contra como tipo de gol**, com o autor real (na v1 era o "jogador fictício 1000").
- **Autor de gol adversário com ID** (na v1 era só texto).
- **Minuto** de cada gol, assistência e cartão.
- **Placar de pênaltis**, resultado V/E/D, número da partida no ano como atributo.
- **Coluna `origem`** (espn, legado, correcao) em cada fato.
- **ID da partida vindo da fonte.** O ID antigo (número no ano + ano, `72026`) renumerava tudo quando um jogo antigo entrava depois, e confundia ano-calendário com temporada (a temporada 2020 terminou em fev/2021).

---

## 7. Achados nos dados

### Na base manual (v1)
- **Coordenadas com sinal trocado:** Beira-Rio, Banco Guayaquil, Monumental U, Marcelo Bielsa e Jorge Luis Hirschi (longitude positiva jogava o estádio na Ásia) e Bruno José Daniel (latitude positiva). Corrigidos, com teste que barra coordenada fora das Américas.
- **Homônimos no mesmo ID:** "João Pedro" (81, lateral, nasc. 15/11/1996) recebia jogos do Tchoca (zagueiro, nasc. 31/12/2003); "Vitinho" (124, meia, nasc. 04/01/2000) recebia jogos do Vitinho atacante (nasc. 09/10/1993). Confirmado pela data de nascimento na ESPN: são pessoas diferentes, não apelido repetido.
- "Governo do Estado de Goiás" era o Serra Dourada (mesmas coordenadas); o Presidente Perón fica em Avellaneda, não em Córdoba; o Hernando Siles estava com país "Brasil"; o mesmo árbitro aparecia com duas grafias (Skettino, Luis × Luiz).
- **Qualidade alta no essencial:** placar bate em **420 de 420** partidas comparáveis; vermelhos 51 × 51.

### Na ESPN
- **Não tem técnicos** em nenhum endpoint; **árbitro só a partir de 2022** (faltava em 47 jogos de 2020, 67 de 2021 e 12 de 2022); **Florida Cup 2020** (2 jogos) só com placar; **amistoso com o Londrina (27/03/2024)** não existe.
- **Lances por jogador perdem gols;** a narração (`keyEvents`) bate com o placar em 464 de 466. Por isso os gols vêm da narração. Nela, o time do evento é sempre quem **ganhou** o gol, inclusive no gol contra, e `participants[1]` é quem deu a assistência.
- **Disputa de pênaltis não entra nos lances** (vem em `shootoutScore`), então não contamina o placar.
- **Um titular omitido** no Palmeiras × Corinthians de 01/07/2024 (Gustavo Silva), completado pelo legado.
- Posse e público às vezes vêm como texto: conversão tolerante.

### Divergências entre as fontes (vale a ESPN, Q28)
Registradas em `auditoria.divergencias_legado_espn`: 27 partidas com amarelos diferentes, 9 com assistências, 3 com estádio, 2 com árbitro, 1 com gol, 1 com escalação. **Divergência registrada não é pendência:** já foi decidido que vale a ESPN. Só pesquisar se o Nico pedir.

### Conflitos resolvidos pelo Nico (Q29)
- **Novorizontino × Corinthians, 03/02/2025:** foi no **Jorge Ismael de Biasi**, com o Novorizontino mandante (a ESPN estava certa; o legado dizia Pacaembu).
- **Goiás × Corinthians, 02/09/2020:** foi na **Serrinha / Hailé Pinheiro** (a ESPN estava certa; o legado dizia Serra Dourada).
- **Atlético-GO × Corinthians, 04/06/2022:** foi no **Antônio Accioly** (o legado estava certo; a ESPN diz Serra Dourada) → virou correção manual.
- **Cianorte × Corinthians, 22/02/2024:** o gol dos 2 minutos é do **Wesley** (a ESPN registrava gol contra do Raphael) → virou correção manual.

---

## 8. A IA no projeto

- **Construção:** o Claude Code escreve o código; o Nico revisa e faz o merge. Ele não escreveu código na v2.
- **Reconciliação:** regras resolveram a maior parte (data para partidas; coocorrência nas escalações mais semelhança de nome para jogadores; votação por frequência para estádios e árbitros). Os casos difíceis foram revisados um a um e estão documentados, com o motivo, em `legado/gera_de_para.py`: apelidos (Bahia = Luiz Gustavo, Tchoca = João Pedro), homônimos, Engenhão como "João Havelange", a cidade errada da ESPN em Guayaquil.
- **Agentes de pesquisa (ADR 0004):** só para pendências e dúvidas factuais, nunca no pipeline diário. Subagentes Haiku, com regra de **duas fontes independentes que concordem**, e o resultado vira PR. Usados em: 5 jogadores sem cadastro (Lingard, Labyad, Allan, Vitinho atacante, Iago Machado) e 4 técnicos de jogos da Libertadores fora do Brasil.
- **Revisões do Nico sobre respostas de agente:** Labyad com **175 cm** (as fontes divergiam entre 173 e 175) e Vitinho nascido em **Rio de Janeiro, RJ** (o agente deixou a cidade vazia por ter só uma fonte).
- **Lições:** subagentes às vezes devolvem o ID do site pesquisado no lugar do ID da ESPN (conferir sempre a chave e validar a data de nascimento na API de atleta); e pistas erradas no prompt desviam a busca (no caso do Allan, o agente corrigiu uma pista errada que o Claude deu).

---

## 9. Automação em produção

- **Diário, 09:00 UTC (06h de Brasília):** `pipeline.yml` roda extração ESPN → `dbt build` → técnicos do ge → `dbt build`. Falha manda e-mail do GitHub.
- **Em cada PR:** `ci.yml` roda `dbt parse`.
- **Autenticação sem chave:** pool `github`, provedor `github-oidc` (condição `assertion.repository=='niconalysis/corinthians'`), conta de serviço `pipeline-github@corinthians-dados.iam.gserviceaccount.com` com apenas `bigquery.dataEditor` e `bigquery.jobUser`. Nenhuma credencial guardada.
- **Semanal (segunda, 8h):** tarefa agendada `corinthians-pendencias-semanais` no app desktop. Roda o dbt, lê `auditoria.pendencias` e **só informa**; não dispara agentes.
- Primeira execução na nuvem: 9 passos verdes em 3 min 22 s.

---

## 10. Armadilhas de ambiente (Windows)

- **gcloud fora do PATH do Git Bash:** `export PATH="$(cygpath "$LOCALAPPDATA/Google/Cloud SDK/google-cloud-sdk/bin"):$PATH"` e chamar `gcloud.cmd` / `bq.cmd`.
- **Parênteses em argumentos quebram o `gcloud.cmd`** (aconteceu no nome de exibição da conta de serviço).
- **Acentos aparecem como "�" no console** (os dados estão corretos): usar `PYTHONIOENCODING=utf-8`.
- **Rede, SQL Server e BigQuery exigem rodar fora do sandbox.**
- **Heredocs grandes com aspas no bash falham silenciosamente:** preferir a ferramenta Write.
- **O painel Terminal do app não abre** (integração do PowerShell quebrada): pedir ao Nico para rodar no PowerShell dele.
- **BigQuery não diferencia maiúsculas em nomes de coluna:** `USING (ID_Partida)` colide com `id_partida`; usar `ON`.
- **Seed e modelo com o mesmo nome quebram o dbt** (daí `cadastro_estadios` em vez de `estadios`).
- **Python 3.14 é o padrão da máquina** e o dbt 1.12 funciona nele. A `.venv` do projeto está nessa versão.
- O SQL Server local (`MSSQLSERVER`, banco `Corinthians`) não é mais necessário depois da etapa 2.

---

## 11. Preferências do Nico (do perfil global e observadas aqui)

- **Português do Brasil**, sem misturar inglês sem necessidade; revisar antes de entregar.
- **Crítico de verdade:** concordar só quando ele estiver certo, discordar como um amigo faria, usar nota de 0 a 10 ao avaliar ideias, não criticar por criticar.
- **Nunca presumir:** em pedido ambíguo, parar e perguntar; confirmar antes de trabalho grande.
- Raciocínio em passos, resumido. Respostas completas, mas econômicas.
- Formatação, nesta ordem: tópicos, texto corrido, cabeçalhos, tabelas.
- **Apontar proativamente** o que for relevante e não foi pedido.
- **Explicar cada comando novo de git e cloud na primeira vez.** Ele está aprendendo e quer isso.
- **Toda mudança em branch e PR;** ele faz o merge. Ligar o monitor de comentários em todo PR.
- **Antes de disparar agentes, informar o volume e esperar o ok** (tokens).
- Carreira: ele é analista de Marketing Ops (L1) na Loft e quer chegar a data science e ML. Decisões do projeto devem favorecer isso.

---

## 12. Estado em 04-10-2026 e próximos passos

**Números:** 467 partidas (466 da ESPN + o amistoso com o Londrina), 131 jogadores cadastrados, 79 estádios com coordenadas, 72 testes passando, 0 pendências. Artilheiro desde 2020: Yuri Alberto, 84 gols. Mais minutos: Cássio, 23.173 em 259 jogos.

**Etapas 8 a 10, pendentes:**
1. **Etapa 8, dashboard.** Começar com um grill curto (o que mostrar, para quem) antes de escolher entre Power BI apontando para o BigQuery (o v1 está em `legado/powerbi/`, as imagens em `legado/imagens/`) e outra ferramenta. Requisito confirmado: **mapa com pinos por estádio**, usando as coordenadas, por exemplo gols por jogador por estádio.
2. **Etapa 9:** BigQuery ML, modelos preditivos.
3. **Etapa 10:** perguntas em linguagem natural sobre a base; reavaliar aí o chat público, que teria custo de API (decisão adiada na Q17).

**Menores:** fixar `runs-on: ubuntu-24.04` nos workflows (o `ubuntu-latest` migra para o Ubuntu 26 em 19/10/2026); avaliar o `no-mistakes` (portão de PR com IA) agora que a etapa 7 está pronta, conforme a Q26.

**No vault Obsidian** (`F:\Obsidian Vault\books by nico`): nota-capa `30-projetos/Corinthians em Números/Corinthians em Números.md`, report em `outputs/04-10-2026-report-retomada-v2.md`, decisão em `40-decisoes/`, notas de conceito (ELT, Modelo estrela, dbt, BigQuery, GitHub), estudo (Engenharia de dados), temas (Futebol, Carreira, Projetos) e a skill `novo-projeto`. Ao fim de cada etapa: report novo em `outputs/` e estado atualizado na nota-capa. Sugerido ao Nico: registrar os outros projetos (BookTube, formulário de incentivos da Loft, MEI de troféus 3D) e configurar o Obsidian para criar notas novas em `00-inbox/`.
