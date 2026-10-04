CREATE TABLE estadios(
	ID_Estadio INT UNIQUE NOT NULL,
	Nome_Estadio VARCHAR(300) UNIQUE,
	Cidade VARCHAR(100),
	Estado VARCHAR(100)
	PRIMARY KEY(ID_Estadio)
)

INSERT INTO estadios
VALUES
(75,'Estádio Benito Agnelo Castellano','Rio Claro','SP','Brasil','-22,41814','-47,5564')


SELECT *
FROM estadios
WHERE Estado = 'PE'

UPDATE estadios
SET Latitude = '-16,67086',
Longitude = '-49,26256'
WHERE ID_Estadio = 59

UPDATE estadios
SET Cidade = 'Cali'
WHERE ID_Estadio = 72
