CREATE TABLE partidas_cor(
	ID_Partida INT UNIQUE NOT NULL,
	Data DATE,
	Corinthians VARCHAR(15),
	Numero_Gols_Cor INT,
	ID_Adversario INT,
	Numero_Gols_Adv INT,
	ID_Tecnico_Cor INT,
	ID_Tecnico INT,
	ID_Campeonato INT,
	ID_Arbitro INT,
	ID_Estadio INT,
	Renda FLOAT,
	Publico INT
	PRIMARY KEY(ID_Partida),
	FOREIGN KEY(ID_Adversario) REFERENCES adversarios(ID_Adversario),
	FOREIGN KEY(ID_Tecnico_Cor) REFERENCES tecnicos_cor(ID_Tecnico_Cor),
	FOREIGN KEY(ID_Tecnico) REFERENCES tecnicos(ID_Tecnico),
	FOREIGN KEY(ID_Campeonato) REFERENCES campeonatos(ID_Campeonato),
	FOREIGN KEY(ID_Arbitro) REFERENCES arbitros(ID_Arbitro),
	FOREIGN KEY(ID_Estadio) REFERENCES estadios(ID_Estadio)
)

SELECT
	ID_Partida,
	Data,
	a.ID_Adversario,
	Renda,
	Publico,
	Nome_Estadio,
	Adversario,
	Numero_Gols_Adv,
	Numero_Gols_Cor
FROM partidas_cor as p
INNER JOIN estadios as e
ON e.ID_Estadio = p.ID_Estadio
INNER JOIN adversarios as a
ON a.ID_Adversario = p.ID_Adversario
WHERE YEAR(Data) = 2024


UPDATE partidas_cor
SET Renda = 0,
	Publico = 0
WHERE ID_Partida IN (142023, 152023,272023)


INSERT INTO partidas_cor
VALUES
(192025, '16/03/2025','Corinthians',1,9,0,3,1,3,8,19,5717077.40,40992)

