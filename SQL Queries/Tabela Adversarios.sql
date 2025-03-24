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


SELECT CONCAT('"',Adversario,'"',':',ID_Adversario,',') FROM adversarios WHERE ID_Adversario > 51

SELECT * FROM adversarios WHERE Estado = 'CE'
