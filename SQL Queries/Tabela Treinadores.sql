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
(141,'Segundo Castillo','15/05/1982','San Lorenzo','','Equador','Imagem')

SELECT concat('"',nome,'"',':',ID_Tecnico,',') FROM tecnicos WHERE ID_Tecnico > 80

SELECT * FROM tecnicos WHERE  Cidade_Nasc = 'Cidade'
SELECT * FROM tecnicos WHERE Nome LIKE '%iago%'

UPDATE tecnicos
SET 
	Nome = 'Mauricio Larriera'
WHERE ID_Tecnico = 132

