CREATE TABLE gols_adversario(
	ID_Partida INT,
	Nome_Adversario VARCHAR(200),
)

INSERT INTO gols_adversario
VALUES
(62026, 'Jean Lucas'),
(62026, 'Willian José')

SELECT
	Nome_Adversario,
	COUNT(*)
FROM gols_adversario
GROUP BY Nome_Adversario
ORDER BY 2 DESC

UPDATE gols_adversario
SET Nome_Adversario = 'Vargas'
WHERE ID_Partida = 722022

SELECT * FROM gols_adversario WHERE ID_Partida = 42026
