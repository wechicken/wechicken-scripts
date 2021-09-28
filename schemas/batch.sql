CREATE TABLE `batch` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nth` int(11) NOT NULL,
  `title` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `penalty` int(11) DEFAULT NULL,
  `count_per_week` int(11) DEFAULT NULL,
  `is_page_opened` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime DEFAULT NULL,
  `batch_type_id` int(11) NOT NULL,
  `manager_id` int(11) DEFAULT NULL COMMENT '치킨계장 user.id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;