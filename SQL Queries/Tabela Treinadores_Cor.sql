CREATE TABLE tecnicos_cor(
	ID_Tecnico_Cor INT UNIQUE NOT NULL,
	Nome VARCHAR(200) NOT NULL,
	Data_Nasc DATE NOT NULL,
	Cidade_Nasc VARCHAR(200),
	Estado_Nasc VARCHAR(200),
	Pais_Nasc VARCHAR(200),
	Imagem VARCHAR(500),
	PRIMARY KEY (ID_Tecnico_Cor)
)

INSERT INTO tecnicos_cor
VALUES
(14,'Vagner Mancini','24/10/1966','Ribeirão Preto','SP','Brasil','Imagem')

SELECT concat('"',nome,'"',':',ID_Tecnico_Cor,',') FROM tecnicos_cor

SELECT * FROM tecnicos_cor