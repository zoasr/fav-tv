ALTER TABLE `entries` MODIFY COLUMN `title` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` MODIFY COLUMN `type` varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` MODIFY COLUMN `director` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` MODIFY COLUMN `yearTime` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` ADD `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` ADD CONSTRAINT `entries_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;