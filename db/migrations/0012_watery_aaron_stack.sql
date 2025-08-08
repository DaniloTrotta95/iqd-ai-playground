CREATE TABLE "product_formats" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"format" "format" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "product_formats" ADD CONSTRAINT "product_formats_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "format";