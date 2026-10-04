-- Um lance por linha (cartão, substituição), usado para minutos jogados e cartões.
-- Gols e assistências vêm da narração (stg_espn__gols), que é mais completa que os lances por jogador.
-- Disputas de pênaltis não aparecem aqui: ficam só no placar de pênaltis da partida.
select
    p.id_partida,
    p.id_time,
    p.do_corinthians,
    p.id_jogador,
    -- ponytail: ignora os acréscimos (90'+3' vira 90); trocar por clock.value se precisar de precisão de segundos
    cast(regexp_extract(string(l.clock.displayValue), r'^\d+') as int64) as minuto,
    bool(l.yellowCard) as cartao_amarelo,
    bool(l.redCard) as cartao_vermelho,
    bool(l.substitution) as substituicao
from {{ ref('stg_espn__participacoes') }} p,
    unnest(p.lances) l
