CREATE TYPE "public"."topic" AS ENUM('news', 'business', 'finance', 'sport', 'lifestyle', 'science', 'family');--> statement-breakpoint
CREATE TABLE "client" (
	"id" text PRIMARY KEY NOT NULL,
	"publisher_id" text NOT NULL,
	"name" text NOT NULL,
	"url" text,
	"topic" "topic" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publisher" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client" ADD CONSTRAINT "client_publisher_id_publisher_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "public"."publisher"("id") ON DELETE cascade ON UPDATE no action;