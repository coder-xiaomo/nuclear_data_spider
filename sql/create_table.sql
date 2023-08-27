CREATE TABLE `nuclear_data` (
    `nuclear_data_id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    `value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    `date` date DEFAULT NULL,
    `parent_id` varchar(15) DEFAULT NULL,
    `type` varchar(5) DEFAULT NULL,
    `id` varchar(20) DEFAULT NULL,
    `itemkey` varchar(20) DEFAULT NULL,
    `itemcode` varchar(30) DEFAULT NULL,
    `itemname` varchar(30) DEFAULT NULL,
    `time` varchar(30) DEFAULT NULL,
    PRIMARY KEY (`nuclear_data_id`),
    UNIQUE KEY `uniquekey` (`name`, `location`, `date`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;