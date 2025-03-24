CREATE TABLE cartoes_vermelhos(
	ID_Partida INT,
	ID_Jogador INT,
	FOREIGN KEY(ID_Jogador) REFERENCES jogadores(ID_Jogador)
)

UPDATE cartoes_vermelhos
SET ID_Partida = CONCAT(ID_Partida,2024)

INSERT INTO cartoes_vermelhos
VALUES
(732021,19)