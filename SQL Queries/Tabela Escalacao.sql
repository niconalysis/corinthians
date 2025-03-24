INSERT INTO escalacoes
VALUES
(192025,1),
(192025,21),
(192025,6),
(192025,9),
(192025,127),
(192025,24),
(192025,28),
(192025,23),
(192025,25),
(192025,35),
(192025,31),
(192025,38),
(192025,37),
(192025,44),
(192025,45),
(192025,30)








CREATE TABLE escalacoes(
	ID_Partida INT,
	ID_Jogador INT
)


DELETE
FROM escalacoes
WHERE ID_Partida = 222021

SELECT * FROM escalacoes
WHERE ID_Partida = 222021

ALTER TABLE escalacoes
ADD CONSTRAINT fk_constraint_name
FOREIGN KEY (ID_Jogador)
REFERENCES dbo.jogadores (ID_Jogador)

SELECT
	Nome,
	COUNT(*)
FROM escalacoes AS e
INNER JOIN jogadores AS j
	ON e.ID_Jogador = j.ID_Jogador
GROUP BY Nome
ORDER BY 2 DESC

SELECT *
FROM escalacoes AS e
INNER JOIN jogadores AS j
	ON e.ID_Jogador = j.ID_Jogador

UPDATE escalacoes
SET ID_Partida = CONCAT(ID_Partida,2024)