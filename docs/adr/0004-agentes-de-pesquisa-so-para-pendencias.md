# Agentes de pesquisa só para pendências, sempre via PR

O pipeline de dados é determinístico (ESPN + ogol, todo dia, sem IA). Quando ele deixa um buraco (jogador novo sem cadastro, estádio sem coordenada, partida sem técnico) ou as fontes discordam, a pendência vai para `auditoria.pendencias`. Subagentes de IA (Haiku, rodando no Claude Code dentro da assinatura, sem API paga) pesquisam na web, exigem duas fontes que concordem e devolvem valor + URLs. O resultado vira linhas nos seeds de cadastro/correção e um PR que o Nico aprova.

## Considered Options

- **IA preenchendo tudo direto no pipeline:** descartado. Resultados de busca erram, e um pipeline diário precisa ser reproduzível. Além disso, rodar no GitHub Actions exigiria API paga.
- **Só correção manual:** foi o que travou o projeto na v1.

## Consequences

Nenhum dado de IA entra sem revisão humana e sem fonte registrada. As pendências esperam até alguém rodar a skill: dentro de qualquer sessão de trabalho (regra no `CLAUDE.md`) ou numa tarefa agendada semanal (etapa 7).
