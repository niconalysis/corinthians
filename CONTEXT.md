# Corinthians em Números

Base histórica das partidas do time principal do Corinthians (2020 em diante) e de quem participou delas, usada para análise e dashboard.

## Linguagem

### Partida e contexto

**Partida**:
Um jogo oficial ou amistoso do time principal do Corinthians, com um único adversário, data e placar.
_Evitar_: jogo (em texto informal tudo bem), confronto

**Número da partida no ano**:
Posição da partida na ordem cronológica dentro do ano-calendário (1ª, 2ª, ...). É um atributo de exibição, não a identidade da partida: muda se uma partida antiga for incluída depois.

**Temporada**:
O ano esportivo de uma competição. Normalmente coincide com o ano-calendário, mas não sempre (a temporada 2020 terminou em fevereiro de 2021).
_Evitar_: usar "ano" quando se quer dizer temporada

**Mandante / Visitante**:
Papel do Corinthians na partida conforme a fonte. Não implica o estádio (o Corinthians pode ser mandante fora da Neo Química Arena).

**Competição**:
O torneio da partida (Brasileirão, Copa do Brasil, Paulista, Libertadores, Sul-Americana, Supercopa, Amistoso etc.). Variações de nome com patrocinador ou ano são a mesma competição.
_Evitar_: campeonato (só quando for de fato um campeonato), torneio

**Adversário**:
O clube enfrentado na partida.

**Técnico do Corinthians / Técnico adversário**:
Quem comandou cada lado na partida. São cadastros separados porque o interesse de análise é diferente.

**Estádio**:
Local onde a partida foi disputada, com cidade, país e coordenadas geográficas (latitude e longitude) para exibição em mapa. O mesmo estádio pode aparecer com nomes diferentes (nome comercial × nome histórico); é um único estádio.
_Evitar_: arena, local

**Árbitro**:
O árbitro principal da partida. Assistentes e VAR não fazem parte do modelo.

**Público**:
Torcedores presentes declarados para a partida. Zero quando os portões foram fechados; vazio quando a informação não existe. Zero e vazio são coisas diferentes.

**Renda**:
Arrecadação declarada da partida. Fora do modelo atual (sem fonte confiável); existe só na base legada.

### Participação

**Jogador**:
Atleta que entrou em campo pelo Corinthians em pelo menos uma partida.

**Escalação**:
O conjunto de jogadores do Corinthians que entraram em campo na partida, titulares e reservas utilizados. Reservas não utilizados ficam de fora.
_Evitar_: relacionados (que inclui quem não entrou)

**Titular / Reserva utilizado**:
Titular começa a partida; reserva utilizado entra durante ela.

**Minutos jogados**:
Tempo em campo de um jogador numa partida, da entrada à saída (ou ao fim).

**Gol do Corinthians**:
Gol que conta para o Corinthians no placar. Pode ser marcado por um jogador do Corinthians ou ser **gol contra** de um adversário.

**Gol contra**:
Tipo de gol: marcado por um jogador na própria meta, conta para o time oposto ao do autor. O autor é sempre um jogador real, nunca um registro fictício.

**Autor de gol adversário**:
Jogador do adversário que marcou gol contra o Corinthians, com identidade própria (não só o nome).

**Assistência**:
Passe que resulta diretamente num gol do Corinthians, creditado a um jogador do Corinthians.

**Cartão amarelo / Cartão vermelho**:
Advertência ou expulsão de um jogador do Corinthians na partida.

**Posse de bola**:
Percentual de posse do Corinthians na partida.

## Relações

- Uma **Partida** tem exatamente uma **Competição**, um **Adversário**, um **Árbitro**, um **Técnico do Corinthians** e um **Técnico adversário**
- Uma **Partida** tem uma **Escalação**; cada **Jogador** da escalação é **Titular** ou **Reserva utilizado** e tem **Minutos jogados**
- **Gols**, **Assistências** e **Cartões** pertencem a uma **Partida** e a um **Jogador**

## Ambiguidades sinalizadas

- O "Gol Contra" era tratado como um jogador fictício (ID 1000). Resolvido: gol contra é um tipo de gol.
- O autor de gol do adversário era guardado só pelo nome. Resolvido: passa a ter identidade própria.
- "Ano" da partida: ano-calendário ou temporada? Resolvido: são termos distintos (ver **Temporada**).

## Fonte e legado

**Base legada**:
Os dados coletados manualmente até fevereiro de 2026. Serve de referência para conferência e para campos que a fonte automática não cobre.

**Reconciliação**:
Comparar a base legada com a fonte automática e listar as divergências (placar, autores de gol, cartões).

**Cadastro manual**:
Dados de jogador que nenhuma fonte automática fornece (pé dominante, valor de mercado), preenchidos à mão quando conveniente. Opcionais.
