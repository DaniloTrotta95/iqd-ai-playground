ALTER TABLE "public"."product_formats" ALTER COLUMN "format" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."format";--> statement-breakpoint
CREATE TYPE "public"."format" AS ENUM('jpg', 'png', 'gif', 'html5', 'mp4 (H.264)', '3rd-Party-Redirect', 'mp3');--> statement-breakpoint
ALTER TABLE "public"."product_formats" ALTER COLUMN "format" SET DATA TYPE "public"."format" USING "format"::"public"."format";--> statement-breakpoint
ALTER TABLE "public"."products" ALTER COLUMN "product_category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."product_category";--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('standardwerbeform', 'sonderwerbeform', 'kombinationswerbeform', 'instream', 'inpage');--> statement-breakpoint
ALTER TABLE "public"."products" ALTER COLUMN "product_category" SET DATA TYPE "public"."product_category" USING "product_category"::"public"."product_category";--> statement-breakpoint
ALTER TABLE "public"."product_usage_contexts" ALTER COLUMN "usage_context" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."usage_context";--> statement-breakpoint
CREATE TYPE "public"."usage_context" AS ENUM('display', 'newsletter', 'audio', 'video', 'app', 'native');--> statement-breakpoint
ALTER TABLE "public"."product_usage_contexts" ALTER COLUMN "usage_context" SET DATA TYPE "public"."usage_context" USING "usage_context"::"public"."usage_context";