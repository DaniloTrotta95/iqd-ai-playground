ALTER TABLE "products" ADD COLUMN "impression_pixel" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_eco_ad" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_skippable" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "max_duration" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "max_header_size" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "max_text_size" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "max_cta_size" integer;