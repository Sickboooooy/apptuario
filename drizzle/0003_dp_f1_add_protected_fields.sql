CREATE TABLE `case_keys` (
	`case_id` text NOT NULL,
	`wrapped_dek` text NOT NULL,
	`key_version` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_case_keys_case_version` ON `case_keys` (`case_id`,`key_version`);--> statement-breakpoint
CREATE TABLE `evidence_events` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`event_type` text NOT NULL,
	`payload_hash` text NOT NULL,
	`prev_event_hash` text,
	`actor_user_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_evidence_events_case` ON `evidence_events` (`case_id`,`created_at`);--> statement-breakpoint
CREATE TRIGGER `trg_evidence_events_no_update`
BEFORE UPDATE ON `evidence_events`
BEGIN
  SELECT RAISE(ABORT, 'evidence_events is append-only: UPDATE is not permitted');
END;--> statement-breakpoint
CREATE TRIGGER `trg_evidence_events_no_delete`
BEFORE DELETE ON `evidence_events`
BEGIN
  SELECT RAISE(ABORT, 'evidence_events is append-only: DELETE is not permitted');
END;--> statement-breakpoint
CREATE TABLE `token_dictionary` (
	`case_id` text NOT NULL,
	`token` text NOT NULL,
	`value_ciphertext` text NOT NULL,
	`value_iv` text NOT NULL,
	`value_tag` text NOT NULL,
	`key_version` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_token_dictionary_case_token` ON `token_dictionary` (`case_id`,`token`);--> statement-breakpoint
ALTER TABLE `cases` ADD `claimant_ciphertext` text;--> statement-breakpoint
ALTER TABLE `cases` ADD `claimant_iv` text;--> statement-breakpoint
ALTER TABLE `cases` ADD `claimant_tag` text;--> statement-breakpoint
ALTER TABLE `cases` ADD `claimant_key_version` integer;--> statement-breakpoint
ALTER TABLE `cases` ADD `claimant_blind_index` text;--> statement-breakpoint
CREATE INDEX `idx_cases_claimant_blind` ON `cases` (`claimant_blind_index`);--> statement-breakpoint
ALTER TABLE `recipients` ADD `recipient_kind` text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipients` ADD `data_classification` text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipients` ADD `name_ciphertext` text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipients` ADD `name_iv` text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipients` ADD `name_tag` text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipients` ADD `name_key_version` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `recipients` ADD `name_blind_index` text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipients` ADD `address_line_ciphertext` text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipients` ADD `address_line_iv` text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipients` ADD `address_line_tag` text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipients` ADD `address_line_key_version` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `recipients` ADD `address_line_blind_index` text NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_recipients_name_blind` ON `recipients` (`name_blind_index`);--> statement-breakpoint
CREATE INDEX `idx_recipients_address_blind` ON `recipients` (`address_line_blind_index`);