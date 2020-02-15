-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server Version:               10.4.11-MariaDB - mariadb.org binary distribution
-- Server Betriebssystem:        Win64
-- HeidiSQL Version:             10.3.0.5771
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Exportiere Datenbank Struktur für workshop
DROP DATABASE IF EXISTS `workshop`;
CREATE DATABASE IF NOT EXISTS `workshop` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `workshop`;

-- Exportiere Struktur von Prozedur workshop.deleteObligatoryUnit
DROP PROCEDURE IF EXISTS `deleteObligatoryUnit`;
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

-- Exportiere Struktur von Tabelle workshop.obligatoryunit
DROP TABLE IF EXISTS `obligatoryunit`;
CREATE TABLE IF NOT EXISTS `obligatoryunit` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `name` varchar(64) NOT NULL,
  `description` varchar(512) NOT NULL,
  `status` int(1) NOT NULL DEFAULT 0 COMMENT '0 = invisible; 1 = hidden; 2 = visible and registerable; 3 = visible and not registerable',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8;

-- Daten Export vom Benutzer nicht ausgewählt

-- Exportiere Struktur von Tabelle workshop.obligatoryunitworkshop
DROP TABLE IF EXISTS `obligatoryunitworkshop`;
CREATE TABLE IF NOT EXISTS `obligatoryunitworkshop` (
  `obligatoryUnitId` int(11) NOT NULL,
  `workshopId` int(11) NOT NULL,
  PRIMARY KEY (`obligatoryUnitId`,`workshopId`),
  KEY `FK_obligatoryunitworkshop_workshop` (`workshopId`),
  CONSTRAINT `FK_obligatoryunitworkshop_obligatoryunit` FOREIGN KEY (`obligatoryUnitId`) REFERENCES `obligatoryunit` (`id`),
  CONSTRAINT `FK_obligatoryunitworkshop_workshop` FOREIGN KEY (`workshopId`) REFERENCES `workshop` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Daten Export vom Benutzer nicht ausgewählt

-- Exportiere Struktur von Tabelle workshop.user
DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `username` varchar(10) NOT NULL,
  `firstname` varchar(32) NOT NULL,
  `lastname` varchar(32) NOT NULL,
  `class` varchar(32) NOT NULL,
  `isAdmin` int(1) NOT NULL DEFAULT 0 COMMENT '0 for no, 1 for is admin',
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Daten Export vom Benutzer nicht ausgewählt

-- Exportiere Struktur von Tabelle workshop.userworkshop
DROP TABLE IF EXISTS `userworkshop`;
CREATE TABLE IF NOT EXISTS `userworkshop` (
  `workshopId` int(8) NOT NULL,
  `userId` varchar(10) NOT NULL,
  PRIMARY KEY (`workshopId`,`userId`),
  KEY `FK_userworkshop_user` (`userId`),
  CONSTRAINT `FK__workshop` FOREIGN KEY (`workshopId`) REFERENCES `workshop` (`id`),
  CONSTRAINT `FK_userworkshop_user` FOREIGN KEY (`userId`) REFERENCES `user` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Daten Export vom Benutzer nicht ausgewählt

-- Exportiere Struktur von Tabelle workshop.workshop
DROP TABLE IF EXISTS `workshop`;
CREATE TABLE IF NOT EXISTS `workshop` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `description` varchar(512) NOT NULL,
  `startDate` date NOT NULL,
  `duration` int(2) NOT NULL,
  `participants` int(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- Daten Export vom Benutzer nicht ausgewählt

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
