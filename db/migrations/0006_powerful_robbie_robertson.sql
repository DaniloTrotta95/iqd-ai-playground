ALTER TABLE "client_topics" ALTER COLUMN "topic" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "client_topics" ADD COLUMN "label" text NOT NULL;