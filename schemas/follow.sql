CREATE TABLE `follow` (
  `follwer_id` int(11) NOT NULL,
  `following_id` int(11) NOT NULL,
  `status` tinyint(4) NOT NULL,
  PRIMARY KEY (`follwer_id`,`following_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;