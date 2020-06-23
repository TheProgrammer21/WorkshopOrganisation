-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server Version:               10.4.11-MariaDB - mariadb.org binary distribution
-- Server Betriebssystem:        Win64
-- HeidiSQL Version:             11.0.0.5919
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Exportiere Datenbank Struktur für workshop
CREATE DATABASE IF NOT EXISTS `workshop` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `workshop`;

-- Exportiere Struktur von Funktion workshop.createWorkshop
DELIMITER //
CREATE FUNCTION `createWorkshop`(`obligatoryUnitId` INT,
	`name` VARCHAR(64),
	`description` VARCHAR(512),
	`startDate` DATE,
	`duration` INT,
	`participants` INT
) RETURNS int(11)
BEGIN
	SET @obligatoryunit = (SELECT COUNT(*) FROM obligatoryunit WHERE id = obligatoryUnitId);
	IF (@obligatoryunit = 0) THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Obigatory Unit not found';
	ELSE
		INSERT INTO workshop (name, description, startDate, duration, participants) VALUES (name, description, startDate, duration, participants);
		SET @workshopId = LAST_INSERT_ID();
		INSERT INTO obligatoryUnitWorkshop (obligatoryUnitId, workshopId) VALUES (obligatoryUnitId, @workshopId);
		RETURN @workshopId;
	END IF;
END//
DELIMITER ;

-- Exportiere Struktur von Prozedur workshop.deleteObligatoryUnit
DELIMITER //
CREATE PROCEDURE `deleteObligatoryUnit`(
	IN `unitId` INT
)
    MODIFIES SQL DATA
    COMMENT 'Deletes the obligatory unit as well as all to the unit related workshops'
BEGIN
	DELETE 
	FROM workshop
	WHERE workshop.id IN (SELECT obligatoryunitworkshop.workshopId
						FROM obligatoryunitworkshop
						WHERE obligatoryunitworkshop.obligatoryUnitId = unitId);
	DELETE 
	FROM obligatoryunit	
	WHERE obligatoryunit.id = unitId;
END//
DELIMITER ;

-- Exportiere Struktur von Funktion workshop.isRegisterable
DELIMITER //
CREATE FUNCTION `isRegisterable`(`workshopId` INT
) RETURNS binary(1)
BEGIN
	SET @state = (SELECT obligatoryunit.`status`
						FROM obligatoryunitworkshop
						INNER JOIN obligatoryunit ON obligatoryunit.id = obligatoryunitworkshop.obligatoryUnitId
						WHERE obligatoryunitworkshop.workshopId = workshopId);
	RETURN @state = 2; # only state 2 means registerable
END//
DELIMITER ;

-- Exportiere Struktur von Tabelle workshop.obligatoryunit
CREATE TABLE IF NOT EXISTS `obligatoryunit` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `name` varchar(64) NOT NULL,
  `description` varchar(512) NOT NULL,
  `status` int(1) NOT NULL DEFAULT 0 COMMENT 'inactive = 0;  1 = hidden; 2 = visible and registerable; 3 = visible and not registerable',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8;

-- Daten Export vom Benutzer nicht ausgewählt

-- Exportiere Struktur von Tabelle workshop.obligatoryunitworkshop
CREATE TABLE IF NOT EXISTS `obligatoryunitworkshop` (
  `obligatoryUnitId` int(11) NOT NULL,
  `workshopId` int(11) NOT NULL,
  PRIMARY KEY (`obligatoryUnitId`,`workshopId`),
  KEY `FK_obligatoryunitworkshop_workshop` (`workshopId`),
  CONSTRAINT `FK_obligatoryunitworkshop_obligatoryunit` FOREIGN KEY (`obligatoryUnitId`) REFERENCES `obligatoryunit` (`id`),
  CONSTRAINT `FK_obligatoryunitworkshop_workshop` FOREIGN KEY (`workshopId`) REFERENCES `workshop` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Daten Export vom Benutzer nicht ausgewählt

-- Exportiere Struktur von Prozedur workshop.registerWorkshop
DELIMITER //
CREATE PROCEDURE `registerWorkshop`(
	IN `workshopId` INT,
	IN `username` VARCHAR(10)
)
BEGIN
DECLARE amount INT;
DECLARE participants INT;

# Check if the workshop exists

	SET @workshopExists = (SELECT COUNT(*)
									FROM workshop
									WHERE workshop.id = workshopId);
	
	IF @workshopExists = 0 THEN
		SIGNAL SQLSTATE '02000'
			SET MESSAGE_TEXT = 'The workshop does not exist', MYSQL_ERRNO = 1643;
	END IF;

# Check if it is possible to register for this workshop at the moment

	IF (SELECT `isRegisterable`(workshopId)) != 1 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'It is not possible to register for this workshop at the moment', MYSQL_ERRNO = 45000;
	END IF;

# Check if the maximum number of participants doesn't exceed

	SELECT COUNT(*) AS 'amount', workshop.participants 
	INTO amount, participants 
	FROM userworkshop 
	INNER JOIN workshop ON userworkshop.workshopId = workshop.id
	WHERE workshop.id = workshopId;
	
	IF amount >= participants THEN
		SIGNAL SQLSTATE '45001'
			SET MESSAGE_TEXT = 'The maximum amount of participants is reached', MYSQL_ERRNO = 45001;
	END IF;

# check if the user hasn't registered for this workshop already

	SET @registeredAlready = (SELECT COUNT(*)
										FROM userworkshop
										WHERE userworkshop.workshopId = workshopId AND userworkshop.userId = username);
										
	IF @registeredAlready >= 1 THEN
		SIGNAL SQLSTATE '45002'
			SET MESSAGE_TEXT = 'The user is already registered for this workshop', MYSQL_ERRNO = 45002;
	END IF;

# check if the user has not registered for any other workshop during the duration of this workshop

 	SET @workshopsOfUser = (SELECT COUNT(*)
									FROM workshop 
									INNER JOIN userWorkshop ON workshop.id = userWorkshop.workshopId 
									WHERE userWorkshop.userId = username
										AND ((SELECT startDate
											  FROM workshop 
											  WHERE id = workshopId) BETWEEN workshop.startDate AND DATE_ADD(workshop.startDate, INTERVAL workshop.duration - 1 DAY)
										OR (SELECT DATE_ADD(workshop.startDate, INTERVAL workshop.duration DAY)
											  FROM workshop 
											  WHERE id = workshopId) BETWEEN workshop.startDate AND DATE_ADD(workshop.startDate, INTERVAL workshop.duration - 1 DAY)));											  	
	
	IF @workshopsOfUser = 0 THEN
		INSERT INTO userWorkshop (userWorkshop.workshopId, userWorkshop.userId) VALUES (workshopId, username);
	ELSE
		SIGNAL SQLSTATE '45003'
			SET MESSAGE_TEXT = 'The user cannot be registered for the workshop because another registration has been made at that time', MYSQL_ERRNO = 45003;
	END IF;
END//
DELIMITER ;

-- Exportiere Struktur von Prozedur workshop.unregisterFromWorkshop
DELIMITER //
CREATE PROCEDURE `unregisterFromWorkshop`(
	IN `workshopId` INT,
	IN `username` VARCHAR(10)
)
    COMMENT 'To unregister the user from a workshop it has signed up for'
BEGIN

# Check if workshop exists

	IF (SELECT workshop.id FROM workshop WHERE id = workshopId) IS NULL THEN
		SIGNAL SQLSTATE '02000'
			SET MESSAGE_TEXT = 'Workshop not found', MYSQL_ERRNO = 1643;
	END IF;
	
# Check if it is possible to unregister for this workshop at the moment
	
	IF (SELECT `isRegisterable`(workshopId)) != 1 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'It is not possible to unregister for this workshop at the moment', MYSQL_ERRNO = 45000;
	END IF;
	
# Check if user has registered for that workshop

	IF (SELECT userworkshop.userId FROM userworkshop WHERE userworkshop.workshopId = workshopId AND userworkshop.userId = username) IS NULL THEN
		SIGNAL SQLSTATE '45001'
			SET MESSAGE_TEXT = 'User is not registered for this workshop', MYSQL_ERRNO = 45001;
	END IF;
	
DELETE FROM userworkshop WHERE userworkshop.workshopId = workshopId AND userworkshop.userId = username;

END//
DELIMITER ;

-- Exportiere Struktur von Tabelle workshop.user
CREATE TABLE IF NOT EXISTS `user` (
  `username` varchar(10) NOT NULL,
  `firstname` varchar(32) NOT NULL,
  `lastname` varchar(32) NOT NULL,
  `class` varchar(32) NOT NULL,
  `permissions` int(1) NOT NULL DEFAULT 0 COMMENT '0 for student, 1 for admin',
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Daten Export vom Benutzer nicht ausgewählt

-- Exportiere Struktur von Tabelle workshop.userworkshop
CREATE TABLE IF NOT EXISTS `userworkshop` (
  `workshopId` int(8) NOT NULL,
  `userId` varchar(10) NOT NULL,
  PRIMARY KEY (`workshopId`,`userId`) USING BTREE,
  CONSTRAINT `FK__workshop` FOREIGN KEY (`workshopId`) REFERENCES `workshop` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Daten Export vom Benutzer nicht ausgewählt

-- Exportiere Struktur von Tabelle workshop.workshop
CREATE TABLE IF NOT EXISTS `workshop` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `name` varchar(512) NOT NULL,
  `description` varchar(2048) NOT NULL,
  `startDate` date NOT NULL,
  `duration` int(2) NOT NULL,
  `participants` int(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8;

-- Daten Export vom Benutzer nicht ausgewählt

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
