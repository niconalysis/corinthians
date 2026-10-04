CREATE TABLE assistencias_cor(
	ID_PARTIDA INT,
	ID_Jogador INT,
)

INSERT INTO assistencias_cor
VALUES
(72026,'9'),
(72026,'134')

SELECT DISTINCT ID_Partida FROM partidas_cor WHERE YEAR(Data) = 2021 AND Numero_Gols_Cor > 0

SELECT CONCAT(ID_Partida,',') FROM gols_corinthians WHERE ID_Partida LIKE '%2021'

SELECT * FROM assistencias_cor

