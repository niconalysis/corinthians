# BigQuery na multirregião US, num projeto pessoal com faturamento ativo

Os dados ficam no projeto pessoal `corinthians-dados`, na multirregião US, e não em `southamerica-east1` (São Paulo). A região de um dataset não muda depois de criada, e os recursos de BigQuery ML e de IA generativa, que vamos usar nas etapas 9 e 10, chegam primeiro (ou só) à US. A latência não importa para um pipeline diário, e o custo no nível gratuito é o mesmo.

O faturamento fica ativo (com alerta de orçamento de R$ 1) porque, no modo sandbox, as tabelas expiram em 60 dias. O volume do projeto cabe no nível gratuito, então o custo esperado é zero.
