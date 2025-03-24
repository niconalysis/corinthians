CREATE TABLE adversarios(
	ID_Adversario INT UNIQUE NOT NULL,
	Adversario VARCHAR(300),
	Estado VARCHAR(200),
	País VARCHAR(200),
	PRIMARY KEY(ID_Adversario)
)

INSERT INTO adversarios
VALUES
(71,'Barcelona de Guayaquil','','Equador')
