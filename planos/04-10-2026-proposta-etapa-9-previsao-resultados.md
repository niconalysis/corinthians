# Etapa 9: previsão de resultados com BigQuery ML (proposta)

Status: **só estudo e plano. Nada foi implementado.** Quem decide o que fazer é o Nico.

## 1. Qual pergunta o modelo responde

> "Antes do apito inicial, qual a chance de o Corinthians **vencer, empatar ou perder** o próximo jogo?"

Por que essa e não "qual será o placar": prever o placar exato é bem mais difícil e rende pouco. Três probabilidades (ex.: 48% vitória, 27% empate, 25% derrota) são fáceis de mostrar no site e honestas sobre a incerteza.

Perguntas que ficam para depois, se esta der certo: total de gols da partida, chance de o Corinthians não sofrer gol.

## 2. Com quais dados (só o que existe ANTES do jogo)

A regra de ouro: o modelo só pode usar o que se sabia antes da partida. Usar placar, posse ou público do próprio jogo seria "fazer trapaça" e daria uma nota falsamente alta.

Tudo sai das tabelas que já existem em `marts` (467 partidas, 2020 em diante):

| Informação | Como calcular | De onde vem |
|---|---|---|
| Jogando em casa ou fora | já existe | `partidas.corinthians_mandante` |
| Competição | já existe | `partidas.competicao` |
| Forma recente do Corinthians | pontos, gols feitos e sofridos nos últimos 5 jogos | `partidas` |
| Forma recente do adversário | o mesmo, mas só dos jogos dele **contra o Corinthians** (não temos os outros jogos dele) | `partidas` |
| Histórico contra esse adversário | vitórias, empates e derrotas anteriores | `partidas` |
| Descanso | dias desde o jogo anterior | `partidas.data` |
| Técnico | técnico atual e quantos jogos ele já comandou | `partidas.tecnico_corinthians` |
| Força do time | uma nota tipo "Elo", que sobe com vitória e cai com derrota, calculada jogo a jogo | `partidas` |

Fica de fora, de propósito: público, posse, renda (renda já foi abandonada) e qualquer coisa que só se sabe depois do jogo.

Ponto de atenção: **só temos os jogos do Corinthians**. Não sabemos como o adversário anda contra os outros times. Isso limita a qualidade. Mais dados (resultados da liga inteira) exigiriam outra fonte e não estão no escopo.

## 3. Que tipo de modelo

Recomendo começar pelo mais simples e ir subindo só se valer a pena:

1. **Linha de base sem modelo:** "sempre prever vitória do time da casa" e "sempre a taxa histórica do Corinthians". É o piso: se o modelo não ganhar disso, ele não serve.
2. **Regressão logística** (`LOGISTIC_REG` no BigQuery ML): simples, dá as 3 probabilidades e mostra o peso de cada informação. Com ~420 jogos de treino, é a escolha mais segura.
3. **Árvores de decisão em conjunto** (`BOOSTED_TREE_CLASSIFIER`): só se a regressão logística deixar claramente a desejar. Com tão poucos jogos ele tende a "decorar" o passado.

Expectativa honesta: futebol tem muito acaso. Bons modelos públicos acertam algo perto de **50% a 55%** dos resultados (acertar o chute simples já dá uns 40 a 45%). Prometo ganho modesto sobre o piso, e isso é um resultado normal e aceitável num projeto de portfólio, desde que a avaliação seja honesta.

## 4. Como avaliar (sem se enganar)

- **Divisão por tempo, nunca aleatória:** treinar com 2020 a 2024, ajustar com 2025, e testar só em 2026. Embaralhar os jogos deixaria o modelo "ver o futuro".
- **Métricas:** taxa de acerto, e principalmente **log loss** (mede se as probabilidades são boas, não só o palpite) e **Brier score**, sempre comparadas com a linha de base.
- **Calibração:** quando o modelo diz 60%, vence mesmo uns 60% das vezes?
- **Teste de verdade, daqui para frente:** guardar a previsão de cada jogo futuro numa tabela ANTES do jogo e comparar com o resultado depois. É a prova mais convincente para o portfólio.

## 5. Custo esperado (meta: R$ 0)

- O BigQuery ML cobra pelo volume de dados lidos, como uma consulta normal. O nível grátis cobre 1 TB de consulta por mês (sujeito a conferência na tabela atual de preços do Google).
- Nossos dados são de poucos megabytes. Treinar e prever custam, na prática, centavos de fração de centavo. O alerta de R$ 1 do projeto continua de pé.
- Nada aqui usa API paga de IA. Etapa 10 (linguagem natural) é que traz esse risco, e é outra decisão.
- Alternativa 100% gratuita fora do BigQuery: treinar com scikit-learn dentro do GitHub Actions. Mas a etapa 9 do roteiro é justamente o BigQuery ML, e o objetivo de aprendizado do Nico é a nuvem Google, então recomendo ficar no BigQuery ML.

## 6. Como encaixa no projeto (plano de implementação, ainda não feito)

1. **Novo modelo dbt `marts.features_partidas`:** uma linha por jogo com as informações da seção 2, calculadas só com jogos anteriores. Com testes (por exemplo, "a forma recente nunca olha o próprio jogo").
2. **Pasta `ml/` com o SQL do modelo** (`CREATE MODEL`), versionado no GitHub como todo o resto.
3. **Treino e avaliação** com `ML.EVALUATE`, comparando com as linhas de base. Como esta sessão não tem login no BigQuery, o Nico roda uma vez ou o GitHub Actions roda por ele.
4. **Tabela `marts.previsoes_proximos_jogos`**, atualizada no pipeline diário (já existe o link do próximo jogo no ge, que ajuda a saber quem é o adversário).
5. **Página no site** (depois da página 1 e 2 prontas): "O que o modelo acha do próximo jogo", mostrando as 3 probabilidades e a nota de confiança honesta.
6. **ADR 0005** registrando a decisão e os limites, e a documentação no README.

Cada passo vira um PR pequeno, para o Nico revisar.

## 7. Riscos e como evito

| Risco | Como evito |
|---|---|
| Poucos jogos (~420 para treinar) | modelo simples, poucas informações, regularização |
| Vazamento do futuro | dbt calcula tudo com `rows between ... and 1 preceding`; teste automático |
| Nota falsamente alta | divisão por tempo e comparação com linha de base |
| Prometer demais no site | mostrar probabilidades e aviso claro de que é um estudo |
| Adversário com poucos jogos | cair na média geral quando não há histórico |

## 8. O que preciso do Nico para seguir

1. **Pergunta:** vitória/empate/derrota basta para a primeira versão? (recomendo que sim)
2. **Rodar no BigQuery:** ok para eu preparar o SQL e você (ou o GitHub Actions) rodar?
3. **Prioridade:** começar a implementação agora (passo 1, só o `features_partidas`) ou esperar o site ficar pronto?
