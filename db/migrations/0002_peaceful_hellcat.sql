ALTER TABLE "client" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "publisher" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();