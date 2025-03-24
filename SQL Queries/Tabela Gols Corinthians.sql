CREATE TABLE gols_corinthians(
	ID_Partida INT,
	ID_Jogador INT,
	FOREIGN KEY(ID_Jogador) REFERENCES jogadores (ID_Jogador)
)

select * from gols_corinthians

INSERT INTO gols_corinthians
VALUES
(192025,45)




SELECT
	ID_Partida,
	g.ID_Jogador,
	COUNT(g.ID_Jogador)
FROM gols_corinthians AS g
INNER JOIN jogadores AS j
ON g.ID_Jogador = j.ID_Jogador
GROUP BY ID_Partida, g.ID_Jogador
ORDER BY 3 DESC

GO
CREATE VIEW mais1gol AS
SELECT ID_Partida, Nome, COUNT(j.ID_Jogador) AS Total_Gols
FROM gols_corinthians AS g
INNER JOIN jogadores AS j
ON g.ID_Jogador = j.ID_Jogador
GROUP BY ID_Partida, Nome
HAVING COUNT(*) > 1
ORDER BY 3 DESC
GO

SELECT
	Nome,
	COUNT(Nome) AS VezesMais1Gol
FROM mais1gol
GROUP BY Nome
ORDER BY 2 DESC


UPDATE gols_corinthians
SET ID_Partida = CONCAT(ID_Partida,2024)
