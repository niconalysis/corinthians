CREATE TABLE cartoes_amarelos(
	ID_Partida INT,
	ID_Jogador INT,
	FOREIGN KEY(ID_Jogador) REFERENCES jogadores(ID_Jogador)
)

INSERT INTO cartoes_amarelos
VALUES
(72026, 131),
(72026, 31),
(72026, 44),
(72026, 132)

UPDATE cartoes_amarelos
SET ID_Partida = CONCAT(ID_Partida,2024)

INSERT INTO cartoes_amarelos
VALUES
(42026, 7),
(42026, 9),
(42026, 130),
(42026, 131),
(42026, 35)
SELECT
	Nome,
	a.ID_Jogador,
	COUNT(*)
FROM cartoes_amarelos AS a
INNER JOIN jogadores AS j
ON a.ID_Jogador = j.ID_Jogador
GROUP BY Nome, a.ID_Jogador
ORDER BY 3 DESC

select * from cartoes_amarelos where ID_Partida = 532021
