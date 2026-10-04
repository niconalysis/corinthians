# Fontes automáticas: ESPN (principal) e ogol (complemento)

O Meu Timão, fonte original das fichas técnicas, passou a ficar atrás de um desafio anti-robô da Cloudflare, e a coleta manual foi o que travou o projeto. Escolhemos a API pública não documentada da ESPN como fonte principal (escalação com minutos, gols, cartões, posse e público, de 2020 até hoje, de graça e sem chave) e o ogol.com.br como complemento para árbitro e técnicos, campos que a ESPN não traz.

## Considered Options

- API-Football: o plano grátis não cobre a temporada atual; o pago custa US$ 19/mês.
- football-data.org: no plano grátis, só placar.
- Sofascore, FotMob, FBref, Transfermarkt: bloqueados ou com termos que proíbem extração automatizada.
- Borderôs da CBF e da FPF para a renda: OCR em PDFs escaneados e a FPF atrás da Cloudflare. A renda saiu do modelo.

## Consequences

As duas fontes são não oficiais e podem mudar sem aviso. O pipeline precisa falhar de forma ruidosa (sem gravar dados incompletos em silêncio) quando o formato mudar.
