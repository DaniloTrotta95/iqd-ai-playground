CREATE TYPE "public"."client_type" AS ENUM('display', 'newsletter', 'podcast');--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "client_type" "client_type" DEFAULT 'display' NOT NULL;