CREATE TABLE arbitros(
	ID_Arbitro INT UNIQUE NOT NULL,
	Nome_Arbitro VARCHAR(200),
	PRIMARY KEY(ID_Arbitro)
)


INSERT INTO arbitros
VALUES
(87,'Lucas Casagrande')

SELECT *
FROM arbitros
WHERE Nome_Arbitro LIKE '%nio%'
