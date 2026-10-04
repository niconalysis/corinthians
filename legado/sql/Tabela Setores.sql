CREATE TABLE setor_campo(
	ID_Setor INT UNIQUE NOT NULL,
	Nome_Setor VARCHAR(200)
	PRIMARY KEY (ID_Setor)
)

INSERT INTO setor_campo
VALUES
	(4,'Gol Contra')