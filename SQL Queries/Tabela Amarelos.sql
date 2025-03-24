CREATE TABLE cartoes_amarelos(
	ID_Partida INT,
	ID_Jogador INT,
	FOREIGN KEY(ID_Jogador) REFERENCES jogadores(ID_Jogador)
)

UPDATE cartoes_amarelos
SET ID_Partida = CONCAT(ID_Partida,2024)

INSERT INTO cartoes_amarelos
VALUES
(192025, 127),
(192025, 37)

SELECT
	Nome,
	COUNT(*)
FROM cartoes_amarelos AS a
INNER JOIN jogadores AS j
ON a.ID_Jogador = j.ID_Jogador
GROUP BY Nome
ORDER BY 2 DESC

select * from cartoes_amarelos where ID_Partida = 532021
