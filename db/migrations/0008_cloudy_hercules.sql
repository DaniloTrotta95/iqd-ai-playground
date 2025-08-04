CREATE TABLE "topics" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_topics" ALTER COLUMN "client_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "client_topics" ADD COLUMN "topic_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "client_topics" ADD CONSTRAINT "client_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_topics" DROP COLUMN "topic";--> statement-breakpoint
ALTER TABLE "client_topics" DROP COLUMN "label";