CREATE TABLE `entries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`type` varchar(32),
	`director` varchar(255),
	`budget` varchar(255),
	`location` varchar(255),
	`duration` varchar(255),
	`yearTime` varchar(64),
	CONSTRAINT `entries_id` PRIMARY KEY(`id`)
);
