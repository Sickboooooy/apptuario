ALTER TABLE `users` ADD `username` text;
--> statement-breakpoint
ALTER TABLE `users` ADD `password_hash` text;
--> statement-breakpoint
ALTER TABLE `users` ADD `password_salt` text;
--> statement-breakpoint
ALTER TABLE `users` ADD `court_id` text;
--> statement-breakpoint
ALTER TABLE `users` ADD `court_circuit` integer;
--> statement-breakpoint
ALTER TABLE `users` ADD `court_type` text;
--> statement-breakpoint
ALTER TABLE `users` ADD `court_address` text;
--> statement-breakpoint
ALTER TABLE `users` ADD `court_source` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_username` ON `users` (`username`);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_user_sessions_token` ON `user_sessions` (`token_hash`);
--> statement-breakpoint
CREATE INDEX `idx_user_sessions_user` ON `user_sessions` (`user_id`);
