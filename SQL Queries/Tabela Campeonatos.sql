CREATE TABLE campeonatos(
	ID_Campeonato INT UNIQUE NOT NULL,
	Nome_Campeonato VARCHAR(200) NOT NULL,
	PRIMARY KEY(ID_Campeonato)
)

INSERT INTO campeonatos
VALUES
(8,'Florida Cup')

SELECT
	CONCAT('"',Nome_Campeonato,'"',':',ID_Campeonato,',')
FROM campeonatos


SELECT * FROM campeonatos
