-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 19, 2024 at 05:57 PM
-- Server version: 8.0.36-0ubuntu0.22.04.1
-- PHP Version: 8.1.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `packarma`
--
DROP DATABASE IF EXISTS `packarma`;
CREATE DATABASE IF NOT EXISTS `packarma` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `packarma`;

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `address_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `building` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `area` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `address_name`, `phone_number`, `building`, `area`, `created_at`) VALUES
(6, 40, 'Address 1', '+918160704091', '2nd Floor Gokuldham Society', 'Near Mumbai Film City', '2024-09-11 08:12:30'),
(60, 40, 'Address 1', '+918160704091', '2nd Floor Gokuldham Society', 'Near Mumbai Film City', '2024-09-13 07:01:37'),
(61, 40, 'Address 2', '+918160704091', '2nd Floor Gokuldham Society', 'Near Mumbai Film City', '2024-09-13 07:02:23');

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` bigint UNSIGNED NOT NULL,
  `emailid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phonenumber` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `emailid`, `name`, `password`, `phonenumber`, `country_code`, `address`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'krishjotaniya71@gmail.com', 'Krish Jotaniya', '$2a$10$XyqocVVAOEKIaDUPLY0ARO/oJ2bXh6abX5kgMqI/Yt/Xsv.TtL432', '1234567890', '+91', 'Heritage Residency', 'active', '2024-09-08 09:59:20', '2024-09-16 11:03:10'),
(2, 'test@admin.com', 'Test', '$2b$10$.c74pBhyRpiTRki1c4jZGe6dsCu1WVBO8Z/aq5cTBGIx/7UJiGyTS', '1234567890', '+91', '206 Heritage Residency, Opposite Uma Bhavan, Near Grand Hotel', 'active', '2024-09-08 10:26:59', '2024-09-18 12:22:23');

-- --------------------------------------------------------

--
-- Table structure for table `advertisement`
--

CREATE TABLE `advertisement` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `start_date_time` datetime NOT NULL,
  `end_date_time` datetime NOT NULL,
  `link` varchar(511) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `app_page` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(511) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `advertisement`
--

INSERT INTO `advertisement` (`id`, `title`, `description`, `start_date_time`, `end_date_time`, `link`, `app_page`, `image`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'advertisement New Ad', 'This is test advertisement', '2024-09-10 10:36:00', '2024-09-25 10:36:00', 'https://packarma.com/webadmin/banners', '', '/media/advertisement/1725964603989_advertisement.jpg', 'active', '2024-08-31 16:58:40', '2024-09-10 10:36:43'),
(2, 'Test Ad 2', 'sffsdfsgd', '2024-09-11 02:31:00', '2024-09-13 02:31:00', 'https://packarma.shellcode.cloud/', '', '/media/advertisement/1726021894636_advertisement.jpeg', 'active', '2024-09-11 02:31:34', '2024-09-11 02:31:34');

-- --------------------------------------------------------

--
-- Table structure for table `advertisement_activity`
--

CREATE TABLE `advertisement_activity` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `advertisement_id` bigint UNSIGNED NOT NULL,
  `activity_type` enum('view','click') COLLATE utf8mb4_unicode_ci NOT NULL,
  `activity_timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `advertisement_activity`
--

INSERT INTO `advertisement_activity` (`id`, `user_id`, `advertisement_id`, `activity_type`, `activity_timestamp`) VALUES
(2, 40, 1, 'click', '2024-09-13 06:51:02'),
(3, 40, 1, 'view', '2024-09-13 06:51:08'),
(4, 40, 2, 'view', '2024-09-13 06:51:11');

-- --------------------------------------------------------

--
-- Table structure for table `advertisement_product`
--

CREATE TABLE `advertisement_product` (
  `advertisement_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `banner`
--

CREATE TABLE `banner` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `start_date_time` datetime NOT NULL,
  `end_date_time` datetime NOT NULL,
  `link` varchar(511) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `app_page` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner_image` varchar(511) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `banner`
--

INSERT INTO `banner` (`id`, `title`, `description`, `start_date_time`, `end_date_time`, `link`, `app_page`, `banner_image`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Banner New', 'This is test banner ', '2024-09-10 10:36:00', '2024-09-26 10:36:00', 'https://packarma.com/webadmin/banners', '', '/media/banner/1725964587718_banner.jpeg', 'active', '2024-08-31 16:56:54', '2024-09-10 10:36:27'),
(2, 'Test Banner 2', 'fdskfhskhk', '2024-09-11 02:30:00', '2024-09-12 02:30:00', 'https://www.amazon.in/ASUS-Notebook', '', '/media/banner/1726021871639_banner.jpeg', 'active', '2024-09-11 02:31:11', '2024-09-11 02:31:11');

-- --------------------------------------------------------

--
-- Table structure for table `banner_activity`
--

CREATE TABLE `banner_activity` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `banner_id` bigint UNSIGNED NOT NULL,
  `activity_type` enum('view','click') COLLATE utf8mb4_unicode_ci NOT NULL,
  `activity_timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `banner_activity`
--

INSERT INTO `banner_activity` (`id`, `user_id`, `banner_id`, `activity_type`, `activity_timestamp`) VALUES
(8, 40, 1, 'view', '2024-09-10 16:57:26'),
(9, 40, 1, 'view', '2024-09-10 17:57:34'),
(10, 40, 1, 'click', '2024-09-10 17:57:47'),
(11, 40, 1, 'click', '2024-09-13 06:50:24'),
(12, 40, 2, 'click', '2024-09-13 06:50:40'),
(13, 40, 2, 'click', '2024-09-13 14:27:51'),
(14, 40, 2, 'view', '2024-09-13 14:28:07'),
(15, 40, 2, 'view', '2024-09-13 15:00:43'),
(16, 33, 2, 'view', '2024-09-13 15:16:00'),
(17, 33, 1, 'view', '2024-09-13 15:16:14'),
(18, 33, 2, 'view', '2024-09-13 15:33:35'),
(19, 33, 1, 'view', '2024-09-13 16:01:57'),
(20, 33, 1, 'click', '2024-09-13 16:01:58'),
(21, 33, 1, 'view', '2024-09-13 16:02:02'),
(22, 33, 1, 'click', '2024-09-13 16:02:03'),
(23, 33, 1, 'click', '2024-09-13 16:02:03'),
(24, 33, 2, 'view', '2024-09-13 16:02:04'),
(25, 33, 2, 'click', '2024-09-13 16:02:04'),
(26, 33, 2, 'click', '2024-09-13 16:02:04'),
(27, 33, 2, 'click', '2024-09-13 16:02:04'),
(28, 33, 2, 'click', '2024-09-13 16:02:05'),
(29, 33, 2, 'click', '2024-09-13 16:02:05'),
(30, 33, 2, 'click', '2024-09-13 16:02:05'),
(31, 33, 2, 'click', '2024-09-13 16:02:05'),
(32, 33, 2, 'click', '2024-09-13 16:02:06'),
(33, 33, 2, 'view', '2024-09-13 16:02:11'),
(34, 33, 2, 'click', '2024-09-13 16:02:12'),
(35, 33, 2, 'view', '2024-09-13 16:02:17'),
(36, 33, 2, 'click', '2024-09-13 16:02:18'),
(37, 33, 1, 'view', '2024-09-13 16:02:21'),
(38, 33, 2, 'click', '2024-09-13 16:07:01'),
(39, 33, 2, 'view', '2024-09-13 16:07:18'),
(40, 33, 1, 'view', '2024-09-13 17:22:45'),
(41, 33, 2, 'view', '2024-09-13 17:22:46'),
(42, 33, 1, 'view', '2024-09-13 17:22:46'),
(43, 33, 1, 'click', '2024-09-13 17:22:47'),
(44, 33, 1, 'click', '2024-09-13 17:22:48'),
(45, 33, 1, 'click', '2024-09-13 17:22:49'),
(46, 33, 1, 'click', '2024-09-13 17:22:49'),
(47, 33, 1, 'click', '2024-09-13 17:24:45'),
(48, 33, 1, 'click', '2024-09-13 17:24:46'),
(49, 33, 2, 'view', '2024-09-13 17:24:47'),
(50, 33, 2, 'click', '2024-09-13 17:24:48'),
(51, 33, 1, 'click', '2024-09-13 17:25:46'),
(52, 33, 2, 'view', '2024-09-13 17:25:47'),
(53, 33, 2, 'click', '2024-09-13 17:25:48'),
(54, 33, 2, 'click', '2024-09-13 17:25:48'),
(55, 33, 2, 'click', '2024-09-13 17:26:55'),
(56, 33, 2, 'view', '2024-09-13 17:27:02'),
(57, 33, 2, 'view', '2024-09-14 07:43:36'),
(58, 33, 1, 'view', '2024-09-14 07:43:36'),
(59, 33, 2, 'view', '2024-09-14 12:08:19'),
(60, 33, 1, 'view', '2024-09-14 12:08:20'),
(61, 33, 2, 'click', '2024-09-14 17:16:21'),
(62, 33, 2, 'view', '2024-09-14 17:16:28'),
(63, 33, 2, 'click', '2024-09-14 17:16:30'),
(64, 33, 1, 'view', '2024-09-14 17:16:38'),
(65, 33, 2, 'view', '2024-09-16 10:39:24'),
(66, 33, 1, 'view', '2024-09-16 10:39:25'),
(67, 33, 1, 'view', '2024-09-16 11:07:38'),
(68, 33, 1, 'view', '2024-09-16 12:41:56'),
(69, 33, 1, 'view', '2024-09-17 17:01:09'),
(70, 33, 2, 'view', '2024-09-17 17:01:09'),
(71, 33, 2, 'view', '2024-09-17 17:02:30'),
(72, 33, 1, 'view', '2024-09-17 17:02:31'),
(73, 33, 2, 'view', '2024-09-17 17:47:05'),
(74, 33, 1, 'view', '2024-09-17 17:47:06'),
(75, 33, 1, 'click', '2024-09-17 17:47:07'),
(76, 33, 1, 'click', '2024-09-17 17:47:08'),
(77, 33, 1, 'click', '2024-09-17 17:47:09'),
(78, 33, 1, 'click', '2024-09-17 17:47:10'),
(79, 33, 2, 'view', '2024-09-17 17:47:10'),
(80, 33, 2, 'click', '2024-09-17 17:47:11'),
(81, 33, 2, 'click', '2024-09-17 17:47:11'),
(82, 33, 2, 'click', '2024-09-17 17:47:12');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `image`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Home And Personal Care', '/media/categories/1725986400057_categories.jpg', 'active', '2024-09-03 10:50:36', '2024-09-10 16:40:00'),
(2, 'Pharma', '/media/categories/1725986418278_categories.jpeg', 'active', '2024-09-05 15:40:25', '2024-09-16 09:21:07'),
(3, 'Food', '/media/categories/1726022218885_categories.jpeg', 'active', '2024-09-11 02:36:58', '2024-09-16 09:20:51');

-- --------------------------------------------------------

--
-- Table structure for table `credit_history`
--

CREATE TABLE `credit_history` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `change_amount` int NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `credit_history`
--

INSERT INTO `credit_history` (`id`, `user_id`, `change_amount`, `description`, `created_at`) VALUES
(2, 33, 2, 'Credit added by admin', '2024-09-11 13:20:39'),
(3, 35, 2, 'Credit added by admin', '2024-09-11 13:20:41'),
(4, 38, 4, 'Credit added by admin', '2024-09-11 13:20:43'),
(5, 33, 2, 'Credit added by admin', '2024-09-12 04:53:19'),
(6, 35, 4, 'Credit added by admin', '2024-09-12 06:43:47'),
(7, 33, 7, 'Credit added by admin', '2024-09-13 05:17:54'),
(8, 36, 2, 'Credit added by admin', '2024-09-13 11:01:42'),
(9, 33, 1, '1 Credit has been used to search packaging.', '2024-09-17 15:11:09'),
(10, 33, 1, '1 Credit has been used to search packaging.', '2024-09-17 15:11:23'),
(11, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 15:47:46'),
(12, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 15:47:56'),
(13, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 15:48:01'),
(14, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 15:48:04'),
(15, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 15:48:12'),
(16, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 15:48:15'),
(17, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 15:48:25'),
(18, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 15:48:33'),
(19, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 15:48:36'),
(20, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 15:48:39'),
(21, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 15:48:41'),
(22, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 15:48:47'),
(23, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 15:48:49'),
(24, 33, 1, '1 Credit has been used to search packaging.', '2024-09-17 15:57:18'),
(25, 33, 1, '1 Credit has been used to search packaging.', '2024-09-17 16:08:29'),
(26, 33, 1, '1 Credit has been used to search packaging.', '2024-09-17 16:33:08'),
(27, 33, 1, '1 Credit has been used to search packaging.', '2024-09-17 16:34:12'),
(28, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 16:34:40'),
(29, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 16:34:45'),
(30, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 16:35:29'),
(31, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 16:35:37'),
(32, 33, 10, '1 Credit has been used to search packaging.', '2024-09-17 16:40:21'),
(33, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 16:40:25'),
(34, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 16:40:45'),
(35, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 16:40:56'),
(36, 33, -1, '1 Credit has been used to search packaging.', '2024-09-17 16:41:12'),
(37, 33, -6, '1 Credit has been used to search packaging.', '2024-09-17 16:41:21'),
(38, 33, 10, '1 Credit has been used to search packaging.', '2024-09-17 17:01:32'),
(39, 40, 2, 'Credit added by admin', '2024-09-18 06:20:32'),
(40, 33, -1, '1 Credit has been used to search packaging.', '2024-09-18 17:47:24'),
(41, 33, -1, '1 Credit has been used to search packaging.', '2024-09-18 17:47:29'),
(42, 33, -1, '1 Credit has been used to search packaging.', '2024-09-18 18:19:35'),
(43, 33, -1, '1 Credit has been used to search packaging.', '2024-09-18 18:59:11'),
(44, 33, -1, '1 Credit has been used to search packaging.', '2024-09-18 19:18:39');

-- --------------------------------------------------------

--
-- Table structure for table `credit_invoice`
--

CREATE TABLE `credit_invoice` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `plan_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `number_of_credits` int UNSIGNED NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `invoice_link` varchar(511) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_date` date NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `credit_invoice`
--

INSERT INTO `credit_invoice` (`id`, `user_id`, `plan_type`, `number_of_credits`, `total`, `invoice_link`, `invoice_date`, `createdAt`, `updatedAt`) VALUES
(2, 40, 'Normal', 1, 12.00, '', '2024-09-12', '2024-09-13 07:14:04', '2024-09-13 07:14:04');

-- --------------------------------------------------------

--
-- Table structure for table `credit_prices`
--

CREATE TABLE `credit_prices` (
  `id` bigint UNSIGNED NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `percentage` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `credit_prices`
--

INSERT INTO `credit_prices` (`id`, `price`, `percentage`, `currency`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 100.00, 10.00, 'USD', 'active', '2024-09-14 17:10:29', '2024-09-14 17:10:29'),
(2, 200.50, 15.00, 'EUR', 'active', '2024-09-14 17:10:29', '2024-09-14 17:10:29'),
(3, 150.75, 12.00, 'GBP', 'active', '2024-09-14 17:10:29', '2024-09-14 17:10:29'),
(4, 300.00, 8.00, 'USD', 'active', '2024-09-14 17:10:29', '2024-09-14 17:10:29'),
(5, 250.25, 20.00, 'JPY', 'active', '2024-09-14 17:10:29', '2024-09-14 17:10:29'),
(6, 175.50, 18.00, 'INR', 'active', '2024-09-14 17:10:29', '2024-09-14 17:10:29'),
(7, 400.00, 10.00, 'CAD', 'active', '2024-09-14 17:10:29', '2024-09-14 17:10:29'),
(8, 350.10, 5.00, 'AUD', 'active', '2024-09-14 17:10:29', '2024-09-14 17:10:29'),
(9, 500.00, 25.00, 'USD', 'active', '2024-09-14 17:10:29', '2024-09-17 08:31:49');

-- --------------------------------------------------------

--
-- Table structure for table `CustomerGeneralSettings`
--

CREATE TABLE `CustomerGeneralSettings` (
  `id` bigint UNSIGNED NOT NULL,
  `instagram_link` varchar(511) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_link` varchar(511) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitter_link` varchar(511) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `youtube_link` varchar(511) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `app_link_android` varchar(511) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `app_link_ios` varchar(511) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `app_version_android` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `app_version_ios` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `system_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `system_phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `meta_keywords` text COLLATE utf8mb4_unicode_ci,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `CustomerGeneralSettings`
--

INSERT INTO `CustomerGeneralSettings` (`id`, `instagram_link`, `facebook_link`, `twitter_link`, `youtube_link`, `app_link_android`, `app_link_ios`, `app_version_android`, `app_version_ios`, `system_email`, `system_phone_number`, `meta_title`, `meta_description`, `meta_keywords`, `createdAt`, `updatedAt`) VALUES
(1, 'https://www.instagram.com/yourprofile', 'https://www.facebook.com/yourprofile', 'https://twitter.com/yourprofile', 'https://www.youtube.com/channel/yourchannel', 'https://play.google.com/store/apps/details?id=com.yourapp.android', 'https://apps.apple.com/app/id/yourappid', '1.0.0', '1.0.0', 'support@yourdomain.com', '+91 816345091', 'ewq', 'e', 'qweq', '2024-09-03 10:47:27', '2024-09-10 16:50:24');

-- --------------------------------------------------------

--
-- Table structure for table `help_support`
--

CREATE TABLE `help_support` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `help_support`
--

INSERT INTO `help_support` (`id`, `name`, `phone_number`, `issue`, `createdAt`, `updatedAt`) VALUES
(1, 'Krish Jotaniya', '1234567890', 'I dont have any issue! Byee', '2024-09-09 13:14:04', '2024-09-09 13:14:04'),
(2, 'Krish Jotaniya', '1234567890', 'I dont have any issue! Byee', '2024-09-13 06:50:07', '2024-09-13 06:50:07'),
(3, 'Krish Jotaniya', '1234567890', 'I dont have any issue! Byee', '2024-09-16 08:33:13', '2024-09-16 08:33:13'),
(4, 'infotech', '7986341849', 'network issue', '2024-09-16 08:45:36', '2024-09-16 08:45:36'),
(5, 'infotech', '7986341849', 'network issue', '2024-09-16 08:46:34', '2024-09-16 08:46:34'),
(6, 'bb', '7986341849', 'network issue ', '2024-09-16 08:48:19', '2024-09-16 08:48:19'),
(7, 'infotech', '7986341849', 'network issue', '2024-09-16 10:39:04', '2024-09-16 10:39:04');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_details`
--

CREATE TABLE `invoice_details` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gst_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ifsc_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `benificiary_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_details`
--

INSERT INTO `invoice_details` (`id`, `name`, `gst_number`, `address`, `bank_name`, `account_number`, `ifsc_code`, `benificiary_number`, `createdAt`, `updatedAt`) VALUES
(1, 'sdfs', 'sdf', 'sfdsf', 'sfs', 'fs', 'sdfsf', 'sfsfsfsf', '2024-09-10 16:51:17', '2024-09-10 16:51:29');

-- --------------------------------------------------------

--
-- Table structure for table `measurement_unit`
--

CREATE TABLE `measurement_unit` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `symbol` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `measurement_unit`
--

INSERT INTO `measurement_unit` (`id`, `name`, `symbol`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Kilogram', 'Kg', 'active', '2024-09-03 11:07:24', '2024-09-03 11:07:24'),
(2, 'Gram', 'gm', 'active', '2024-09-03 11:07:42', '2024-09-16 10:05:30'),
(3, 'miligrams', 'mg', 'active', '2024-09-03 11:07:51', '2024-09-05 15:03:27'),
(4, 'milliliter', 'ml', 'active', '2024-09-03 11:07:56', '2024-09-03 11:08:00'),
(5, 'Numbers', 'No', 'active', '2024-09-19 09:35:57', '2024-09-19 09:35:57'),
(6, 'milliliter', 'ml', 'active', '2024-09-19 09:36:18', '2024-09-19 09:36:18');

-- --------------------------------------------------------

--
-- Table structure for table `otp`
--

CREATE TABLE `otp` (
  `otp_id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED DEFAULT NULL,
  `admin_id` int UNSIGNED DEFAULT NULL,
  `otp_type` enum('reset_password','verify_email') COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `packaging_machine`
--

CREATE TABLE `packaging_machine` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `packaging_machine`
--

INSERT INTO `packaging_machine` (`id`, `name`, `image`, `short_description`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Piston Filling Machine	', '/media/packagingmachine/1725986455124_packagingmachine.jpeg', 'Dropper Filling Machine', 'active', '2024-09-03 10:57:26', '2024-09-10 16:40:55'),
(2, 'Rotary Sealing', '/media/packagingmachine/1726022557906_packagingmachine.jpeg', 'Rotary Sealing\r\n', 'active', '2024-09-11 02:42:37', '2024-09-18 10:49:37'),
(3, 'Strip Sealing', '/media/packagingmachine/1726022574688_packagingmachine.jpeg', 'Strip Sealing', 'active', '2024-09-11 02:42:54', '2024-09-18 10:49:05'),
(4, 'Flat bed Sealing', '/media/packagingmachine/1726656629249_packagingmachine.jpeg', 'Flat bed Sealing', 'active', '2024-09-18 10:50:29', '2024-09-18 10:50:29'),
(5, 'Not Applicable', '/media/packagingmachine/1726656658249_packagingmachine.jpeg', 'Not Applicable', 'active', '2024-09-18 10:50:58', '2024-09-18 10:50:58'),
(6, 'HFFS', '/media/packagingmachine/1726656790528_packagingmachine.jpeg', 'HFFS', 'active', '2024-09-18 10:53:10', '2024-09-18 10:53:10'),
(7, 'VFFS', '/media/packagingmachine/1726656827563_packagingmachine.jpeg', 'VFFS', 'active', '2024-09-18 10:53:47', '2024-09-18 10:53:47'),
(8, 'Rotary Filling Machine', '/media/packagingmachine/1726656874991_packagingmachine.jpeg', 'Rotary Filling Machine', 'active', '2024-09-18 10:54:34', '2024-09-18 10:54:34'),
(9, 'Multihead Liquid Filling Machine', '/media/packagingmachine/1726656893434_packagingmachine.jpeg', 'Multihead Liquid Filling Machine', 'active', '2024-09-18 10:54:53', '2024-09-18 10:54:53');

-- --------------------------------------------------------

--
-- Table structure for table `packaging_material`
--

CREATE TABLE `packaging_material` (
  `id` bigint UNSIGNED NOT NULL,
  `material_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `material_description` text COLLATE utf8mb4_unicode_ci,
  `wvtr` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otr` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cof` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gsm` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `special_feature` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `packaging_material`
--

INSERT INTO `packaging_material` (`id`, `material_name`, `material_description`, `wvtr`, `otr`, `cof`, `sit`, `gsm`, `special_feature`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Sample A', 'High-performance packaging material with excellent barrier properties.', '0.02', '0.04', '0.35', '120.00', '150.00', 'UV-resistant coating, recyclable material.', 'active', '2024-09-04 13:59:38', '2024-09-05 15:03:31'),
(2, 'LAMINATE - 10 MIC PET/ADH/25 MIC MET CPP', '10 MIC PET/ADH/25 MIC MET CPP', '0.7 - 1.3', '35 - 65', '0.15 -0.35', '105', '41.5', 'hjbhj', 'active', '2024-09-16 10:44:59', '2024-09-16 11:42:12'),
(3, 'LAMINATE - 15 MIC BOPP/ADH/25 MIC MET CPP', '15 MIC BOPP/ADH/25 MIC MET CPP', '0.7 - 1.3', '35-65', '0.15-0.35', '105', '40.85', 'BOPP', 'active', '2024-09-16 11:05:31', '2024-09-16 11:45:34'),
(4, 'E-FLUTED CARTON - E-FLUTED CARTON', 'E-FLUTED CARTON - E-FLUTED CARTON', '0.00', '0.00', '0.00', '0.00', '0.00', 'E-FLUTED CARTON - E-FLUTED CARTON', 'active', '2024-09-16 11:13:05', '2024-09-16 11:13:05'),
(5, '5PLY CORRUGATED FIBER BOARD BOX PACKAGING', '5PLY CORRUGATED FIBER BOARD BOX PACKAGING', '70-80', '10-20', '34-50', '10', '20-30', '', 'active', '2024-09-16 11:13:39', '2024-09-19 07:27:32'),
(7, '10 MIC PET/10 GSM EXT PE/25 MIC MET CPP', '10 MIC PET/10 GSM EXT PE/25 MIC MET CPP', '0.49-0.91', '0.56-1.04', '0.15-0.25', '110', '63.1', '', 'active', '2024-09-19 07:03:44', '2024-09-19 07:27:47'),
(8, '10 MIC PET/10 GSM EXT PE/25 MIC MET CPP', '10 MIC PET/10 GSM EXT PE/25 MIC MET CPP', '0.49-0.91', '0.56-1.04', '0.15-0.35', '105', '90.7', '', 'active', '2024-09-19 08:41:02', '2024-09-19 08:41:02');

-- --------------------------------------------------------

--
-- Table structure for table `packaging_solution`
--

CREATE TABLE `packaging_solution` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `structure_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sequence` int NOT NULL,
  `storage_condition_id` bigint UNSIGNED NOT NULL,
  `display_shelf_life_days` int NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `product_category_id` bigint UNSIGNED NOT NULL,
  `product_form_id` bigint UNSIGNED NOT NULL,
  `packaging_treatment_id` bigint UNSIGNED NOT NULL,
  `packing_type_id` bigint UNSIGNED NOT NULL,
  `packaging_machine_id` bigint UNSIGNED NOT NULL,
  `packaging_material_id` bigint UNSIGNED NOT NULL,
  `product_min_weight` decimal(10,2) NOT NULL,
  `product_max_weight` decimal(10,2) NOT NULL,
  `min_order_quantity` int NOT NULL,
  `min_order_quantity_unit_id` bigint UNSIGNED NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `packaging_solution`
--

INSERT INTO `packaging_solution` (`id`, `name`, `structure_type`, `sequence`, `storage_condition_id`, `display_shelf_life_days`, `product_id`, `product_category_id`, `product_form_id`, `packaging_treatment_id`, `packing_type_id`, `packaging_machine_id`, `packaging_material_id`, `product_min_weight`, `product_max_weight`, `min_order_quantity`, `min_order_quantity_unit_id`, `image`, `status`, `createdAt`, `updatedAt`) VALUES
(4, 'Hello Test 2', 'Sustainable Solution', 11, 1, 300, 2, 2, 1, 1, 2, 1, 1, 43.00, 100.00, 1, 3, '/media/packagingsolution/1726333706691_packagingsolution.jpeg', 'active', '2024-09-10 16:39:19', '2024-09-19 06:37:31'),
(6, '10 MIC PET/ADH/25 MIC MET CPP', 'Economical Solutions', 1, 5, 180, 11, 3, 3, 4, 3, 3, 2, 1.00, 250.00, 100, 1, '/media/packagingsolution/1726487838923_packagingsolution.jpg', 'active', '2024-09-16 11:57:18', '2024-09-18 10:15:15'),
(7, '15 MIC BOPP/ADH/25 MIC MET CPP', 'Economical Solutions', 2, 5, 180, 11, 3, 3, 4, 4, 3, 3, 1.00, 250.00, 100, 1, '/media/packagingsolution/1726487960469_packagingsolution.jpg', 'active', '2024-09-16 11:59:20', '2024-09-18 10:15:25'),
(8, 'Hello Test 1', 'Economical Solution', 23, 4, 100, 2, 2, 1, 2, 1, 3, 5, 100.00, 500.00, 10, 4, '/media/packagingsolution/1726580474876_packagingsolution.jpeg', 'active', '2024-09-17 13:41:14', '2024-09-19 06:37:26'),
(9, 'E-FLUTED CARTON - E-FLUTED CARTON', 'Economical Solution', 1, 6, 1800, 11, 3, 3, 4, 3, 3, 4, 100.00, 1000.00, 100, 2, '/media/packagingsolution/1726655318881_packagingsolution.jpeg', 'active', '2024-09-18 10:28:38', '2024-09-18 16:28:25'),
(10, '	5PLY CORRUGATED FIBER BOARD BOX PACKAGING', 'Advance Solution', 1, 6, 1000, 11, 3, 3, 4, 2, 5, 5, 10.00, 5000.00, 500, 1, '/media/packagingsolution/1726724522669_packagingsolution.jpeg', 'active', '2024-09-19 05:42:02', '2024-09-19 06:37:20'),
(11, '10 MIC PET/10 GSM EXT PE/25 MIC MET CPP', 'Economical Solution', 1, 6, 180, 10, 3, 3, 4, 4, 5, 7, 1.00, 200.00, 100, 1, '/media/packagingsolution/1726729543710_packagingsolution.jpeg', 'active', '2024-09-19 07:05:43', '2024-09-19 10:06:26'),
(12, '10 MIC PET/10 GSM EXT PE/25 MIC MET CPP', 'Economical Solutions.', 1, 6, 180, 9, 3, 3, 2, 4, 5, 7, 1.00, 250.00, 50, 1, '/media/packagingsolution/1726729646072_packagingsolution.jpeg', 'active', '2024-09-19 07:07:26', '2024-09-19 07:07:26'),
(13, '10 MIC PET/10 GSM EXT PE/25 MIC MET CPP', 'Economical Solution', 1, 7, 180, 7, 3, 3, 3, 4, 5, 7, 1.00, 250.00, 50, 1, '/media/packagingsolution/1726729765456_packagingsolution.jpeg', 'active', '2024-09-19 07:09:25', '2024-09-19 10:06:15'),
(14, '10 MIC PET/10 GSM EXT PE/25 MIC MET CPP', 'Economical Solution', 1, 7, 180, 8, 3, 3, 3, 4, 5, 7, 1.00, 250.00, 25, 1, '/media/packagingsolution/1726729884416_packagingsolution.jpeg', 'active', '2024-09-19 07:11:24', '2024-09-19 10:06:19'),
(15, '10 MIC PET/ADH/25 MIC MET CPP', 'Economical Solution', 1, 7, 180, 7, 3, 3, 3, 4, 5, 2, 1.00, 250.00, 10, 1, '/media/packagingsolution/1726730057052_packagingsolution.jpeg', 'active', '2024-09-19 07:14:17', '2024-09-19 10:06:10'),
(16, '10 MIC PET/ADH/25 MIC MET CPP', 'Economical Solution', 1, 7, 180, 8, 3, 3, 3, 4, 5, 2, 1.00, 250.00, 5, 1, '/media/packagingsolution/1726730134259_packagingsolution.jpeg', 'active', '2024-09-19 07:15:34', '2024-09-19 10:06:06'),
(17, '10 MIC PET/ADH/25 MIC MET CPP', 'Economical Solution', 1, 7, 180, 10, 3, 3, 4, 4, 5, 2, 1.00, 250.00, 5, 1, '/media/packagingsolution/1726731008449_packagingsolution.jpeg', 'active', '2024-09-19 07:30:08', '2024-09-19 10:06:02'),
(18, '10 MIC PET/ADH/25 MIC MET CPP', 'Economical Solution', 1, 7, 180, 4, 3, 3, 4, 4, 5, 2, 1.00, 250.00, 5, 1, '/media/packagingsolution/1726734260203_packagingsolution.jpeg', 'active', '2024-09-19 08:24:20', '2024-09-19 10:59:00');

-- --------------------------------------------------------

--
-- Table structure for table `packaging_treatment`
--

CREATE TABLE `packaging_treatment` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `packaging_treatment`
--

INSERT INTO `packaging_treatment` (`id`, `name`, `short_description`, `image`, `featured`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Nitrogen Filling	', 'He Nitrogen Packaging System Essentially Involves Replacing Oxygen With Nitrogen In Food Packing.	', '/media/packagingtreatment/1725986474124_packagingtreatment.jpeg', 1, 'active', '2024-09-03 10:58:12', '2024-09-10 16:41:14'),
(2, 'Iso 1644 Cleanroom Standard', 'Cleanroom Is A Room Or Contained Environment Where It Is Crucial To Keep Particle Counts Low.', '/media/packagingtreatment/1725986465304_packagingtreatment.jpeg', 1, 'active', '2024-09-03 10:58:29', '2024-09-16 10:16:11'),
(3, 'Heat Treatment', 'Heat Treatment\r\n=', '/media/packagingtreatment/1726022601395_packagingtreatment.jpeg', 1, 'active', '2024-09-11 02:43:21', '2024-09-11 02:43:25'),
(4, 'Regular Packing', 'Regular Packing', '/media/packagingtreatment/1726481766130_packagingtreatment.jpg', 1, 'active', '2024-09-16 10:16:06', '2024-09-16 10:16:09');

-- --------------------------------------------------------

--
-- Table structure for table `packing_type`
--

CREATE TABLE `packing_type` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `packing_type`
--

INSERT INTO `packing_type` (`id`, `name`, `short_description`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'All Packaging Type', 'All Packaging Type', 'active', '2024-09-03 10:55:49', '2024-09-03 10:55:49'),
(2, 'Tertiary Packaging', 'Used to transportaion of product', 'active', '2024-09-03 10:56:01', '2024-09-03 10:56:13'),
(3, 'Secondary Packaging', 'Direct contact with the primary packaging', 'active', '2024-09-03 10:56:09', '2024-09-04 13:53:51'),
(4, 'Primary Packaging', 'Direct Contact With The Product', 'active', '2024-09-03 10:56:25', '2024-09-05 13:39:22');

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE `pages` (
  `id` bigint UNSIGNED NOT NULL,
  `page_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pages`
--

INSERT INTO `pages` (`id`, `page_name`, `createdAt`, `updatedAt`) VALUES
(1, 'Dashboard', '2024-09-07 03:42:16', '2024-09-07 03:42:16'),
(2, 'Master', '2024-09-07 04:00:26', '2024-09-07 04:00:26'),
(3, 'Product Master', '2024-09-07 05:46:31', '2024-09-07 05:46:31'),
(4, 'Customer Section', '2024-09-07 05:46:31', '2024-09-07 05:46:31'),
(5, 'Staff', '2024-09-07 05:46:31', '2024-09-07 05:46:31'),
(6, 'Contact Us', '2024-09-07 05:46:31', '2024-09-07 05:46:31'),
(7, 'Report', '2024-09-07 05:46:31', '2024-09-07 05:46:31'),
(8, 'General Settings', '2024-09-07 05:46:31', '2024-09-07 05:46:31'),
(9, 'Developer Settings', '2024-09-17 08:43:34', '2024-09-17 08:43:34');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint UNSIGNED NOT NULL,
  `admin_id` bigint UNSIGNED NOT NULL,
  `page_id` bigint UNSIGNED NOT NULL,
  `can_create` tinyint(1) NOT NULL DEFAULT '0',
  `can_read` tinyint(1) NOT NULL DEFAULT '0',
  `can_update` tinyint(1) NOT NULL DEFAULT '0',
  `can_delete` tinyint(1) NOT NULL DEFAULT '0',
  `can_export` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `admin_id`, `page_id`, `can_create`, `can_read`, `can_update`, `can_delete`, `can_export`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 1, 1, 1, 1, 1, '2024-09-07 17:09:38', '2024-09-10 17:55:08'),
(2, 1, 2, 1, 1, 1, 1, 1, '2024-09-07 17:09:38', '2024-09-10 18:27:59'),
(3, 1, 3, 1, 1, 1, 1, 1, '2024-09-07 17:09:38', '2024-09-10 17:55:10'),
(4, 1, 4, 1, 1, 1, 1, 1, '2024-09-07 17:09:38', '2024-09-10 17:55:11'),
(5, 1, 5, 1, 1, 1, 1, 1, '2024-09-07 17:09:38', '2024-09-10 09:23:16'),
(6, 1, 6, 1, 1, 1, 1, 1, '2024-09-07 17:09:38', '2024-09-07 17:09:38'),
(7, 1, 7, 1, 1, 1, 1, 1, '2024-09-07 17:09:38', '2024-09-07 17:09:38'),
(8, 1, 8, 1, 1, 1, 1, 1, '2024-09-07 17:09:38', '2024-09-07 17:09:38'),
(9, 2, 1, 1, 0, 1, 1, 0, '2024-09-10 09:02:16', '2024-09-12 13:25:12'),
(10, 2, 2, 1, 0, 1, 1, 0, '2024-09-10 09:02:33', '2024-09-12 13:25:12'),
(11, 2, 3, 1, 0, 1, 1, 0, '2024-09-10 09:02:34', '2024-09-12 13:25:12'),
(12, 2, 4, 1, 0, 1, 1, 0, '2024-09-10 09:02:35', '2024-09-12 13:25:13'),
(13, 2, 5, 1, 0, 1, 1, 0, '2024-09-10 09:02:36', '2024-09-12 13:25:16'),
(14, 2, 6, 1, 0, 1, 1, 0, '2024-09-10 09:02:37', '2024-09-12 13:25:16'),
(15, 2, 7, 1, 0, 1, 1, 0, '2024-09-10 09:02:39', '2024-09-12 13:25:15'),
(16, 2, 8, 1, 0, 1, 1, 0, '2024-09-10 09:02:40', '2024-09-12 13:25:15'),
(17, 1, 9, 1, 1, 1, 1, 1, '2024-09-17 08:44:30', '2024-09-17 08:44:30');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` bigint UNSIGNED NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `sub_category_id` bigint UNSIGNED NOT NULL,
  `product_form_id` bigint UNSIGNED NOT NULL,
  `packaging_treatment_id` bigint UNSIGNED NOT NULL,
  `measurement_unit_id` bigint UNSIGNED NOT NULL,
  `product_image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `product_name`, `category_id`, `sub_category_id`, `product_form_id`, `packaging_treatment_id`, `measurement_unit_id`, `product_image`, `status`, `createdAt`, `updatedAt`) VALUES
(2, 'Test', 2, 2, 1, 2, 3, '/media/product/1725986304324_product.png', 'active', '2024-09-10 16:38:24', '2024-09-10 16:38:24'),
(4, 'Sugar Based Biscuits', 3, 2, 3, 4, 2, '/media/product/1726333694273_product.jpeg', 'active', '2024-09-14 17:08:14', '2024-09-19 07:32:28'),
(5, 'baby food', 3, 8, 3, 2, 2, '/media/product/1726481431674_product.jpg', 'active', '2024-09-16 10:10:31', '2024-09-16 10:10:31'),
(6, 'Gummies', 3, 15, 1, 2, 3, '/media/product/1726481529793_product.jpg', 'active', '2024-09-16 10:12:09', '2024-09-16 10:12:09'),
(7, 'Cream Biscuits', 3, 15, 3, 3, 3, '/media/product/1726481587555_product.jpg', 'active', '2024-09-16 10:13:07', '2024-09-16 10:13:07'),
(8, 'Sugar Coated Biscuits', 3, 15, 3, 3, 2, '/media/product/1726481650750_product.jpg', 'active', '2024-09-16 10:14:10', '2024-09-16 10:14:10'),
(9, 'Rusk / Toast', 3, 15, 3, 2, 2, '/media/product/1726481691346_product.jpg', 'active', '2024-09-16 10:14:51', '2024-09-16 10:14:51'),
(10, 'Salted Biscuits', 3, 15, 3, 4, 2, '/media/product/1726481882065_product.jpg', 'active', '2024-09-16 10:18:02', '2024-09-16 10:18:02'),
(11, 'Cake', 3, 15, 3, 4, 2, '/media/product/1726482090016_product.jpg', 'active', '2024-09-16 10:21:30', '2024-09-16 10:21:30');

-- --------------------------------------------------------

--
-- Table structure for table `product_form`
--

CREATE TABLE `product_form` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `short_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_form`
--

INSERT INTO `product_form` (`id`, `name`, `image`, `status`, `short_description`, `createdAt`, `updatedAt`) VALUES
(1, 'Semi - Solid', '/media/productform/1725986444809_productform.jpg', 'active', 'Gel or cream are terms often used of a semi-solid', '2024-09-03 10:52:33', '2024-09-10 16:40:44'),
(2, 'Liquid', '/media/productform/1726022515667_productform.jpeg', 'active', 'Liquid state for beverages and syrups', '2024-09-11 02:41:55', '2024-09-11 02:41:55'),
(3, 'Solid', '/media/productform/1726022529018_productform.jpeg', 'active', 'Solid like a rock', '2024-09-11 02:42:09', '2024-09-11 02:42:09');

-- --------------------------------------------------------

--
-- Table structure for table `redeem_requests`
--

CREATE TABLE `redeem_requests` (
  `id` int UNSIGNED NOT NULL,
  `referral_id` int UNSIGNED NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `redeem_status` tinyint(1) DEFAULT '0',
  `redeem_requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `redeem_requests`
--

INSERT INTO `redeem_requests` (`id`, `referral_id`, `description`, `redeem_status`, `redeem_requested_at`, `createdAt`, `updatedAt`) VALUES
(1, 4, NULL, 0, '2024-09-15 15:49:45', '2024-09-14 12:32:17', '2024-09-15 15:49:45');

-- --------------------------------------------------------

--
-- Table structure for table `referrals`
--

CREATE TABLE `referrals` (
  `id` int UNSIGNED NOT NULL,
  `referral_code_id` int UNSIGNED NOT NULL,
  `referred_user_id` int UNSIGNED NOT NULL,
  `account_created` tinyint(1) DEFAULT '0',
  `subscription_completed` tinyint(1) DEFAULT '0',
  `redeem_status` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `referrals`
--

INSERT INTO `referrals` (`id`, `referral_code_id`, `referred_user_id`, `account_created`, `subscription_completed`, `redeem_status`, `createdAt`, `updatedAt`) VALUES
(3, 23, 42, 1, 0, 0, '2024-09-13 06:51:40', '2024-09-13 06:51:40'),
(4, 18, 45, 1, 1, 0, '2024-09-14 11:31:00', '2024-09-14 13:08:17');

-- --------------------------------------------------------

--
-- Table structure for table `referral_codes`
--

CREATE TABLE `referral_codes` (
  `id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `referral_codes`
--

INSERT INTO `referral_codes` (`id`, `user_id`, `code`, `createdAt`, `updatedAt`) VALUES
(18, 33, '2PbjLQjMq9', '2024-09-09 13:23:19', '2024-09-09 13:23:19'),
(19, 35, '8byjLRhniT', '2024-09-09 13:25:38', '2024-09-09 13:25:38'),
(20, 36, '42TdsJb9xA', '2024-09-09 14:20:10', '2024-09-09 14:20:10'),
(21, 37, 'HzSxPJgd3U', '2024-09-09 14:22:19', '2024-09-09 14:22:19'),
(22, 38, 'v2aQyConz2', '2024-09-10 15:48:52', '2024-09-10 15:48:52'),
(23, 40, 'CblTpmm5TN', '2024-09-10 16:56:33', '2024-09-10 16:56:33'),
(24, 42, 'ZDFrrRxzHE', '2024-09-13 06:51:40', '2024-09-13 06:51:40'),
(25, 45, 'Kbid051stN', '2024-09-14 11:31:00', '2024-09-14 11:31:00');

-- --------------------------------------------------------

--
-- Table structure for table `search_history`
--

CREATE TABLE `search_history` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `packaging_solution_id` bigint UNSIGNED NOT NULL,
  `search_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `search_history`
--

INSERT INTO `search_history` (`id`, `user_id`, `packaging_solution_id`, `search_time`) VALUES
(5, 40, 4, '2024-09-13 07:04:08'),
(6, 40, 4, '2024-09-17 17:33:01');

-- --------------------------------------------------------

--
-- Table structure for table `storage_condition`
--

CREATE TABLE `storage_condition` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `storage_condition`
--

INSERT INTO `storage_condition` (`id`, `name`, `short_description`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Cold (-18 Degree C Or Below)', 'Stored At -18 Degree Celcius Or Below', 'active', '2024-09-03 10:58:42', '2024-09-03 10:58:42'),
(2, 'Cold (8 Degree C Or Above)', 'Stored And Refrigerated Below 8 Degree Celcius', 'active', '2024-09-03 10:58:49', '2024-09-05 13:39:06'),
(3, 'Cold ((Stored at refrigerated condition)', 'Cold ((Stored at refrigerated condition)', 'active', '2024-09-16 11:29:58', '2024-09-16 11:32:36'),
(4, 'Cold (4 Degree C Or Above)', 'Cold (4 Degree C Or Above)', 'active', '2024-09-16 11:31:27', '2024-09-16 11:31:27'),
(5, 'Room temperature(Stored in cool and dry place away from light)', 'Room temperature(Stored in cool and dry place away from light)', 'active', '2024-09-16 11:33:01', '2024-09-16 11:33:01'),
(6, 'Room temperature (Stored in cool and dry place)', 'Room temperature (Stored in cool and dry place)', 'active', '2024-09-16 11:33:29', '2024-09-16 11:33:29'),
(7, 'Not Applicable', 'Not Applicable', 'active', '2024-09-16 11:36:59', '2024-09-16 11:36:59');

-- --------------------------------------------------------

--
-- Table structure for table `subcategories`
--

CREATE TABLE `subcategories` (
  `id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subcategories`
--

INSERT INTO `subcategories` (`id`, `category_id`, `name`, `image`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Oral Care	', '/media/subcategories/1725986429832_subcategories.webp', 'active', '2024-09-03 10:51:04', '2024-09-10 16:40:29'),
(2, 2, 'Cold Brew', '/media/subcategories/1725986424660_subcategories.jpeg', 'active', '2024-09-05 15:41:15', '2024-09-10 16:40:24'),
(3, 3, 'Crunchy Puffs', '/media/subcategories/1726022257500_subcategories.jpeg', 'active', '2024-09-11 02:37:37', '2024-09-11 02:37:37'),
(6, 2, 'Mocktails', '/media/subcategories/1726022467119_subcategories.jpeg', 'active', '2024-09-11 02:41:07', '2024-09-11 02:41:07'),
(7, 1, 'Toothpaste', '/media/subcategories/1726022493388_subcategories.jpeg', 'active', '2024-09-11 02:41:33', '2024-09-11 02:41:33'),
(8, 3, 'baby food', '/media/subcategories/1726479784109_subcategories.jpg', 'active', '2024-09-16 09:43:04', '2024-09-16 09:43:04'),
(9, 3, 'Pet Food', '/media/subcategories/1726479986180_subcategories.jpg', 'active', '2024-09-16 09:46:26', '2024-09-16 09:46:26'),
(10, 3, 'Processed Food', '/media/subcategories/1726480050805_subcategories.jpg', 'active', '2024-09-16 09:47:30', '2024-09-16 09:47:30'),
(11, 3, 'Fats,oils & Emulsions', '/media/subcategories/1726480095632_subcategories.jpg', 'active', '2024-09-16 09:48:15', '2024-09-16 09:48:15'),
(12, 3, 'Dry & Dehydrated Products', '/media/subcategories/1726480146348_subcategories.jpg', 'active', '2024-09-16 09:49:06', '2024-09-16 09:49:06'),
(13, 3, 'Jam,jelly And Marmalades', '/media/subcategories/1726480261711_subcategories.jpg', 'active', '2024-09-16 09:51:01', '2024-09-16 09:51:01'),
(14, 3, 'Fresh Fruits And Vegetables', '/media/subcategories/1726480300153_subcategories.jpg', 'active', '2024-09-16 09:51:40', '2024-09-16 09:51:40'),
(15, 3, 'Bakery & Confectionary', '/media/subcategories/1726480368521_subcategories.jpg', 'active', '2024-09-16 09:52:48', '2024-09-16 09:52:48');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint UNSIGNED NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `credit_amount` int UNSIGNED NOT NULL DEFAULT '0',
  `duration` int UNSIGNED NOT NULL,
  `benefits` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sequence` int UNSIGNED NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `type`, `credit_amount`, `duration`, `benefits`, `sequence`, `deleted_at`, `createdAt`, `updatedAt`) VALUES
(1, 'Free Trial', 100, 6, 'Access to basic features#Standard support', 1, NULL, '2024-08-31 11:47:57', '2024-09-17 15:09:39'),
(2, '1 Month', 300, 30, 'Access to standard features#Priority support', 2, NULL, '2024-08-31 11:47:57', '2024-09-18 04:30:53'),
(3, '3 Months', 500, 90, 'Access to all premium features#Priority support#Exclusive content', 3, NULL, '2024-08-31 11:47:57', '2024-09-18 04:31:18'),
(4, '6 Months', 1000, 180, 'All premium features#Dedicated support#Custom integrations', 4, NULL, '2024-08-31 11:47:57', '2024-09-19 11:12:10'),
(5, '12 Months', 1000, 365, 'All premium features#Dedicated support#Custom integrations', 5, NULL, '2024-08-31 11:47:57', '2024-09-19 11:12:10');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions_prices`
--

CREATE TABLE `subscriptions_prices` (
  `id` bigint UNSIGNED NOT NULL,
  `subscription_id` bigint UNSIGNED NOT NULL,
  `price` int UNSIGNED NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscriptions_prices`
--

INSERT INTO `subscriptions_prices` (`id`, `subscription_id`, `price`, `currency`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 1, 0, 'USD', 'active', '2024-09-13 14:15:33', '2024-09-14 16:59:02'),
(2, 1, 0, 'EUR', 'active', '2024-09-13 14:15:33', '2024-09-14 16:59:05'),
(3, 1, 0, 'INR', 'active', '2024-09-13 14:15:33', '2024-09-14 16:59:07'),
(4, 2, 50, 'USD', 'active', '2024-09-13 14:15:33', '2024-09-13 14:15:33'),
(5, 2, 60, 'EUR', 'active', '2024-09-13 14:15:33', '2024-09-13 14:15:33'),
(6, 2, 4000, 'INR', 'active', '2024-09-13 14:15:33', '2024-09-13 14:15:33'),
(7, 3, 150, 'USD', 'active', '2024-09-13 14:15:57', '2024-09-13 14:15:57'),
(8, 3, 170, 'EUR', 'active', '2024-09-13 14:15:57', '2024-09-13 14:15:57'),
(9, 3, 12000, 'INR', 'active', '2024-09-13 14:15:57', '2024-09-13 14:15:57'),
(10, 4, 75, 'USD', 'active', '2024-09-13 14:15:57', '2024-09-13 14:15:57'),
(11, 4, 85, 'EUR', 'active', '2024-09-13 14:15:57', '2024-09-13 14:15:57'),
(12, 4, 6000, 'INR', 'active', '2024-09-13 14:15:57', '2024-09-13 14:15:57'),
(13, 5, 6000, 'INR', 'active', '2024-09-13 14:15:57', '2024-09-13 14:15:57');

-- --------------------------------------------------------

--
-- Table structure for table `subscription_invoice`
--

CREATE TABLE `subscription_invoice` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `subscription_id` bigint UNSIGNED NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `invoice_link` varchar(511) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_date` date NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription_invoice`
--

INSERT INTO `subscription_invoice` (`id`, `user_id`, `subscription_id`, `total`, `invoice_link`, `invoice_date`, `createdAt`, `updatedAt`) VALUES
(1, 40, 1, 12.00, '', '2024-09-12', '2024-09-14 17:22:10', '2024-09-14 17:22:10');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int UNSIGNED NOT NULL,
  `firstname` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_domain` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified` tinyint(1) DEFAULT '0',
  `gst_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gst_document_link` varchar(511) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_code` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referral_code_id` int UNSIGNED DEFAULT NULL,
  `credits` int UNSIGNED NOT NULL DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `firstname`, `lastname`, `email`, `email_domain`, `password`, `email_verified`, `gst_number`, `gst_document_link`, `email_verified_at`, `phone_number`, `country_code`, `referral_code_id`, `credits`, `createdAt`, `updatedAt`) VALUES
(33, 'aditi', 'salaria', 'aditisalaria7@gmail.com', 'aditi129@gmail.com', '$2a$10$J5.ZQUSzXrf5F/cxDnfESOsAWORq1rBKJRiwiqNe8lchWqpQx24Su', 0, '123456789012312', '/media/gst_document/1726476645001_gst_document.jpg', NULL, '7986341849', NULL, 18, 5, '2024-09-09 13:23:19', '2024-09-18 19:18:39'),
(35, 'aman', 'dal', 'amanrathoreaaa@gmail.com', NULL, '$2a$10$Ot0MH3GAyLkK/GOryQh24.qTQRphLc2GNf8XmbbFQbqbzJmPivdNe', 0, NULL, NULL, NULL, NULL, NULL, 19, 6, '2024-09-09 13:25:38', '2024-09-12 06:43:47'),
(36, 'shef', 'salaria', 'shefalisalaria95@gmail.com', NULL, '$2a$10$3iVWnwogqW36fFEk4ekFauMluEwWWdaG3AqFv/erPC1eCLvU1KRGC', 1, NULL, NULL, '2024-09-10 09:28:35', NULL, NULL, 20, 2, '2024-09-09 14:20:10', '2024-09-13 11:01:42'),
(37, 'mandy', 'singh', 'mandeepsinghaaa@gmail.com', NULL, '$2a$10$bXLqoTcE2picBAgi1y7ZVOv.OrqAV7hphtay1aZjS6dJrVlpnR95y', 1, NULL, NULL, '2024-09-09 14:23:15', NULL, NULL, 21, 0, '2024-09-09 14:22:19', '2024-09-09 14:23:15'),
(38, 'Aditi', 'Salaria', 'aditisalaria129@gmail.com', NULL, '$2a$10$ovDmzA0SKO3i3mzEie7IFOo/KKkafTFqLupgZvqjdw39nMLxlO9d2', 0, NULL, NULL, NULL, NULL, NULL, 22, 4, '2024-09-10 15:48:52', '2024-09-11 13:20:43'),
(40, 'Krish', 'Jotaniya', 'krishjotaniya71@gmail.com', 'krish@jotaniya.com', '$2a$10$sbYHHmf/jS8L1ltuWxrmbOX0yP510KmOVKddqFqoatEllp6AnSBuO', 0, NULL, NULL, NULL, NULL, NULL, 23, 2, '2024-09-10 16:56:33', '2024-09-18 06:20:32'),
(42, 'Neel', 'Jotaiya', 'neeljotaniya@gmail.com', NULL, '$2a$10$st/OxC2pqRap7iWenVrxBe8LJYmkrXrfOhsbtlg6GNR/uQk.1z96i', 0, NULL, NULL, NULL, NULL, NULL, 24, 0, '2024-09-13 06:51:40', '2024-09-13 06:51:40'),
(45, 'Mandeep', 'Sungh', 'mandeepsingh181196@gmail.com', NULL, '$2a$10$VcJ7QM13rPBa/8InwRc9BeRy/x97lUqn/hql50YWcg4yWfxWo7mJq', 1, NULL, NULL, '2024-09-14 11:33:53', NULL, NULL, 25, 0, '2024-09-14 11:31:00', '2024-09-14 11:33:53');

-- --------------------------------------------------------

--
-- Table structure for table `user_subscriptions`
--

CREATE TABLE `user_subscriptions` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `subscription_id` bigint UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_subscriptions`
--

INSERT INTO `user_subscriptions` (`id`, `user_id`, `subscription_id`, `start_date`, `end_date`, `createdAt`, `updatedAt`) VALUES
(1, 40, 1, '2024-09-12', '2024-09-15', '2024-09-13 07:00:24', '2024-09-13 07:00:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `advertisement`
--
ALTER TABLE `advertisement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `title` (`title`);

--
-- Indexes for table `advertisement_activity`
--
ALTER TABLE `advertisement_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `advertisement_id` (`advertisement_id`),
  ADD KEY `activity_type` (`activity_type`),
  ADD KEY `activity_timestamp` (`activity_timestamp`);

--
-- Indexes for table `advertisement_product`
--
ALTER TABLE `advertisement_product`
  ADD PRIMARY KEY (`advertisement_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `banner`
--
ALTER TABLE `banner`
  ADD PRIMARY KEY (`id`),
  ADD KEY `title` (`title`);

--
-- Indexes for table `banner_activity`
--
ALTER TABLE `banner_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `banner_id` (`banner_id`),
  ADD KEY `activity_type` (`activity_type`),
  ADD KEY `activity_timestamp` (`activity_timestamp`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`);

--
-- Indexes for table `credit_history`
--
ALTER TABLE `credit_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `credit_invoice`
--
ALTER TABLE `credit_invoice`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `credit_prices`
--
ALTER TABLE `credit_prices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `CustomerGeneralSettings`
--
ALTER TABLE `CustomerGeneralSettings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `help_support`
--
ALTER TABLE `help_support`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `invoice_details`
--
ALTER TABLE `invoice_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `measurement_unit`
--
ALTER TABLE `measurement_unit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`);

--
-- Indexes for table `otp`
--
ALTER TABLE `otp`
  ADD PRIMARY KEY (`otp_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `packaging_machine`
--
ALTER TABLE `packaging_machine`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`);

--
-- Indexes for table `packaging_material`
--
ALTER TABLE `packaging_material`
  ADD PRIMARY KEY (`id`),
  ADD KEY `material_name` (`material_name`);

--
-- Indexes for table `packaging_solution`
--
ALTER TABLE `packaging_solution`
  ADD PRIMARY KEY (`id`),
  ADD KEY `storage_condition_id` (`storage_condition_id`),
  ADD KEY `min_order_quantity_unit_id` (`min_order_quantity_unit_id`),
  ADD KEY `structure_type` (`structure_type`),
  ADD KEY `sequence` (`sequence`),
  ADD KEY `display_shelf_life_days` (`display_shelf_life_days`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `product_category_id` (`product_category_id`),
  ADD KEY `product_form_id` (`product_form_id`),
  ADD KEY `packaging_treatment_id` (`packaging_treatment_id`),
  ADD KEY `packing_type_id` (`packing_type_id`),
  ADD KEY `packaging_machine_id` (`packaging_machine_id`),
  ADD KEY `packaging_material_id` (`packaging_material_id`),
  ADD KEY `min_order_quantity` (`min_order_quantity`),
  ADD KEY `name` (`name`);

--
-- Indexes for table `packaging_treatment`
--
ALTER TABLE `packaging_treatment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`);

--
-- Indexes for table `packing_type`
--
ALTER TABLE `packing_type`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`);

--
-- Indexes for table `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `page_name` (`page_name`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `page_id` (`page_id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_name` (`product_name`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `sub_category_id` (`sub_category_id`),
  ADD KEY `product_form_id` (`product_form_id`),
  ADD KEY `packaging_treatment_id` (`packaging_treatment_id`),
  ADD KEY `measurement_unit_id` (`measurement_unit_id`);

--
-- Indexes for table `product_form`
--
ALTER TABLE `product_form`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`);

--
-- Indexes for table `redeem_requests`
--
ALTER TABLE `redeem_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `referral_id` (`referral_id`);

--
-- Indexes for table `referrals`
--
ALTER TABLE `referrals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `referral_code_id` (`referral_code_id`),
  ADD KEY `referred_user_id` (`referred_user_id`);

--
-- Indexes for table `referral_codes`
--
ALTER TABLE `referral_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `search_history`
--
ALTER TABLE `search_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `packaging_solution_id` (`packaging_solution_id`),
  ADD KEY `search_time` (`search_time`);

--
-- Indexes for table `storage_condition`
--
ALTER TABLE `storage_condition`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`);

--
-- Indexes for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `type` (`type`);

--
-- Indexes for table `subscriptions_prices`
--
ALTER TABLE `subscriptions_prices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscription_id` (`subscription_id`);

--
-- Indexes for table `subscription_invoice`
--
ALTER TABLE `subscription_invoice`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscription_id` (`subscription_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `email_2` (`email`),
  ADD KEY `referral_code_id` (`referral_code_id`);

--
-- Indexes for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `subscription_id` (`subscription_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `advertisement`
--
ALTER TABLE `advertisement`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `advertisement_activity`
--
ALTER TABLE `advertisement_activity`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `banner`
--
ALTER TABLE `banner`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `banner_activity`
--
ALTER TABLE `banner_activity`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `credit_history`
--
ALTER TABLE `credit_history`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `credit_invoice`
--
ALTER TABLE `credit_invoice`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `credit_prices`
--
ALTER TABLE `credit_prices`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `CustomerGeneralSettings`
--
ALTER TABLE `CustomerGeneralSettings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `help_support`
--
ALTER TABLE `help_support`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `invoice_details`
--
ALTER TABLE `invoice_details`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `measurement_unit`
--
ALTER TABLE `measurement_unit`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `otp`
--
ALTER TABLE `otp`
  MODIFY `otp_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `packaging_machine`
--
ALTER TABLE `packaging_machine`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `packaging_material`
--
ALTER TABLE `packaging_material`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `packaging_solution`
--
ALTER TABLE `packaging_solution`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `packaging_treatment`
--
ALTER TABLE `packaging_treatment`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `packing_type`
--
ALTER TABLE `packing_type`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `product_form`
--
ALTER TABLE `product_form`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `redeem_requests`
--
ALTER TABLE `redeem_requests`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `referrals`
--
ALTER TABLE `referrals`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `referral_codes`
--
ALTER TABLE `referral_codes`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `search_history`
--
ALTER TABLE `search_history`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `storage_condition`
--
ALTER TABLE `storage_condition`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `subcategories`
--
ALTER TABLE `subcategories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `subscriptions_prices`
--
ALTER TABLE `subscriptions_prices`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `subscription_invoice`
--
ALTER TABLE `subscription_invoice`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `advertisement_activity`
--
ALTER TABLE `advertisement_activity`
  ADD CONSTRAINT `advertisement_activity_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `advertisement_activity_ibfk_2` FOREIGN KEY (`advertisement_id`) REFERENCES `advertisement` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `advertisement_product`
--
ALTER TABLE `advertisement_product`
  ADD CONSTRAINT `advertisement_product_ibfk_1` FOREIGN KEY (`advertisement_id`) REFERENCES `advertisement` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `advertisement_product_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `banner_activity`
--
ALTER TABLE `banner_activity`
  ADD CONSTRAINT `banner_activity_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `banner_activity_ibfk_2` FOREIGN KEY (`banner_id`) REFERENCES `banner` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `credit_history`
--
ALTER TABLE `credit_history`
  ADD CONSTRAINT `credit_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `credit_invoice`
--
ALTER TABLE `credit_invoice`
  ADD CONSTRAINT `credit_invoice_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `otp`
--
ALTER TABLE `otp`
  ADD CONSTRAINT `fk_otp_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `packaging_solution`
--
ALTER TABLE `packaging_solution`
  ADD CONSTRAINT `packaging_solution_ibfk_1` FOREIGN KEY (`storage_condition_id`) REFERENCES `storage_condition` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `packaging_solution_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `packaging_solution_ibfk_3` FOREIGN KEY (`product_category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `packaging_solution_ibfk_4` FOREIGN KEY (`product_form_id`) REFERENCES `product_form` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `packaging_solution_ibfk_5` FOREIGN KEY (`packaging_treatment_id`) REFERENCES `packaging_treatment` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `packaging_solution_ibfk_6` FOREIGN KEY (`packing_type_id`) REFERENCES `packing_type` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `packaging_solution_ibfk_7` FOREIGN KEY (`packaging_machine_id`) REFERENCES `packaging_machine` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `packaging_solution_ibfk_8` FOREIGN KEY (`packaging_material_id`) REFERENCES `packaging_material` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `packaging_solution_ibfk_9` FOREIGN KEY (`min_order_quantity_unit_id`) REFERENCES `measurement_unit` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `permissions`
--
ALTER TABLE `permissions`
  ADD CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `permissions_ibfk_2` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_ibfk_2` FOREIGN KEY (`sub_category_id`) REFERENCES `subcategories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_ibfk_3` FOREIGN KEY (`product_form_id`) REFERENCES `product_form` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_ibfk_4` FOREIGN KEY (`packaging_treatment_id`) REFERENCES `packaging_treatment` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_ibfk_5` FOREIGN KEY (`measurement_unit_id`) REFERENCES `measurement_unit` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `redeem_requests`
--
ALTER TABLE `redeem_requests`
  ADD CONSTRAINT `redeem_requests_ibfk_1` FOREIGN KEY (`referral_id`) REFERENCES `referrals` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `referrals`
--
ALTER TABLE `referrals`
  ADD CONSTRAINT `fk_referrals_referral_code_id` FOREIGN KEY (`referral_code_id`) REFERENCES `referral_codes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_referrals_referred_user_id` FOREIGN KEY (`referred_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `referral_codes`
--
ALTER TABLE `referral_codes`
  ADD CONSTRAINT `fk_referral_codes_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `search_history`
--
ALTER TABLE `search_history`
  ADD CONSTRAINT `search_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `search_history_ibfk_2` FOREIGN KEY (`packaging_solution_id`) REFERENCES `packaging_solution` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD CONSTRAINT `subcategories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscriptions_prices`
--
ALTER TABLE `subscriptions_prices`
  ADD CONSTRAINT `subscriptions_prices_ibfk_1` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscription_invoice`
--
ALTER TABLE `subscription_invoice`
  ADD CONSTRAINT `subscription_invoice_ibfk_1` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subscription_invoice_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_referral_code_id` FOREIGN KEY (`referral_code_id`) REFERENCES `referral_codes` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD CONSTRAINT `user_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_subscriptions_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
