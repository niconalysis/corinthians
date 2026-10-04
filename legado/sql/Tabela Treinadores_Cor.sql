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
(16,'Dorival Júnior','25/04/1962','Araraquara','SP','Brasil','https://img.a.transfermarkt.technology/portrait/header/4724-1725987510.jpg?lm=1')

SELECT * FROM tecnicos_cor