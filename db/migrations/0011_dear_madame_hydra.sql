CREATE TYPE "public"."format" AS ENUM('jpg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'html5_zip', 'html', 'css', 'js');--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('banner', 'video', 'audio', 'interactive', 'newsletter', 'social', 'display', 'native');--> statement-breakpoint
CREATE TYPE "public"."usage_context" AS ENUM('mobile', 'desktop', 'tablet', 'stationary', 'video', 'newsletter', 'audio', 'web', 'app');--> statement-breakpoint
CREATE TABLE "product_tech_specs" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"spec_name" varchar(100) NOT NULL,
	"spec_value" varchar(500) NOT NULL,
	"spec_type" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_usage_contexts" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"usage_context" "usage_context" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"product_category" "product_category" NOT NULL,
	"width" integer,
	"height" integer,
	"weight_kb" numeric(10, 2) NOT NULL,
	"eco_ad_weight_kb" numeric(10, 2),
	"format" "format" NOT NULL,
	"description" varchar(1000),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "product_tech_specs" ADD CONSTRAINT "product_tech_specs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_usage_contexts" ADD CONSTRAINT "product_usage_contexts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;