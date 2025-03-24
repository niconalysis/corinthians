CREATE TABLE jogadores(
	ID_Jogador INT UNIQUE NOT NULL,
	Nome VARCHAR(200) NOT NULL,
	Data_Nasc DATE NOT NULL,
	Cidade_Nasc VARCHAR(200) NOT NULL,
	Estado_Nasc VARCHAR(200),
	Pais_Nasc VARCHAR(200),
	Altura INT,
	Numero_Camisa INT,
	Pe_Preferido VARCHAR(10),
	Valor_Mercado FLOAT,
	Imagem VARCHAR(500),
	PRIMARY KEY (ID_Jogador)
)

ALTER TABLE jogadores
	ADD Posicao VARCHAR(3)

ALTER TABLE jogadores
	ADD ID_Setor INT
	FOREIGN KEY (ID_Setor) REFERENCES setor_campo(ID_Setor)

UPDATE jogadores
	SET imagem = 'https://img.a.transfermarkt.technology/portrait/big/489893-1720056861.jpg?lm=1'
	WHERE ID_Jogador = 45
	
SELECT *  FROM jogadores

SELECT
	CONCAT('"',Nome,'"',':',ID_Jogador,',')
FROM jogadores

UPDATE jogadores
SET Nome = 'José Martínez'
WHERE ID_Jogador = 23




INSERT INTO jogadores
VALUES
	(1000,'Gol Contra','','','','','','','','','','','','',4)
	/*(1,'Hugo Souza','31/01/1999','Duque de Caxias', 'RJ','Brasil',199,1,'Direito','3500000','','01/01/2025',''),
	(2,'Matheus Donelli','17/05/2002','São Paulo', 'SP','Brasil',187,1,'Direito','2500000','','01/03/2021',''),
	(3,'Cássio','06/06/1987','Veranópolis','RS','Brasil',195,12,'Esquerdo','1200000','','09/12/2011','10/07/2024'),
	(4,'Carlos Miguel','09/10/1998','Cardoso Moreira','RJ','Brasil',204,22,'Esquerdo','700000','','31/08/2021','09/07/2024'),
	(5,'Felipe Longo','05/03/2005','São Paulo','SP','Brasil',189,40,'Direito','','','01/01/2023','','GOL'),
	(6,'Félix Torres','11/01/1997','San Lorenzo','','Equador',187,3,'Direito','6000000','','14/01/2024','','ZAG'),
	(7,'André Ramalho','16/02/1992','Ibiúna','SP','Brasil',182,5,'Direito','3500000','','16/07/2024','','ZAG'),
	(8,'Raul Gustavo','24/04/1999','Pedro Leopoldo','MG','Brasil',189,34,'Esquerdo','180000','','19/07/2019','01/07/2024','ZAG'),
	(9,'Gustavo Henrique','24/03/1993','São Paulo','SP','Brasil',194,13,'Direito','3200000','','15/01/2024','','ZAG'),
	(10,'Caetano','24/06/1999','Rio de Janeiro','RJ','Brasil',182,12,'Esquerdo','1000000','','01/01/2023','20/01/2025','ZAG'),
	(11,'Cacá','25/04/1999','Visconde do Rio Branco','MG','Brasil',187,25,'Direito','1000000','','09/01/2025','','ZAG'),
	(12,'Renato Santos','11/10/2004','Vitória da Conquista','BA','Brasil',188,41,'Direito','','','01/01/2025','','ZAG'),
	(13,'Tchoca','31/12/2003','Sete Lagoas','MG','Brasil',192,47,'Direito','','','01/02/2024','','ZAG'),
	(14,'Diego Palacios','12/07/1999','Guayaquil','','Equador',169,6,'Esquerdo','4000000','','02/01/2024','','LAE'),
	(15,'Matheus Bidu','04/05/1999','São Paulo','SP','Brasil',172,21,'Esquerdo','1500000','','01/01/2023','','LAE'),
	(16,'Hugo','29/08/1997','Arapiraca','AL','Brasil',179,46,'Esquerdo','500000','','11/01/2024','','LAE'),
	(17,'Vitor Meer','21/06/2004','Itaquaquecetuba','SP','Brasil',180,28,'Esquerdo','','','01/01/2021','01/07/2024','LAE'),
	(18,'Matheuzinho','08/09/2000','Londrina','PR','Brasil',171,2,'Direito','8000000','','16/02/2024','','LAD'),
	(19,'Fagner','11/06/1989','São Paulo','SP','Brasil',168,23,'Direito','1500000','','01/01/2015','03/01/2025','LAD'),
	(20,'Léo Maná','06/04/2004','São Paulo','SP','Brasil',179,33,'Direito','150000','','01/01/2024','','LAD'),
	(21,'Matheuzinho','08/09/2000','Londrina','PR','Brasil',171,2,'Direito','8000000','','16/02/2024','','LAD'),
	(22,'Fausto','26/03/2000','Hurlingham','','Argentina',180,5,'Direito','4500000','','26/07/2022','16/07/2024','VOL'),
	(23,'José Martinez','07/08/1994','Maracaibo','','Venezuela',178,70,'Direito','2000000','','26/08/2024','','VOL'),
	(24,'Raniele','31/12/1996','Baixa Grande','BA','Brasil',184,14,'Direito','1000000','','01/01/2024','','VOL'),
	(25,'Ryan','15/07/2003','São Paulo','SP','Brasil',170,37,'Esquerdo','','','01/02/2024','','VOL'),
	(26,'Gabriel Moscardo','28/09/2005','Taubaté','SP','Brasil',185,44,'Direito','15000000','','01/07/2023','30/06/2024','VOL'),
	(27,'Maycon','15/07/1997','São Paulo','SP','Brasil',175,7,'Esquerdo','7000000','','09/01/2023','','VOL'),
	(28,'Alex Santana','13/05/1995','Atibaia','SP','Brasil',182,80,'Direito','2000000','','15/07/2024','','VOL'),
	(29,'Paulinho','25/07/1988','São Paulo','SP','Brasil',183,8,'Direito','1500000','','01/01/2022','01/07/2024','VOL'),
	(30,'Charles','19/06/1996','Santiago','RS','Brasil',187,35,'Direito','600000','','24/07/2024','','VOL'),
	(31,'Breno Bidon','20/02/2005','São Paulo','SP','Brasil',178,27,'Esquerdo','8000000','','01/03/2024','','VOL'),
	(32,'Igor Coronado','18/08/1992','Londrina','PR','Brasil',170,77,'Direito','6000000','','16/02/2024','','MEI'),
	(33,'Matías Rojas','03/11/1995','Asunción','','Paraguai',180,10,'Esquerdo','3500000','','11/07/2023','23/04/2024','MEI'),
	(34,'Rodrigo Garro','04/01/1998','General Pico','','Argentina',174,8,'Esquerdo','3200000','','02/01/2024','','MEI'),
	(35,'André Carrillo','14/06/1991','Lima','','Peru',180,19,'Direito','2500000','','10/09/2024','','MEI'),
	(36,'Matheus Araújo','22/05/2002','Osasco','SP','Brasil',176,2,'Direito','2000000','','01/01/2023','01/01/2025','MEI'),
	(37,'Talles Magno','26/06/2002','Rio de Janeiro','RJ','Brasil',186,43,'Direito','15000000','','09/08/2024','','ATA'),
	(38,'Romero','04/07/1992','Fernando de la Mora','','Paraguai',176,11,'Direito','2300000','','01/01/2023','','ATA'),
	(39,'Wesley','05/03/2005','São Paulo','SP','Brasil',180,36,'Direito','18000000','','10/05/2023','30/08/2024','ATA'),
	(40,'Gustavo Silva','07/09/1997','Curitiba','PR','Brasil',168,2,'Direito','1500000','','01/01/2019','28/08/2024','ATA'),
	(41,'Pedro Henrique','16/06/1990','Santa Cruz do Sul','RS','Brasil',179,16,'Direito','2000000','','16/02/2024','10/01/2025','ATA'),
	(42,'Biro','20/04/2004','Campinas','SP','Brasil',171,26,'Esquerdo','150000','','01/01/2023','09/09/2024','ATA'),
	(43,'Kayke','28/04/2004','Guarulhos','SP','Brasil',176,31,'Direito','','','01/01/2025','','ATA'),
	(44,'Memphis Depay','13/02/1994','Moordrecht','','Holanda',178,10,'Direito','20000000','','09/09/2024','','ATA'),
	(45,'Yuri Alberto','18/03/2001','São José dos Campos','SP','Brasil',183,9,'Direito','16000000','','09/01/2023','','ATA'),
	(46,'Pedro Raul','05/11/1996','Porto Alegre','RS','Brasil',193,20,'Direito','6000000','','02/02/2024','','ATA'),
	(47,'Héctor Hernandez','14/09/1995','Las Palmas de Gran Canaria','','Espanha',180,22,'Direito','800000','','27/08/2024','','ATA'),
	(48,'Giovane','24/11/2003','Campinas','SP','Brasil',184,17,'Esquerdo','300000','','31/07/2022','','ATA'),
	(49,'Arthur Sousa','12/03/2003','Brasília','DF','Brasil',184,31,'Direito','150000','','01/01/2024','02/09/2024','ATA'),
	(50,'Yago','06/04/2007','Desconhecido','','Brasil',184,49,'Esquerdo','','','01/01/2024','','ZAG')
	(51,'Luiz Eduardo','26/06/2007','São Paulo','SPl','Brasil',180,55,'Esquerdo','','','01/01/2025','','MEI',2)
	(52,'Jacaré','03/01/2008','Desconhecido','','Brasil',180,59,'Direito','','','01/01/2025','','LAD',1)
	(53,'Bahia','02/01/2006','Vitória da Conquista','BA','Brasil',178,54,'Direito','','','01/01/2025','','VOL',2)*/


ALTER TABLE jogadores
ALTER COLUMN Data_Nasc DATE NULL

select * from jogadores

UPDATE jogadores
SET Nome = 'Balbuena'
WHERE ID_Jogador = 56


--temporada 2023
INSERT INTO jogadores
VALUES
(54,'Kauê','08/02/2004','Santa Cruz do Rio Pardo','SP','Brasil',192,1,'Direito','','https://img.a.transfermarkt.technology/portrait/big/1005653-1738231246.jpg?lm=1','01/01/2022','','GOL',1),
(55,'Lucas Veríssimo','02/07/1995','Jundiaí','SP','Brasil',188,3,'Direito',10000000,'https://img.a.transfermarkt.technology/portrait/big/411662-1737911049.jpg?lm=1','26/07/2023','25/01/2024','ZAG',1),
(56,'Fabián Balbuena','23/08/1991','Ciudad del Este','','Paraguai',189,31,'Direito',6000000,'https://img.a.transfermarkt.technology/portrait/big/285548-1721727706.png?lm=1','18/07/2022','30/06/2023','ZAG',1),
(57,'Bruno Méndez','10/09/1999','Montevideo','','Uruguai',180,25,'Direito',3200000,'https://img.a.transfermarkt.technology/portrait/big/552912-1558943297.png?lm=1','28/02/2019','01/01/2024','ZAG',1),
(58,'Gil','12/06/1987','Campos dos Goytacazes','RJ','Brasil',192,4,'Direito',2300000,'https://img.a.transfermarkt.technology/portrait/big/101469-1523621399.jpg?lm=1','01/07/2019','01/01/2024','ZAG',1),
(59,'Murillo','04/07/2002','São Paulo','SP','Brasil',184,34,'Esquerdo',12000000,'https://img.a.transfermarkt.technology/portrait/big/1005649-1709159139.jpg?lm=1','01/01/2023','31/08/2023','ZAG',1),
(60,'Fábio Santos','16/09/1985','São Paulo','SP','Brasil',179,6,'Esquerdo',400000,'https://img.a.transfermarkt.technology/portrait/big/13835-1553781422.jpg?lm=1','19/10/2020','01/01/2024','LAE',1),
(61,'Rafael Ramos','09/01/1995','Seia','','Portugal',174,2,'Direito',800000,'https://img.a.transfermarkt.technology/portrait/big/290388-1520962070.jpg?lm=1','12/04/2022','02/01/2025','LAD',1),
(62,'Cantillo','15/10/1993','Ciénaga','','Colômbia',180,24,'Direito',3500000,'https://img.a.transfermarkt.technology/portrait/big/263032-1714873702.jpg?lm=1','09/01/2020','01/01/2024','VOL',2),
(63,'Roni','15/04/1999','São Paulo','SP','Brasil',174,29,'Direito',2000000,'https://img.a.transfermarkt.technology/portrait/big/725049-1600327915.jpg?lm=1','01/07/2020','10/01/2025','VOL',2),
(64,'Renato Augusto','08/02/1988','Rio de Janeiro','RJ','Brasil',186,8,'Direito',4500000,'https://img.a.transfermarkt.technology/portrait/big/53058-1509544256.jpg?lm=1','23/07/2021','05/01/2024','MEI',2),
(65,'Du Queiroz','07/01/2000','São Paulo','SP','Brasil',171,37,'Direito',800000,'https://img.a.transfermarkt.technology/portrait/big/906774-1687631769.png?lm=1','01/03/2021','01/07/2023','VOL',2),
(66,'Ruan Oliveira','20/03/2000','Paraíso do Norte','PR','Brasil',176,33,'Direito',300000,'https://img.a.transfermarkt.technology/portrait/big/798106-1698348452.jpg?lm=1','15/04/2019','31/12/2024','MEI',2),
(67,'Giuliano','31/05/1990','Curitiba','PR','Brasil',172,20,'Direito',3100000,'https://img.a.transfermarkt.technology/portrait/big/54375-1706143918.jpg?lm=1','16/07/2021','01/01/2024','MEI',2),
(68,'Pedrinho','01/01/2004','São Paulo','SP','Brasil',172,90,'Direito','','https://img.a.transfermarkt.technology/portrait/big/1005645-1724697649.jpg?lm=1','01/01/2023','21/08/2024','MEI',2),
(69,'Róger Guedes','02/10/1996','Ibirubá','RS','Brasil',182,10,'Direito',9100000,'https://img.a.transfermarkt.technology/portrait/big/348263-1483531190.jpg?lm=1','27/08/2021','09/08/2023','POE',3),
(70,'Pedro','05/02/2006','São Paulo','SP','Brasil',170,27,'Direito',9000000,'https://img.a.transfermarkt.technology/portrait/big/1004741-1721723737.png?lm=1','01/02/2023','05/02/2024','POE',3),
(71,'Adson','06/10/2000','Araguapaz','GO','Brasil',171,28,'Esquerdo',3000000,'https://img.a.transfermarkt.technology/portrait/big/868891-1704213480.jpg?lm=1','01/03/2021','23/08/2023','POD',3),
(72,'Chrystian Barletta','05/07/2001','Limeira','SP','Brasil',178,77,'Esquerdo',1250000,'https://img.a.transfermarkt.technology/portrait/big/695232-1706875247.jpg?lm=1','20/03/2023','31/07/2023','POD',3),
(73,'Júnior Moraes','04/04/1987','Santos','SP','Brasil',176,18,'Direito',1500000,'https://img.a.transfermarkt.technology/portrait/big/52915-1641992902.png?lm=1','16/03/2022','01/07/2023','ATA',3),
(74,'Felipe Augusto','18/02/2004','São Paulo','SP','Brasil',187,41,'Esquerdo',3000000,'https://img.a.transfermarkt.technology/portrait/big/834899-1689215871.jpg?lm=1','01/07/2023','06/01/2024','ATA',3)

--temporada 2022
INSERT INTO jogadores
VALUES
(75,'Ivan','02/07/1997','Rio das Pedras','SP','Brasil',196,1,'Direito','2000000','https://img.a.transfermarkt.technology/portrait/big/364257-1658372908.png?lm=1','31/01/2022','07/01/2024','GOL',1),
(76,'Robson Bambu','12/11/1997','São Vicente','SP','Brasil',185,3,'Direito','6000000','https://img.a.transfermarkt.technology/portrait/big/458715-1543927750.jpg?lm=1','21/01/2022','31/12/2022','ZAG',1),
(77,'João Victor','17/07/1998','Bauru','SP','Brasil',187,33,'Direito','800000','https://img.a.transfermarkt.technology/portrait/big/671145-1661241753.jpg?lm=1','01/01/2019','07/07/2022','ZAG',1),
(78,'Bruno Melo','26/10/1992','Paracuru','CE','Brasil',183,27,'Esquerdo','750000','https://img.a.transfermarkt.technology/portrait/big/538230-1597912489.jpg?lm=1','21/01/2022','31/12/2022','ZAG',1),
(79,'Robert Renan','11/10/2003','Brasília','DF','Brasil',186,30,'Esquerdo','','https://img.a.transfermarkt.technology/portrait/big/958598-1674623993.png?lm=1','01/07/2022','10/01/2023','ZAG',1),
(80,'Lucas Piton','09/10/2000','Jundiaí','SP','Brasil',175,6,'Esquerdo','6000000','https://img.a.transfermarkt.technology/portrait/big/670201-1737731172.jpg?lm=1','01/07/2019','01/01/2023','LAE',1),
(81,'João Pedro','15/11/1996','Presidente Prudente','SP','Brasil',179,90,'Direito','900000','https://img.a.transfermarkt.technology/portrait/big/342024-1542105407.png?lm=1','31/08/2021','30/06/2022','LAD',1),
(82,'Cantillo','15/10/1993','Ciénaga','','Colômbia',180,24,'Direito','3500000','https://img.a.transfermarkt.technology/portrait/big/263032-1714873702.jpg?lm=1','09/01/2020','01/01/2024','VOL',2),
(83,'Gabriel','02/01/1997','Campinas','SP','Brasil',171,5,'Direito','3200000','https://img.a.transfermarkt.technology/portrait/big/213606-1542110736.jpg?lm=1','13/01/2017','11/02/2022','VOL',2),
(84,'Xavier','02/03/2000','Mococa','SP','Brasil',181,39,'Direito','800000','https://img.a.transfermarkt.technology/portrait/big/596426-1662318279.jpg?lm=1','13/07/2020','03/04/2023','VOL',2),
(85,'Ramiro','22/05/1993','Gramado','RS','Brasil',169,20,'Direito','2800000','https://img.a.transfermarkt.technology/portrait/big/258070-1512665583.jpg?lm=1','01/01/2019','01/01/2023','MEI',2),
(86,'Luan','31/05/1993','São José do Rio Preto','SP','Brasil',180,7,'Direito','6500000','https://img.a.transfermarkt.technology/portrait/big/313106-1512665089.jpg?lm=1','01/01/2020','27/07/2023','MEI',2),
(87,'Mateus Vital','12/02/1998','Rio de Janeiro','RJ','Brasil',177,43,'Direito','3200000','https://img.a.transfermarkt.technology/portrait/big/408958-1516183116.jpg?lm=1','15/01/2018','01/01/2023','MEI',2),
(88,'Willian','09/08/1988','Ribeirão Pires','SP','Brasil',175,10,'Direito','15000000','https://img.a.transfermarkt.technology/portrait/big/52769-1728418132.png?lm=1','30/08/2021','01/09/2022','POE',3),
(89,'Léo Natel','14/03/1997','Porto Alegre','RS','Brasil',179,66,'Direito','1400000','https://img.a.transfermarkt.technology/portrait/big/351750-1729088033.jpg?lm=1','17/07/2020','31/07/2024','POE',3),
(90,'Gabriel Pereira','01/08/2001','São Paulo','SP','Brasil',175,38,'Esquerdo','700000','https://img.a.transfermarkt.technology/portrait/big/736954-1678634141.jpg?lm=1','01/03/2021','17/03/2022','POD',3),
(91,'Gustavo Mantuan','20/06/2001','Santo André','SP','Brasil',176,31,'Direito','','https://img.a.transfermarkt.technology/portrait/big/814269-1721723837.png?lm=1','01/01/2022','01/07/2023','POD',3),
(92,'Jô','20/03/1987','São Paulo','SP','Brasil',192,77,'Esquerdo','3000000','https://img.a.transfermarkt.technology/portrait/big/34156-1662313892.jpg?lm=1','01/07/2020','09/08/2022','ATA',3)

INSERT INTO jogadores
VALUES
(127,'Fabrizio Angileri','15/03/1994','Junín','','Argentina',185,26,'Esquerdo','700000','https://img.a.transfermarkt.technology/portrait/big/268506-1625760521.png?lm=1','27/02/2025','','LAE',1)
(126,'Madson','26/08/1999','Coruripe','AL','Brasil',164,50,'Esquerdo','','https://img.a.transfermarkt.technology/portrait/big/269860-1580198215.jpg?lm=1','01/01/2020','01/07/2022','POE',3)
(125,'Walter','18/11/1987','Jaú','SP','Brasil',188,27,'Direito',900000,'https://img.a.transfermarkt.technology/portrait/big/269860-1580198215.jpg?lm=1','03/05/2013','01/01/2022','GOL',1),
(104,'Pedro Henrique','02/10/1995','Lauro Müller','SC','Brasil',188,44,'Direito',1000000,'https://img.a.transfermarkt.technology/portrait/big/329720-1580198653.jpg?lm=1','01/01/2015','20/07/2020','ZAG',1),
(105,'Marllon','16/04/1992','Rio de Janeiro','RJ','Brasil',186,25,'Direito',800000,'https://img.a.transfermarkt.technology/portrait/big/166032-1580198889.jpg?lm=1','19/08/2018','08/03/2021','ZAG',1),
(106,'Yago','29/08/1992','Ibirá','SP','Brasil',185,49,'Direito',700000,'https://img.a.transfermarkt.technology/portrait/big/s_184156_8793_2012_1.jpg?lm=1','01/05/2013','26/03/2021','ZAG',1),
(107,'Sidcley','13/05/1993','Vila Velha','ES','Brasil',176,16,'Esquerdo',5000000,'https://img.a.transfermarkt.technology/portrait/big/330060-1679944200.png?lm=1','08/01/2020','31/12/2020','LAE',1),
(108,'Danilo Avelar','09/06/1989','Paranavaí','PR','Brasil',185,35,'Esquerdo',1500000,'https://img.a.transfermarkt.technology/portrait/big/140748-1448968398.jpg?lm=1','01/07/2019','01/01/2023','LAE',1),
(109,'Carlos Augusto','07/01/1999','Campinas','SP','Brasil',184,55,'Esquerdo',50000,'https://img.a.transfermarkt.technology/portrait/big/585982-1735891597.jpg?lm=1','01/01/2018','01/09/2020','LAE',1),
(110,'Michel Macedo','15/02/1990','Rio de Janeiro','RJ','Brasil',177,2,'Direito',1800000,'https://img.a.transfermarkt.technology/portrait/big/77262-1725067331.jpg?lm=1','01/01/2019','01/01/2022','LAD',1),
(111,'Richard','18/02/1994','Campinas','SP','Brasil',191,18,'Direito',900000,'https://img.a.transfermarkt.technology/portrait/big/530737-1724671365.jpg?lm=1','01/01/2019','21/01/2022','VOL',2),
(112,'Renê Júnior','16/09/1989','Rio de Janeiro','RJ','Brasil',180,54,'Direito',1500000,'https://img.a.transfermarkt.technology/portrait/big/137726-1580198547.jpg?lm=1','04/01/2018','01/01/2021','VOL',2),
(113,'Éderson','07/07/1999','Campo Grande','MS','Brasil',183,15,'Direito','','https://img.a.transfermarkt.technology/portrait/big/607854-1646648856.jpg?lm=1','21/02/2020','30/01/2022','VOL',2),
(114,'Everaldo','28/05/1994','Olinda','PE','Brasil',172,37,'Direito',100000,'https://img.a.transfermarkt.technology/portrait/big/388397-1558620681.jpg?lm=1','22/05/2019','01/07/2023','POE',3),
(115,'Jonathan Cafu','10/07/1991','Piracicaba','SP','Brasil',175,28,'Direito',4000000,'https://img.a.transfermarkt.technology/portrait/big/347100-1648881189.png?lm=1','09/11/2020','01/01/2024','POD',3),
(116,'Pedrinho','13/04/1998','Maceió','AL','Brasil',172,44,'Esquerdo',5000000,'https://img.a.transfermarkt.technology/portrait/big/515208-1723486899.png?lm=1','01/01/2017','01/08/2020','POD',3),
(117,'Yony González','11/07/1994','Medellín','','Colômbia',184,20,'Direito',800000,'https://img.a.transfermarkt.technology/portrait/big/262474-1720884797.jpg?lm=1','01/02/2020','30/06/2020','POD',3),
(118,'Janderson','26/02/1999','Barreiras','BA','Brasil',169,54,'Direito','','https://img.a.transfermarkt.technology/portrait/big/670940-1706875516.jpg?lm=1','01/07/2019','04/01/2023','POD',3),
(119,'Mauro Boselli','22/05/1985','Buenos Aires','','Argentina',181,17,'Direito',1800000,'https://img.a.transfermarkt.technology/portrait/big/40822-1425462626.jpg?lm=1','03/01/2019','12/01/2021','ATA',3),
(120,'Vágner Love','11/06/1984','Rio de Janeiro','RJ','Brasil',172,9,'Direito',1500000,'https://img.a.transfermarkt.technology/portrait/big/18829-1588240175.jpg?lm=1','25/01/2019','01/07/2020','ATA',3),
(121,'Gustavo','29/03/1994','Registro','SP','Brasil',189,20,'Direito',600000,'https://img.a.transfermarkt.technology/portrait/big/333913-1615443464.jpg?lm=1','31/08/2016','22/07/2020','ATA',3),
(122,'Carlinhos','12/02/1997','Jaú','SP','Brasil',195,44,'Direito','','https://img.a.transfermarkt.technology/portrait/big/363173-1720095894.jpg?lm=1','01/01/2017','24/02/2021','ATA',3),
(123,'Matheus Davó','16/08/1999','São Paulo','SP','Brasil',178,33,'Direito','','https://img.a.transfermarkt.technology/portrait/big/670522-1712086866.jpg?lm=1','13/01/2020','11/01/2023','POD',3),
(124,'Vitinho','04/01/2000','Guarulhos','SP','Brasil',175,43,'Direito','','https://img.a.transfermarkt.technology/portrait/big/467940-1623883783.jpg?lm=1','01/07/2017','20/07/2022','MEI',2)