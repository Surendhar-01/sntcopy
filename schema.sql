-- ERP Database Schema
-- Auto-synced from live MySQL database
-- 2026-07-03T11:28:44.460Z

CREATE DATABASE IF NOT EXISTS `sridb`;
USE `sridb`;

SET FOREIGN_KEY_CHECKS=0;

-- ---------------------------------------------------------
-- 1. Table: users
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'User',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------
-- 2. Table: accounts
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` varchar(255) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'Staff',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user` (`user`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for accounts
-- Default account passwords are exported in plain form and hashed on server startup.
INSERT INTO `accounts` (`id`, `user`, `pass`, `role`, `created_at`) VALUES (1, 'admin', 'Admin@SNT2026!', 'Admin', '2026-05-01 14:09:54');
INSERT INTO `accounts` (`id`, `user`, `pass`, `role`, `created_at`) VALUES (2, 'staff1', 'scrypt$16384$8$1$56612e445d1db8d83cadb6966d2b574e$e4a336015a5191c960ce8e207b9cb2a9e9a79650c0d005076e37913fc335ad2f0b61d8f92f45e5eb18a515de0f5b793702bb4aed84ca34188958a8bd3c94465e', 'Staff', '2026-05-01 14:09:54');
INSERT INTO `accounts` (`id`, `user`, `pass`, `role`, `created_at`) VALUES (3, 'staff2', 'scrypt$16384$8$1$1c53401fa9b8fc45484df17348ab8e3c$b0a9d3b2bd23f4623be9b5292fd92d3255ae0b8aa061fe4d1e1fe925696c4e34be756b97d6f2ebff9a46c2dddd556264e1389cf945aff2cbf1151b73a6faf79b', 'Staff', '2026-05-01 14:09:54');
INSERT INTO `accounts` (`id`, `user`, `pass`, `role`, `created_at`) VALUES (4, 'staff3', 'Staff3@SNT2026!', 'Staff', '2026-05-01 14:09:54');
INSERT INTO `accounts` (`id`, `user`, `pass`, `role`, `created_at`) VALUES (5, 'staff4', 'Staff4@SNT2026!', 'Staff', '2026-05-01 14:09:54');
INSERT INTO `accounts` (`id`, `user`, `pass`, `role`, `created_at`) VALUES (6, 'staff5', 'Staff5@SNT2026!', 'Staff', '2026-05-01 14:09:54');
INSERT INTO `accounts` (`id`, `user`, `pass`, `role`, `created_at`) VALUES (7, 'manager', 'Manager@SNT2026!', 'Manager', '2026-07-03 06:29:49');

-- ---------------------------------------------------------
-- 3. Table: products
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) DEFAULT NULL,
  `cat` varchar(100) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock` int NOT NULL DEFAULT '0',
  `sold` int NOT NULL DEFAULT '0',
  `image` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for products
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (1, 'Groundnut Oil (Refined) 15kg Tin', 'GNR-15K', 'Groundnut', 'tins', '2920.00', 15, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (2, 'Groundnut Oil (Refined) 5L Can', 'GNR-05C', 'Groundnut', 'cans', '930.00', 10, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (3, 'Groundnut Oil (Refined) 2L Can', 'GNR-02C', 'Groundnut', 'cans', '383.00', 15, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (4, 'Groundnut Oil (Refined) 1L Bottle', 'GNR-01B', 'Groundnut', 'bottles', '188.00', 30, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (5, 'Groundnut Oil (Refined) 1L Packet', 'GNR-01P', 'Groundnut', 'pkts', '184.00', 50, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (6, 'Groundnut Oil (Refined) 1/2L Packet', 'GNR-HFP', 'Groundnut', 'pkts', '92.00', 0, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (7, 'Groundnut Oil (Pure) 15kg Tin', 'GNP-15K', 'Groundnut', 'tins', '3000.00', 8, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (8, 'Groundnut Oil (Pure) 5L Can', 'GNP-05C', 'Groundnut', 'cans', '955.00', 10, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (9, 'Groundnut Oil (Pure) 1L Packet', 'GNP-01P', 'Groundnut', 'pkts', '193.00', 40, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (10, 'Sunflower Oil (Refined) 15kg Tin', 'SFR-15K', 'Sunflower', 'tins', '2950.00', 12, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (11, 'Sunflower Oil (Refined) 5L Can', 'SFR-05C', 'Sunflower', 'cans', '940.00', 15, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (12, 'Sunflower Oil (Refined) 1L Packet', 'SFR-01P', 'Sunflower', 'pkts', '186.00', 85, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (13, 'Palm Oil 15kg Tin', 'PAL-15K', 'Palm', 'tins', '2445.00', 24, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (14, 'Palm Oil 5L Can', 'PAL-05C', 'Palm', 'cans', '780.00', 20, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (15, 'Palm Oil 1L Packet', 'PAL-01P', 'Palm', 'pkts', '154.00', 60, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (16, 'Vanaspati 15kg Tin', 'VAN-15K', 'Vanaspati', 'tins', '2700.00', 5, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (17, 'Sesame Oil (Mayil) 1L Packet', 'SEM-01P', 'Sesame', 'pkts', '320.00', 20, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (18, 'Sesame Oil (Mayil) 1/2L Packet', 'SEM-HFP', 'Sesame', 'pkts', '160.00', 25, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (19, 'Sesame Oil (Mukil) 15kg Tin', 'SEU-15K', 'Sesame', 'tins', '4050.00', 4, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (20, 'Sesame Oil (Karmegam Premium) 15kg Tin', 'SEK-15K', 'Sesame', 'tins', '4560.00', 15, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (21, 'Sesame Oil (Karmegam) 5L Can', 'SEK-05C', 'Sesame', 'cans', '1575.00', 10, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (22, 'Sesame Oil (Karmegam) 1L Bottle', 'SEK-01B', 'Sesame', 'bottles', '340.00', 15, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (23, 'Sesame Oil (Karmegam) 1L Packet', 'SEK-01P', 'Sesame', 'pkts', '330.00', 30, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (24, 'Sesame Oil (Karmegam) 1/2L Bottle', 'SEK-HFB', 'Sesame', 'bottles', '170.00', 20, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (25, 'Sesame Oil (Karmegam) 1/2L Packet', 'SEK-HFP', 'Sesame', 'pkts', '165.00', 25, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (26, 'Sesame Oil (Karmegam) 200ml Bottle', 'SEK-200B', 'Sesame', 'bottles', '70.00', 15, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (27, 'Castor Oil 1L Bottle', 'CAS-01B', 'Castor', 'bottles', '220.00', 10, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (28, 'Castor Oil 1/2L Bottle', 'CAS-HFB', 'Castor', 'bottles', '110.00', 10, 5, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (29, 'Coconut Oil 1L Packet', 'CON-01P', 'Coconut', 'pkts', '370.00', 30, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (30, 'Coconut Oil 1L Bottle', 'CON-01B', 'Coconut', 'bottles', '370.00', 20, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (31, 'Coconut Oil 1/2L Packet', 'CON-HFP', 'Coconut', 'pkts', '185.00', 25, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (32, 'Coconut Oil 1/2L Bottle', 'CON-HFB', 'Coconut', 'bottles', '185.00', 20, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (33, 'Coconut Oil 200g Bottle', 'CON-200B', 'Coconut', 'bottles', '100.00', 15, 0, NULL, '2026-05-01 14:09:55');
INSERT INTO `products` (`id`, `name`, `code`, `cat`, `unit`, `price`, `stock`, `sold`, `image`, `created_at`) VALUES (34, 'Coconut Oil 100g Bottle', 'CON-100B', 'Coconut', 'bottles', '50.00', 18, 2, NULL, '2026-05-01 14:09:55');

-- ---------------------------------------------------------
-- 4. Table: bills
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `bills`;
CREATE TABLE `bills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `billNo` varchar(255) NOT NULL,
  `customer` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `payment` varchar(50) DEFAULT NULL,
  `date` datetime NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cgst` decimal(10,2) NOT NULL DEFAULT '0.00',
  `sgst` decimal(10,2) NOT NULL DEFAULT '0.00',
  `grand` decimal(10,2) NOT NULL DEFAULT '0.00',
  `items` longtext,
  `by_user` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for bills
INSERT INTO `bills` (`id`, `billNo`, `customer`, `phone`, `payment`, `date`, `subtotal`, `cgst`, `sgst`, `grand`, `items`, `by_user`, `created_at`) VALUES (1, 'SNT-1000', 'Surendhar S', '6382411714', 'Cash', '2026-06-23 07:05:29', '95.24', '2.38', '2.38', '100.00', '[{"id":34,"name":"Coconut Oil 100g Bottle","qty":2,"price":50,"total":100}]', 'staff4', '2026-06-23 07:05:30');
INSERT INTO `bills` (`id`, `billNo`, `customer`, `phone`, `payment`, `date`, `subtotal`, `cgst`, `sgst`, `grand`, `items`, `by_user`, `created_at`) VALUES (2, 'SNT-1001', 'Kavin S', '8072350543', 'Cash', '2026-06-23 07:45:25', '523.81', '13.10', '13.10', '550.00', '[{"id":28,"name":"Castor Oil 1/2L Bottle","qty":5,"price":110,"total":550}]', 'staff1', '2026-06-23 07:45:25');

-- ---------------------------------------------------------
-- 5. Table: customers
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `visits` int NOT NULL DEFAULT '0',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `firstVisit` datetime DEFAULT NULL,
  `lastVisit` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for customers
INSERT INTO `customers` (`id`, `name`, `phone`, `visits`, `total`, `firstVisit`, `lastVisit`, `created_at`) VALUES (1, 'Surendhar S', '6382411714', 1, '100.00', '2026-06-23 07:05:29', '2026-06-23 07:05:29', '2026-06-23 07:05:30');
INSERT INTO `customers` (`id`, `name`, `phone`, `visits`, `total`, `firstVisit`, `lastVisit`, `created_at`) VALUES (2, 'Kavin S', '8072350543', 1, '550.00', '2026-06-23 07:45:25', '2026-06-23 07:45:25', '2026-06-23 07:45:25');

-- ---------------------------------------------------------
-- 6. Table: sales
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `sales`;
CREATE TABLE `sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL,
  `billNo` varchar(255) DEFAULT NULL,
  `customer` varchar(255) DEFAULT NULL,
  `product` varchar(255) DEFAULT NULL,
  `qty` int NOT NULL DEFAULT '0',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `by_user` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for sales
INSERT INTO `sales` (`id`, `date`, `billNo`, `customer`, `product`, `qty`, `amount`, `by_user`, `created_at`) VALUES (1, '2026-06-23 07:05:29', 'SNT-1000', 'Surendhar S', 'Coconut Oil 100g Bottle', 2, '100.00', 'staff4', '2026-06-23 07:05:30');
INSERT INTO `sales` (`id`, `date`, `billNo`, `customer`, `product`, `qty`, `amount`, `by_user`, `created_at`) VALUES (2, '2026-06-23 07:45:25', 'SNT-1001', 'Kavin S', 'Castor Oil 1/2L Bottle', 5, '550.00', 'staff1', '2026-06-23 07:45:25');

-- ---------------------------------------------------------
-- 7. Table: refills
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `refills`;
CREATE TABLE `refills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL,
  `product` varchar(255) DEFAULT NULL,
  `qty` int NOT NULL DEFAULT '0',
  `by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for refills
INSERT INTO `refills` (`id`, `date`, `product`, `qty`, `by`, `created_at`) VALUES (1, '2026-06-23 07:10:10', 'Sesame Oil (Karmegam Premium) 15kg Tin', 10, 'admin', '2026-06-23 07:10:10');

-- ---------------------------------------------------------
-- 8. Table: price_history
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `price_history`;
CREATE TABLE `price_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL,
  `product` varchar(255) DEFAULT NULL,
  `old` decimal(12,2) NOT NULL DEFAULT '0.00',
  `new` decimal(12,2) NOT NULL DEFAULT '0.00',
  `by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------
-- 9. Table: login_logs
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `login_logs`;
CREATE TABLE `login_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `loginTime` datetime DEFAULT NULL,
  `logoutTime` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for login_logs
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (1, 'staff1', 'Staff', '2026-06-18 12:52:56', '2026-06-18 12:53:40', '2026-06-18 12:52:56');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (2, 'staff4', 'Staff', '2026-06-18 12:54:51', '2026-06-18 12:56:54', '2026-06-18 12:54:51');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (3, 'staff4', 'Staff', '2026-06-18 12:59:54', NULL, '2026-06-18 12:59:54');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (4, 'staff4', 'Staff', '2026-06-23 07:34:05', '2026-06-23 07:34:43', '2026-06-23 07:34:05');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (5, 'staff1', 'Staff', '2026-06-23 07:44:44', '2026-06-23 07:45:46', '2026-06-23 07:44:44');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (6, 'manager', 'Manager', '2026-07-03 06:30:22', NULL, '2026-07-03 06:30:22');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (7, 'staff1', 'Staff', '2026-07-03 06:38:36', '2026-07-03 06:39:14', '2026-07-03 06:38:36');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (8, 'manager', 'Manager', '2026-07-03 06:39:21', '2026-07-03 06:40:42', '2026-07-03 06:39:21');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (9, 'manager', 'Manager', '2026-07-03 10:52:30', '2026-07-03 10:53:01', '2026-07-03 10:52:30');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (10, 'staff1', 'Staff', '2026-07-03 10:54:18', '2026-07-03 10:54:24', '2026-07-03 10:54:18');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (11, 'staff1', 'Staff', '2026-07-03 10:55:37', '2026-07-03 10:55:45', '2026-07-03 10:55:37');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (12, 'staff1', 'Staff', '2026-07-03 10:56:29', '2026-07-03 10:56:48', '2026-07-03 10:56:29');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (13, 'manager', 'Manager', '2026-07-03 11:14:27', NULL, '2026-07-03 11:14:27');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (14, 'manager', 'Manager', '2026-07-03 11:16:06', '2026-07-03 11:16:12', '2026-07-03 11:16:06');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (15, 'manager', 'Manager', '2026-07-03 11:16:29', '2026-07-03 11:16:37', '2026-07-03 11:16:29');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (16, 'staff2', 'Staff', '2026-07-03 11:24:11', '2026-07-03 11:24:16', '2026-07-03 11:24:11');
INSERT INTO `login_logs` (`id`, `user`, `role`, `loginTime`, `logoutTime`, `created_at`) VALUES (17, 'staff2', 'Staff', '2026-07-03 11:24:33', '2026-07-03 11:25:25', '2026-07-03 11:24:33');

-- ---------------------------------------------------------
-- 10. Table: shift_reports
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `shift_reports`;
CREATE TABLE `shift_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int DEFAULT NULL,
  `user` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'Staff',
  `shift_start` datetime NOT NULL,
  `shift_end` datetime NOT NULL,
  `total_bills` int NOT NULL DEFAULT '0',
  `total_items_sold` int NOT NULL DEFAULT '0',
  `total_sales_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `payment_breakdown` json DEFAULT NULL,
  `remaining_stock_summary` json DEFAULT NULL,
  `report_email` varchar(255) DEFAULT NULL,
  `report_subject` varchar(255) DEFAULT NULL,
  `email_status` varchar(50) NOT NULL DEFAULT 'pending',
  `email_error` text,
  `email_sent_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for shift_reports
INSERT INTO `shift_reports` (`id`, `session_id`, `user`, `role`, `shift_start`, `shift_end`, `total_bills`, `total_items_sold`, `total_sales_amount`, `payment_breakdown`, `remaining_stock_summary`, `report_email`, `report_subject`, `email_status`, `email_error`, `email_sent_at`, `created_at`) VALUES (1, NULL, 'admin', 'Admin', '2026-07-03 10:54:30', '2026-07-03 10:54:35', 0, 0, '0.00', '{}', '{"totals":{"healthyCount":31,"lowStockCount":2,"totalProducts":34,"outOfStockCount":1},"products":[{"id":28,"name":"Castor Oil 1/2L Bottle","unit":"bottles","price":110,"status":"Healthy","category":"Castor","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":27,"name":"Castor Oil 1L Bottle","unit":"bottles","price":220,"status":"Healthy","category":"Castor","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":32,"name":"Coconut Oil 1/2L Bottle","unit":"bottles","price":185,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":31,"name":"Coconut Oil 1/2L Packet","unit":"pkts","price":185,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":25,"refilledInShift":0,"estimatedOpeningStock":25},{"id":34,"name":"Coconut Oil 100g Bottle","unit":"bottles","price":50,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":18,"refilledInShift":0,"estimatedOpeningStock":18},{"id":30,"name":"Coconut Oil 1L Bottle","unit":"bottles","price":370,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":29,"name":"Coconut Oil 1L Packet","unit":"pkts","price":370,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":30,"refilledInShift":0,"estimatedOpeningStock":30},{"id":33,"name":"Coconut Oil 200g Bottle","unit":"bottles","price":100,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":7,"name":"Groundnut Oil (Pure) 15kg Tin","unit":"tins","price":3000,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":8,"refilledInShift":0,"estimatedOpeningStock":8},{"id":9,"name":"Groundnut Oil (Pure) 1L Packet","unit":"pkts","price":193,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":40,"refilledInShift":0,"estimatedOpeningStock":40},{"id":8,"name":"Groundnut Oil (Pure) 5L Can","unit":"cans","price":955,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":6,"name":"Groundnut Oil (Refined) 1/2L Packet","unit":"pkts","price":92,"status":"Out of Stock","category":"Groundnut","soldInShift":0,"currentStock":0,"refilledInShift":0,"estimatedOpeningStock":0},{"id":1,"name":"Groundnut Oil (Refined) 15kg Tin","unit":"tins","price":2920,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":4,"name":"Groundnut Oil (Refined) 1L Bottle","unit":"bottles","price":188,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":30,"refilledInShift":0,"estimatedOpeningStock":30},{"id":5,"name":"Groundnut Oil (Refined) 1L Packet","unit":"pkts","price":184,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":50,"refilledInShift":0,"estimatedOpeningStock":50},{"id":3,"name":"Groundnut Oil (Refined) 2L Can","unit":"cans","price":383,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":2,"name":"Groundnut Oil (Refined) 5L Can","unit":"cans","price":930,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":13,"name":"Palm Oil 15kg Tin","unit":"tins","price":2445,"status":"Healthy","category":"Palm","soldInShift":0,"currentStock":24,"refilledInShift":0,"estimatedOpeningStock":24},{"id":15,"name":"Palm Oil 1L Packet","unit":"pkts","price":154,"status":"Healthy","category":"Palm","soldInShift":0,"currentStock":60,"refilledInShift":0,"estimatedOpeningStock":60},{"id":14,"name":"Palm Oil 5L Can","unit":"cans","price":780,"status":"Healthy","category":"Palm","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":20,"name":"Sesame Oil (Karmegam Premium) 15kg Tin","unit":"tins","price":4560,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":24,"name":"Sesame Oil (Karmegam) 1/2L Bottle","unit":"bottles","price":170,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":25,"name":"Sesame Oil (Karmegam) 1/2L Packet","unit":"pkts","price":165,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":25,"refilledInShift":0,"estimatedOpeningStock":25},{"id":22,"name":"Sesame Oil (Karmegam) 1L Bottle","unit":"bottles","price":340,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":23,"name":"Sesame Oil (Karmegam) 1L Packet","unit":"pkts","price":330,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":30,"refilledInShift":0,"estimatedOpeningStock":30},{"id":26,"name":"Sesame Oil (Karmegam) 200ml Bottle","unit":"bottles","price":70,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":21,"name":"Sesame Oil (Karmegam) 5L Can","unit":"cans","price":1575,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":18,"name":"Sesame Oil (Mayil) 1/2L Packet","unit":"pkts","price":160,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":25,"refilledInShift":0,"estimatedOpeningStock":25},{"id":17,"name":"Sesame Oil (Mayil) 1L Packet","unit":"pkts","price":320,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":19,"name":"Sesame Oil (Mukil) 15kg Tin","unit":"tins","price":4050,"status":"Low Stock","category":"Sesame","soldInShift":0,"currentStock":4,"refilledInShift":0,"estimatedOpeningStock":4},{"id":10,"name":"Sunflower Oil (Refined) 15kg Tin","unit":"tins","price":2950,"status":"Healthy","category":"Sunflower","soldInShift":0,"currentStock":12,"refilledInShift":0,"estimatedOpeningStock":12},{"id":12,"name":"Sunflower Oil (Refined) 1L Packet","unit":"pkts","price":186,"status":"Healthy","category":"Sunflower","soldInShift":0,"currentStock":85,"refilledInShift":0,"estimatedOpeningStock":85},{"id":11,"name":"Sunflower Oil (Refined) 5L Can","unit":"cans","price":940,"status":"Healthy","category":"Sunflower","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":16,"name":"Vanaspati 15kg Tin","unit":"tins","price":2700,"status":"Low Stock","category":"Vanaspati","soldInShift":0,"currentStock":5,"refilledInShift":0,"estimatedOpeningStock":5}]}', 'surendharkavin01@gmail.com', 'Shift Sales Report | Sri Nikil Tradings | admin | 03/07/2026', 'sent', NULL, '2026-07-03 10:54:35', '2026-07-03 10:54:40');
INSERT INTO `shift_reports` (`id`, `session_id`, `user`, `role`, `shift_start`, `shift_end`, `total_bills`, `total_items_sold`, `total_sales_amount`, `payment_breakdown`, `remaining_stock_summary`, `report_email`, `report_subject`, `email_status`, `email_error`, `email_sent_at`, `created_at`) VALUES (2, 11, 'staff1', 'Staff', '2026-07-03 10:55:37', '2026-07-03 10:55:45', 0, 0, '0.00', '{}', '{"totals":{"healthyCount":31,"lowStockCount":2,"totalProducts":34,"outOfStockCount":1},"products":[{"id":28,"name":"Castor Oil 1/2L Bottle","unit":"bottles","price":110,"status":"Healthy","category":"Castor","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":27,"name":"Castor Oil 1L Bottle","unit":"bottles","price":220,"status":"Healthy","category":"Castor","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":32,"name":"Coconut Oil 1/2L Bottle","unit":"bottles","price":185,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":31,"name":"Coconut Oil 1/2L Packet","unit":"pkts","price":185,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":25,"refilledInShift":0,"estimatedOpeningStock":25},{"id":34,"name":"Coconut Oil 100g Bottle","unit":"bottles","price":50,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":18,"refilledInShift":0,"estimatedOpeningStock":18},{"id":30,"name":"Coconut Oil 1L Bottle","unit":"bottles","price":370,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":29,"name":"Coconut Oil 1L Packet","unit":"pkts","price":370,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":30,"refilledInShift":0,"estimatedOpeningStock":30},{"id":33,"name":"Coconut Oil 200g Bottle","unit":"bottles","price":100,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":7,"name":"Groundnut Oil (Pure) 15kg Tin","unit":"tins","price":3000,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":8,"refilledInShift":0,"estimatedOpeningStock":8},{"id":9,"name":"Groundnut Oil (Pure) 1L Packet","unit":"pkts","price":193,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":40,"refilledInShift":0,"estimatedOpeningStock":40},{"id":8,"name":"Groundnut Oil (Pure) 5L Can","unit":"cans","price":955,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":6,"name":"Groundnut Oil (Refined) 1/2L Packet","unit":"pkts","price":92,"status":"Out of Stock","category":"Groundnut","soldInShift":0,"currentStock":0,"refilledInShift":0,"estimatedOpeningStock":0},{"id":1,"name":"Groundnut Oil (Refined) 15kg Tin","unit":"tins","price":2920,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":4,"name":"Groundnut Oil (Refined) 1L Bottle","unit":"bottles","price":188,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":30,"refilledInShift":0,"estimatedOpeningStock":30},{"id":5,"name":"Groundnut Oil (Refined) 1L Packet","unit":"pkts","price":184,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":50,"refilledInShift":0,"estimatedOpeningStock":50},{"id":3,"name":"Groundnut Oil (Refined) 2L Can","unit":"cans","price":383,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":2,"name":"Groundnut Oil (Refined) 5L Can","unit":"cans","price":930,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":13,"name":"Palm Oil 15kg Tin","unit":"tins","price":2445,"status":"Healthy","category":"Palm","soldInShift":0,"currentStock":24,"refilledInShift":0,"estimatedOpeningStock":24},{"id":15,"name":"Palm Oil 1L Packet","unit":"pkts","price":154,"status":"Healthy","category":"Palm","soldInShift":0,"currentStock":60,"refilledInShift":0,"estimatedOpeningStock":60},{"id":14,"name":"Palm Oil 5L Can","unit":"cans","price":780,"status":"Healthy","category":"Palm","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":20,"name":"Sesame Oil (Karmegam Premium) 15kg Tin","unit":"tins","price":4560,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":24,"name":"Sesame Oil (Karmegam) 1/2L Bottle","unit":"bottles","price":170,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":25,"name":"Sesame Oil (Karmegam) 1/2L Packet","unit":"pkts","price":165,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":25,"refilledInShift":0,"estimatedOpeningStock":25},{"id":22,"name":"Sesame Oil (Karmegam) 1L Bottle","unit":"bottles","price":340,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":23,"name":"Sesame Oil (Karmegam) 1L Packet","unit":"pkts","price":330,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":30,"refilledInShift":0,"estimatedOpeningStock":30},{"id":26,"name":"Sesame Oil (Karmegam) 200ml Bottle","unit":"bottles","price":70,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":21,"name":"Sesame Oil (Karmegam) 5L Can","unit":"cans","price":1575,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":18,"name":"Sesame Oil (Mayil) 1/2L Packet","unit":"pkts","price":160,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":25,"refilledInShift":0,"estimatedOpeningStock":25},{"id":17,"name":"Sesame Oil (Mayil) 1L Packet","unit":"pkts","price":320,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":19,"name":"Sesame Oil (Mukil) 15kg Tin","unit":"tins","price":4050,"status":"Low Stock","category":"Sesame","soldInShift":0,"currentStock":4,"refilledInShift":0,"estimatedOpeningStock":4},{"id":10,"name":"Sunflower Oil (Refined) 15kg Tin","unit":"tins","price":2950,"status":"Healthy","category":"Sunflower","soldInShift":0,"currentStock":12,"refilledInShift":0,"estimatedOpeningStock":12},{"id":12,"name":"Sunflower Oil (Refined) 1L Packet","unit":"pkts","price":186,"status":"Healthy","category":"Sunflower","soldInShift":0,"currentStock":85,"refilledInShift":0,"estimatedOpeningStock":85},{"id":11,"name":"Sunflower Oil (Refined) 5L Can","unit":"cans","price":940,"status":"Healthy","category":"Sunflower","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":16,"name":"Vanaspati 15kg Tin","unit":"tins","price":2700,"status":"Low Stock","category":"Vanaspati","soldInShift":0,"currentStock":5,"refilledInShift":0,"estimatedOpeningStock":5}]}', 'surendharkavin01@gmail.com', 'Shift Sales Report | Sri Nikil Tradings | staff1 | 03/07/2026', 'sent', NULL, '2026-07-03 10:55:45', '2026-07-03 10:55:49');
INSERT INTO `shift_reports` (`id`, `session_id`, `user`, `role`, `shift_start`, `shift_end`, `total_bills`, `total_items_sold`, `total_sales_amount`, `payment_breakdown`, `remaining_stock_summary`, `report_email`, `report_subject`, `email_status`, `email_error`, `email_sent_at`, `created_at`) VALUES (3, 14, 'manager', 'Manager', '2026-07-03 11:16:06', '2026-07-03 11:16:12', 0, 0, '0.00', '{}', '{"totals":{"healthyCount":31,"lowStockCount":2,"totalProducts":34,"outOfStockCount":1},"products":[{"id":28,"name":"Castor Oil 1/2L Bottle","unit":"bottles","price":110,"status":"Healthy","category":"Castor","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":27,"name":"Castor Oil 1L Bottle","unit":"bottles","price":220,"status":"Healthy","category":"Castor","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":32,"name":"Coconut Oil 1/2L Bottle","unit":"bottles","price":185,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":31,"name":"Coconut Oil 1/2L Packet","unit":"pkts","price":185,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":25,"refilledInShift":0,"estimatedOpeningStock":25},{"id":34,"name":"Coconut Oil 100g Bottle","unit":"bottles","price":50,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":18,"refilledInShift":0,"estimatedOpeningStock":18},{"id":30,"name":"Coconut Oil 1L Bottle","unit":"bottles","price":370,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":29,"name":"Coconut Oil 1L Packet","unit":"pkts","price":370,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":30,"refilledInShift":0,"estimatedOpeningStock":30},{"id":33,"name":"Coconut Oil 200g Bottle","unit":"bottles","price":100,"status":"Healthy","category":"Coconut","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":7,"name":"Groundnut Oil (Pure) 15kg Tin","unit":"tins","price":3000,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":8,"refilledInShift":0,"estimatedOpeningStock":8},{"id":9,"name":"Groundnut Oil (Pure) 1L Packet","unit":"pkts","price":193,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":40,"refilledInShift":0,"estimatedOpeningStock":40},{"id":8,"name":"Groundnut Oil (Pure) 5L Can","unit":"cans","price":955,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":6,"name":"Groundnut Oil (Refined) 1/2L Packet","unit":"pkts","price":92,"status":"Out of Stock","category":"Groundnut","soldInShift":0,"currentStock":0,"refilledInShift":0,"estimatedOpeningStock":0},{"id":1,"name":"Groundnut Oil (Refined) 15kg Tin","unit":"tins","price":2920,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":4,"name":"Groundnut Oil (Refined) 1L Bottle","unit":"bottles","price":188,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":30,"refilledInShift":0,"estimatedOpeningStock":30},{"id":5,"name":"Groundnut Oil (Refined) 1L Packet","unit":"pkts","price":184,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":50,"refilledInShift":0,"estimatedOpeningStock":50},{"id":3,"name":"Groundnut Oil (Refined) 2L Can","unit":"cans","price":383,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":2,"name":"Groundnut Oil (Refined) 5L Can","unit":"cans","price":930,"status":"Healthy","category":"Groundnut","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":13,"name":"Palm Oil 15kg Tin","unit":"tins","price":2445,"status":"Healthy","category":"Palm","soldInShift":0,"currentStock":24,"refilledInShift":0,"estimatedOpeningStock":24},{"id":15,"name":"Palm Oil 1L Packet","unit":"pkts","price":154,"status":"Healthy","category":"Palm","soldInShift":0,"currentStock":60,"refilledInShift":0,"estimatedOpeningStock":60},{"id":14,"name":"Palm Oil 5L Can","unit":"cans","price":780,"status":"Healthy","category":"Palm","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":20,"name":"Sesame Oil (Karmegam Premium) 15kg Tin","unit":"tins","price":4560,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":24,"name":"Sesame Oil (Karmegam) 1/2L Bottle","unit":"bottles","price":170,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":25,"name":"Sesame Oil (Karmegam) 1/2L Packet","unit":"pkts","price":165,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":25,"refilledInShift":0,"estimatedOpeningStock":25},{"id":22,"name":"Sesame Oil (Karmegam) 1L Bottle","unit":"bottles","price":340,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":23,"name":"Sesame Oil (Karmegam) 1L Packet","unit":"pkts","price":330,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":30,"refilledInShift":0,"estimatedOpeningStock":30},{"id":26,"name":"Sesame Oil (Karmegam) 200ml Bottle","unit":"bottles","price":70,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":21,"name":"Sesame Oil (Karmegam) 5L Can","unit":"cans","price":1575,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":10,"refilledInShift":0,"estimatedOpeningStock":10},{"id":18,"name":"Sesame Oil (Mayil) 1/2L Packet","unit":"pkts","price":160,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":25,"refilledInShift":0,"estimatedOpeningStock":25},{"id":17,"name":"Sesame Oil (Mayil) 1L Packet","unit":"pkts","price":320,"status":"Healthy","category":"Sesame","soldInShift":0,"currentStock":20,"refilledInShift":0,"estimatedOpeningStock":20},{"id":19,"name":"Sesame Oil (Mukil) 15kg Tin","unit":"tins","price":4050,"status":"Low Stock","category":"Sesame","soldInShift":0,"currentStock":4,"refilledInShift":0,"estimatedOpeningStock":4},{"id":10,"name":"Sunflower Oil (Refined) 15kg Tin","unit":"tins","price":2950,"status":"Healthy","category":"Sunflower","soldInShift":0,"currentStock":12,"refilledInShift":0,"estimatedOpeningStock":12},{"id":12,"name":"Sunflower Oil (Refined) 1L Packet","unit":"pkts","price":186,"status":"Healthy","category":"Sunflower","soldInShift":0,"currentStock":85,"refilledInShift":0,"estimatedOpeningStock":85},{"id":11,"name":"Sunflower Oil (Refined) 5L Can","unit":"cans","price":940,"status":"Healthy","category":"Sunflower","soldInShift":0,"currentStock":15,"refilledInShift":0,"estimatedOpeningStock":15},{"id":16,"name":"Vanaspati 15kg Tin","unit":"tins","price":2700,"status":"Low Stock","category":"Vanaspati","soldInShift":0,"currentStock":5,"refilledInShift":0,"estimatedOpeningStock":5}]}', 'surendharkavin01@gmail.com', 'Shift Sales Report | Sri Nikil Tradings | manager | 03/07/2026', 'sent', NULL, '2026-07-03 11:16:12', '2026-07-03 11:16:17');

-- ---------------------------------------------------------
-- 11. Table: settings
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `gst` decimal(5,2) NOT NULL DEFAULT '0.00',
  `shop` varchar(255) DEFAULT NULL,
  `addr` text,
  `gstin` varchar(100) DEFAULT NULL,
  `fssai` varchar(100) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `logo` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for settings
INSERT INTO `settings` (`id`, `gst`, `shop`, `addr`, `gstin`, `fssai`, `phone`, `logo`, `created_at`) VALUES (1, '7.00', 'Sri Nikil Tradings', '058/1, Bhavani Main Road, Opp. Central Warehouse, Erode - 638004', '33AMCPD1118L1ZK', '12424007000946', '94875 81302, 0424 2901803', NULL, '2026-05-01 14:09:54');

SET FOREIGN_KEY_CHECKS=1;
