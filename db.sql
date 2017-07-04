-- phpMyAdmin SQL Dump
-- version 4.7.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 04. Jul 2017 um 16:53
-- Server-Version: 10.2.5-MariaDB
-- PHP-Version: 7.1.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Datenbank: `zuumeo_studio`
--
CREATE DATABASE IF NOT EXISTS `zuumeo_studio` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `zuumeo_studio`;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `customers`
--

CREATE TABLE `customers` (
  `id` int(4) NOT NULL,
  `name` varchar(150) NOT NULL,
  `logo` varchar(200) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `customers_retour`
--

CREATE TABLE `customers_retour` (
  `id` int(9) NOT NULL,
  `customerID` int(9) NOT NULL,
  `street` varchar(200) NOT NULL,
  `postal` int(6) NOT NULL,
  `city` varchar(200) NOT NULL,
  `person` varchar(400) NOT NULL,
  `comment` varchar(250) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `customers_user`
--

CREATE TABLE `customers_user` (
  `id` int(9) NOT NULL,
  `customerID` int(9) NOT NULL,
  `userID` int(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `options_gender`
--

CREATE TABLE `options_gender` (
  `id` int(3) NOT NULL,
  `name` varchar(200) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `visible` int(11) NOT NULL DEFAULT 1,
  `sort` int(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Daten für Tabelle `options_gender`
--

INSERT INTO `options_gender` (`id`, `name`, `icon`, `visible`, `sort`) VALUES
(1, 'Mann', 'fa-male', 1, 1),
(2, 'Frau', 'fa-female', 1, 2),
(3, 'Umstandsmode', 'pregnant_woman', 1, 3),
(4, 'Junge', 'icon-student', 1, 5),
(5, 'Mädchen', 'icon-girl', 1, 6),
(6, 'Kind', 'icon-kids', 1, 4);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `options_wg`
--

CREATE TABLE `options_wg` (
  `id` int(3) NOT NULL,
  `name` varchar(200) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `visible` int(11) NOT NULL DEFAULT 1,
  `sort` int(2) NOT NULL,
  `groupID` int(3) NOT NULL,
  `depth` int(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Daten für Tabelle `options_wg`
--

INSERT INTO `options_wg` (`id`, `name`, `icon`, `visible`, `sort`, `groupID`, `depth`) VALUES
(1, 'Accessoires', 'icon-diamond', 1, 1, 1, 1),
(2, 'Schuhe', 'icon-slip', 1, 2, 2, 1),
(3, 'Textil', 'icon-jumper', 1, 3, 3, 1),
(4, 'Textil', 'icon-simple', 1, 0, 4, 1),
(5, 'Oberbekleidung', 'icon-simple', 1, 0, 4, 2),
(6, 'Textil', 'icon-riding', 1, 0, 5, 1),
(7, 'Beinbekleidung', 'icon-riding', 1, 0, 5, 2);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `orders`
--

CREATE TABLE `orders` (
  `id` int(9) NOT NULL,
  `customerID` int(9) NOT NULL,
  `userID` int(9) NOT NULL,
  `created` datetime NOT NULL DEFAULT current_timestamp(),
  `comment` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `orders_articles`
--

CREATE TABLE `orders_articles` (
  `id` int(9) NOT NULL,
  `orderID` int(9) NOT NULL,
  `articleID` int(9) NOT NULL,
  `created` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `orders_user`
--

CREATE TABLE `orders_user` (
  `id` int(11) NOT NULL,
  `orderID` int(9) NOT NULL,
  `userID` int(9) NOT NULL,
  `created` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `roles`
--

CREATE TABLE `roles` (
  `id` int(11) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `right_team_edit_role` tinyint(1) DEFAULT NULL,
  `right_team_edit_data` tinyint(1) DEFAULT NULL,
  `right_team_edit` tinyint(1) DEFAULT NULL,
  `right_team_post` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Daten für Tabelle `roles`
--

INSERT INTO `roles` (`id`, `name`, `category`, `right_team_edit_role`, `right_team_edit_data`, `right_team_edit`, `right_team_post`) VALUES
(1, 'Mitglied', 'team', NULL, NULL, NULL, NULL),
(5, 'Moderator', 'team', 1, NULL, 1, 1),
(10, 'Administrator', 'team', 1, 1, 1, 1);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `teams`
--

CREATE TABLE `teams` (
  `id` int(11) UNSIGNED NOT NULL,
  `name` varchar(250) DEFAULT NULL,
  `openJoin` tinyint(1) DEFAULT 1,
  `description` varchar(500) DEFAULT NULL,
  `dateCreate` datetime DEFAULT NULL,
  `userCreate` int(11) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `avatar_alt` varchar(50) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Daten für Tabelle `teams`
--

INSERT INTO `teams` (`id`, `name`, `openJoin`, `description`, `dateCreate`, `userCreate`, `avatar`, `avatar_alt`) VALUES
(25, 'System_Logistik', 0, 'Zugriffsberechtigung für Logistikbereich', '2017-06-23 17:43:40', 5, 'avatar_System_Logistik.png', '61'),
(26, 'System_Produktion', 0, 'Zugriffsberechtigung für Produktionsbereich', '2017-06-23 17:45:20', 5, 'avatar_System_Produktion.png', '159');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `teams_post`
--

CREATE TABLE `teams_post` (
  `id` int(11) UNSIGNED NOT NULL,
  `teamID` int(11) DEFAULT NULL,
  `userID` int(11) DEFAULT NULL,
  `dateSend` datetime DEFAULT NULL,
  `title` varchar(250) NOT NULL,
  `message` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `teams_user`
--

CREATE TABLE `teams_user` (
  `id` int(11) UNSIGNED NOT NULL,
  `teamID` int(11) DEFAULT NULL,
  `userID` int(11) DEFAULT NULL,
  `dateJoin` datetime DEFAULT NULL,
  `roleID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `username` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `register` datetime DEFAULT NULL,
  `login` datetime DEFAULT NULL,
  `session_token` varchar(500) DEFAULT NULL,
  `session_update` datetime DEFAULT NULL,
  `roles` varchar(100) DEFAULT NULL,
  `password` varchar(128) DEFAULT NULL,
  `salt` varchar(12) DEFAULT NULL,
  `prename` varchar(200) DEFAULT NULL,
  `lastname` varchar(200) DEFAULT NULL,
  `avatar` varchar(400) DEFAULT NULL,
  `avatar_alt` int(3) NOT NULL,
  `lastRead` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user_is`
--

CREATE TABLE `user_is` (
  `userID` int(9) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `active` (`active`);

--
-- Indizes für die Tabelle `customers_retour`
--
ALTER TABLE `customers_retour`
  ADD PRIMARY KEY (`id`),
  ADD KEY `active` (`active`);

--
-- Indizes für die Tabelle `customers_user`
--
ALTER TABLE `customers_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customerID` (`customerID`,`userID`);

--
-- Indizes für die Tabelle `options_gender`
--
ALTER TABLE `options_gender`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sort` (`sort`);

--
-- Indizes für die Tabelle `options_wg`
--
ALTER TABLE `options_wg`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sort` (`sort`),
  ADD KEY `groupID` (`groupID`);

--
-- Indizes für die Tabelle `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customerID` (`customerID`),
  ADD KEY `userID` (`userID`);

--
-- Indizes für die Tabelle `orders_articles`
--
ALTER TABLE `orders_articles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orderID` (`orderID`,`articleID`);

--
-- Indizes für die Tabelle `orders_user`
--
ALTER TABLE `orders_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orderID` (`orderID`,`userID`);

--
-- Indizes für die Tabelle `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indizes für die Tabelle `teams_post`
--
ALTER TABLE `teams_post`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teamJoined` (`teamID`,`userID`) USING BTREE;

--
-- Indizes für die Tabelle `teams_user`
--
ALTER TABLE `teams_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `teamJoined` (`teamID`,`userID`);

--
-- Indizes für die Tabelle `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `session_token` (`session_token`);

--
-- Indizes für die Tabelle `user_is`
--
ALTER TABLE `user_is`
  ADD UNIQUE KEY `userID_value` (`name`,`userID`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;
--
-- AUTO_INCREMENT für Tabelle `customers_retour`
--
ALTER TABLE `customers_retour`
  MODIFY `id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;
--
-- AUTO_INCREMENT für Tabelle `customers_user`
--
ALTER TABLE `customers_user`
  MODIFY `id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;
--
-- AUTO_INCREMENT für Tabelle `options_gender`
--
ALTER TABLE `options_gender`
  MODIFY `id` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT für Tabelle `options_wg`
--
ALTER TABLE `options_wg`
  MODIFY `id` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT für Tabelle `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;
--
-- AUTO_INCREMENT für Tabelle `orders_articles`
--
ALTER TABLE `orders_articles`
  MODIFY `id` int(9) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `orders_user`
--
ALTER TABLE `orders_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT für Tabelle `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT für Tabelle `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;
--
-- AUTO_INCREMENT für Tabelle `teams_post`
--
ALTER TABLE `teams_post`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;
--
-- AUTO_INCREMENT für Tabelle `teams_user`
--
ALTER TABLE `teams_user`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;
--
-- AUTO_INCREMENT für Tabelle `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;COMMIT;
