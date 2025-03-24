CREATE TABLE estadios(
	ID_Estadio INT UNIQUE NOT NULL,
	Nome_Estadio VARCHAR(300) UNIQUE,
	Cidade VARCHAR(100),
	Estado VARCHAR(100)
	PRIMARY KEY(ID_Estadio)
)

INSERT INTO estadios
VALUES
(71,'Estádio Monumental Isidro Romero Carbo','Guayaquil','','Equador','-2,18589','-79,92497')


SELECT *
FROM estadios
WHERE Estado = 'PE'

UPDATE estadios
SET Latitude = '-16,67086',
Longitude = '-49,26256'
WHERE ID_Estadio = 59
