CREATE TABLE tecnicos(
	ID_Tecnico INT UNIQUE NOT NULL,
	Nome VARCHAR(200) NOT NULL,
	Data_Nasc DATE NOT NULL,
	Cidade_Nasc VARCHAR(200),
	Estado_Nasc VARCHAR(200),
	Pais_Nasc VARCHAR(200),
	Imagem VARCHAR(500),
	PRIMARY KEY (ID_Tecnico)
)

INSERT INTO tecnicos
VALUES
(149,'Martín Palermo','07/11/1973','La Plata','','Argentina','Imagem')

SELECT * FROM tecnicos WHERE Nome LIKE '%Mancini%'

UPDATE tecnicos
SET 
	Data_Nasc = '12/05/1961'
WHERE ID_Tecnico = 142

