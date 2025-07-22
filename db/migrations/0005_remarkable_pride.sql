CREATE TABLE "client_topics" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" text NOT NULL,
	"topic" "topic" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_topics" ADD CONSTRAINT "client_topics_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client" DROP COLUMN "topic";