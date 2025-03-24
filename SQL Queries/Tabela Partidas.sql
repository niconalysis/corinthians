CREATE TABLE partidas_cor(
	ID_Partida INT UNIQUE NOT NULL,
	Data DATE,
	Corinthians VARCHAR(15),
	Numero_Gols_Cor INT,
	ID_Adversario INT,
	Numero_Gols_Adv INT,
	ID_Tecnico_Cor INT,
	ID_Tecnico INT,
	ID_Campeonato INT,
	ID_Arbitro INT,
	ID_Estadio INT,
	Renda FLOAT,
	Publico INT
	PRIMARY KEY(ID_Partida),
	FOREIGN KEY(ID_Adversario) REFERENCES adversarios(ID_Adversario),
	FOREIGN KEY(ID_Tecnico_Cor) REFERENCES tecnicos_cor(ID_Tecnico_Cor),
	FOREIGN KEY(ID_Tecnico) REFERENCES tecnicos(ID_Tecnico),
	FOREIGN KEY(ID_Campeonato) REFERENCES campeonatos(ID_Campeonato),
	FOREIGN KEY(ID_Arbitro) REFERENCES arbitros(ID_Arbitro),
	FOREIGN KEY(ID_Estadio) REFERENCES estadios(ID_Estadio)
)

SELECT
	ID_Partida,
	Data,
	a.ID_Adversario,
	Renda,
	Publico,
	Nome_Estadio,
	Adversario,
	Numero_Gols_Adv,
	Numero_Gols_Cor
FROM partidas_cor as p
INNER JOIN estadios as e
ON e.ID_Estadio = p.ID_Estadio
INNER JOIN adversarios as a
ON a.ID_Adversario = p.ID_Adversario
WHERE YEAR(Data) = 2024

UPDATE partidas_cor
SET Renda = 1020837,
	Publico = 30793
WHERE ID_Partida = 682024


UPDATE partidas_cor
SET Renda = 0,
	Publico = 0
WHERE ID_Partida IN (142023, 152023,272023)


--temporada 2023
INSERT INTO partidas_cor
VALUES
(192025, '16/03/2025','Corinthians',1,9,0,3,1,3,8,19,5717077.40,40992)

SELECT *
FROM partidas_cor



INSERT INTO partidas_cor
VALUES
	/*(1,'21/01/2024','Corinthians',1,1,0,2,40,3,1,1,2551343.5,42357),
    (2,'24/01/2024','Corinthians',0,2,1,2,43,3,2,2,996075,14688),
    (3,'27/01/2024','Corinthians',0,3,1,2,25,3,3,3,578480,6783),
    (4,'30/01/2024','Corinthians',1,4,2,2,38,3,4,1,2488558.5,43080),
    (5,'04/02/2024','Corinthians',1,5,3,2,9,3,2,1,2343488,39407),
    (6,'07/02/2024','Corinthians',0,6,1,5,13,3,5,4,883595,13861),
    (7,'11/02/2024','Corinthians',2,7,0,1,31,3,6,1,2473056,39592),
    (8,'14/02/2024','Corinthians',4,8,1,1,28,3,7,5,NULL,NULL),
    (9,'18/02/2024','Corinthians',2,9,2,1,1,3,8,6,1557484,29647),
    (10,'22/02/2024','Corinthians',3,10,0,1,42,2,9,7,NULL,NULL),
    (11,'25/02/2024','Corinthians',0,11,1,1,5,3,2,1,2339123.5,41118),
    (12,'02/03/2024','Corinthians',3,12,2,1,24,3,5,1,2656331,43379),
    (13,'10/03/2024','Corinthians',0,13,0,1,6,3,6,3,328320,7261),
    (14,'14/03/2024','Corinthians',2,3,0,1,25,2,10,3,NULL,NULL),
    (15,'27/03/2024','Corinthians',3,14,0,1,12,6,11,8,NULL,NULL),
    (16,'02/04/2024','Corinthians',1,15,1,1,11,4,12,9,NULL,NULL),
    (17,'09/04/2024','Corinthians',4,16,0,1,41,4,13,1,1999933.1,32246),
    (18,'14/04/2024','Corinthians',0,17,0,1,17,1,14,1,2784292.5,44285),
    (19,'17/04/2024','Corinthians',0,18,2,1,36,1,15,10,NULL,NULL),
    (20,'20/04/2024','Corinthians',0,19,1,1,29,1,16,11,490705,9466),
    (21,'23/04/2024','Corinthians',0,20,1,1,27,4,17,12,NULL,NULL),
    (22,'28/04/2024','Corinthians',3,21,0,1,14,1,18,1,2521430,41839),
    (23,'01/05/2024','Corinthians',2,22,1,1,26,2,19,13,NULL,NULL),
    (24,'04/05/2024','Corinthians',0,23,0,1,20,1,20,1,2761561,42456),
    (25,'07/05/2024','Corinthians',2,16,0,1,41,4,21,14,NULL,NULL),
    (26,'11/05/2024','Corinthians',0,24,2,1,39,1,18,15,3140720.5,56929),
    (27,'14/05/2024','Corinthians',4,20,0,1,27,4,22,1,2257103.5,39929),
    (28,'22/05/2024','Corinthians',2,22,1,1,26,2,23,1,2226652.5,39108),
    (29,'28/05/2024','Corinthians',3,15,0,1,11,4,24,1,2322336,40353),
    (30,'01/06/2024','Corinthians',0,25,1,1,3,1,25,1,2614293.5,40397),
    (31,'11/06/2024','Corinthians',2,26,2,1,19,1,9,16,724840,11372),
    (32,'16/06/2024','Corinthians',2,4,2,1,22,1,18,1,2673323.5,45747),
    (33,'19/06/2024','Corinthians',0,27,1,1,10,1,26,17,821310,13033),
    (34,'23/06/2024','Corinthians',1,28,1,1,8,1,20,18,1786120,33689),
    (35,'26/06/2024','Corinthians',1,29,1,1,30,1,27,1,2099895,38219),
    (36,'01/07/2024','Corinthians',0,9,2,1,1,1,25,19,4065419.05,41175),
    (37,'04/07/2024','Corinthians',3,30,2,4,38,1,28,1,2096669,37689),
    (38,'07/07/2024','Corinthians',0,31,3,4,15,1,29,20,3137608,55186),
    (39,'10/07/2024','Corinthians',0,32,2,4,32,1,16,21,937505,18420),
    (40,'16/07/2024','Corinthians',2,33,1,3,7,1,30,1,2694764.5,42965),
    (41,'21/07/2024','Corinthians',1,34,0,3,37,1,20,22,1875718,47096),
    (42,'25/07/2024','Corinthians',2,35,2,3,35,1,29,1,2705605.5,45183),
    (43,'28/07/2024','Corinthians',1,17,2,3,17,1,15,23,3010301.27,44048),
    (44,'31/07/2024','Corinthians',0,35,0,3,35,2,31,1,2624941,43014),
    (45,'04/08/2024','Corinthians',1,18,1,3,19,1,23,1,2648449,43497),
    (46,'07/08/2024','Corinthians',0,35,0,3,35,2,15,24,NULL,NULL),
    (47,'10/08/2024','Corinthians',1,19,1,3,29,1,20,1,2525324,41750),
    (48,'13/08/2024','Corinthians',2,19,1,3,29,4,22,5,NULL,11674),
    (49,'17/08/2024','Corinthians',0,21,0,3,23,1,10,15,NULL,30470),
    (50,'20/08/2024','Corinthians',1,19,2,3,29,4,32,1,2515840,42118),
    (51,'25/08/2024','Corinthians',0,23,1,3,20,1,20,25,1283676,49378),
    (52,'29/08/2024','Corinthians',1,18,2,3,19,2,9,10,277750,14117),
    (53,'01/09/2024','Corinthians',2,24,1,3,39,1,18,1,2589611,45237),
    (54,'11/09/2024','Corinthians',3,18,1,3,19,2,26,1,2594584,45199),
    (55,'14/09/2024','Corinthians',1,25,2,3,3,1,25,26,2115360,28752),
    (56,'17/09/2024','Corinthians',2,23,0,3,20,4,33,25,1344658,45331),
    (57,'21/09/2024','Corinthians',3,26,0,3,40,1,15,1,2585075,46001),
    (58,'24/09/2024','Corinthians',3,23,0,3,20,4,17,1,2510922.5,44453),
    (59,'29/09/2024','Corinthians',1,4,3,3,22,1,16,27,2928201.5,25898),
    (60,'02/10/2024','Corinthians',0,24,1,3,16,2,34,15,6450065,47052),
    (61,'05/10/2024','Corinthians',2,27,2,3,36,1,23,1,2595477,44597),
    (62,'17/10/2024','Corinthians',5,28,2,3,21,1,34,1,2447030.5,44116),
    (63,'20/10/2024','Corinthians',0,24,0,3,16,2,25,1,3023876,46426),
    (64,'24/10/2024','Corinthians',2,36,2,3,18,4,35,1,2579514,43841),
    (65,'28/10/2024','Corinthians',1,29,0,3,4,1,15,28,1818680,16680),
    (66,'31/10/2024','Corinthians',1,36,2,3,18,4,22,29,NULL,NULL),
    (67,'04/11/2024','Corinthians',2,9,0,3,1,1,34,1,2514796,46085),
    (68,'09/11/2024','Corinthians',2,30,1,3,38,1,15,30,NULL,NULL),
    (69,'20/11/2024','Corinthians',2,31,1,3,14,1,30,1,2552660,45756),
    (70,'24/11/2024','Corinthians',3,32,1,3,32,1,36,1,2563923.5,45767),
    (71,'30/11/2024','Corinthians',4,33,2,3,7,1,25,31,865920,18075),
    (72,'03/12/2024','Corinthians',3,34,0,3,37,1,15,1,2502234,45925),
    (73,'08/12/2024','Corinthians',3,35,0,3,35,1,9,32,3164574,42699) fim temporada 2024*/

INSERT INTO partidas_cor
VALUES
(732021, '09/12/2021','Corinthians',0,18,1,10,19,1,68,10,0,0)
