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

-- Exportiere Struktur von Tabelle workshop.class
DROP TABLE IF EXISTS `class`;
CREATE TABLE IF NOT EXISTS `class` (
  `classname` varchar(16) NOT NULL,
  `active` int(1) NOT NULL DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  PRIMARY KEY (`classname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Daten Export vom Benutzer nicht ausgewählt

-- Exportiere Struktur von Tabelle workshop.obligatoryunit
DROP TABLE IF EXISTS `obligatoryunit`;
CREATE TABLE IF NOT EXISTS `obligatoryunit` (
  `id` int(4) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Daten Export vom Benutzer nicht ausgewählt

-- Exportiere Struktur von Tabelle workshop.obligatoryunitclass
DROP TABLE IF EXISTS `obligatoryunitclass`;
CREATE TABLE IF NOT EXISTS `obligatoryunitclass` (
  `obligatoryId` int(11) DEFAULT NULL,
  `classId` varchar(16) DEFAULT NULL,
  KEY `FK__obligatoryunit` (`obligatoryId`),
  KEY `FK__class` (`classId`),
  CONSTRAINT `FK__class` FOREIGN KEY (`classId`) REFERENCES `class` (`classname`),
  CONSTRAINT `FK__obligatoryunit` FOREIGN KEY (`obligatoryId`) REFERENCES `obligatoryunit` (`id`)
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
  PRIMARY KEY (`username`),
  KEY `FK_user_class` (`class`),
  CONSTRAINT `FK_user_class` FOREIGN KEY (`class`) REFERENCES `class` (`classname`)
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
  `status` int(1) NOT NULL COMMENT '0 = invisible; 1 = visible and registerable; 2 = visible and not registerable',
  `participants` int(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Daten Export vom Benutzer nicht ausgewählt

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
