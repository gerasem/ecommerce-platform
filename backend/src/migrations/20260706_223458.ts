import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ 
  DECLARE
      t_name text;
  BEGIN
      FOR t_name IN 
          SELECT table_name 
          FROM information_schema.columns 
          WHERE column_name = '_locale' AND table_schema = 'public'
      LOOP
          EXECUTE format('DELETE FROM %I WHERE _locale = ''de'';', t_name);
      END LOOP;
  END $$;
  
   CREATE TYPE "public"."enum_pages_blocks_content_width" AS ENUM('1/1', '1/2', '1/3', '2/3');
  CREATE TYPE "public"."enum_pages_blocks_conversion_boxes_width" AS ENUM('1/1', '1/2', '1/3', '2/3');
  CREATE TYPE "public"."enum_pages_blocks_form_block_width" AS ENUM('1/1', '1/2', '1/3', '2/3');
  CREATE TYPE "public"."enum_pages_view" AS ENUM('default', 'favorites', 'checkout', 'cart', 'all-items');
  CREATE TYPE "public"."enum__pages_v_blocks_content_width" AS ENUM('1/1', '1/2', '1/3', '2/3');
  CREATE TYPE "public"."enum__pages_v_blocks_conversion_boxes_width" AS ENUM('1/1', '1/2', '1/3', '2/3');
  CREATE TYPE "public"."enum__pages_v_blocks_form_block_width" AS ENUM('1/1', '1/2', '1/3', '2/3');
  CREATE TYPE "public"."enum__pages_v_version_view" AS ENUM('default', 'favorites', 'checkout', 'cart', 'all-items');
  ALTER TYPE "public"."enum_carts_currency" ADD VALUE 'RUB';
  ALTER TYPE "public"."enum_orders_currency" ADD VALUE 'RUB';
  ALTER TYPE "public"."enum_transactions_currency" ADD VALUE 'RUB';
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_pages_blocks_content_width" DEFAULT '1/1',
  	"custom_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_content_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_conversion_boxes_boxes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_conversion_boxes_boxes_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_conversion_boxes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_pages_blocks_conversion_boxes_width" DEFAULT '1/1',
  	"custom_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"width" "enum_pages_blocks_form_block_width" DEFAULT '1/1',
  	"custom_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_raw_html" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"html" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__pages_v_blocks_content_width" DEFAULT '1/1',
  	"custom_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_conversion_boxes_boxes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_conversion_boxes_boxes_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_conversion_boxes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__pages_v_blocks_conversion_boxes_width" DEFAULT '1/1',
  	"custom_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"width" "enum__pages_v_blocks_form_block_width" DEFAULT '1/1',
  	"custom_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_raw_html" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"html" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "shopping_settings_locales" (
  	"phone" varchar,
  	"email" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "exchange_rate" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"rate" numeric DEFAULT 83 NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_conversion_boxes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_conversion_boxes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_conversion_boxes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_conversion_boxes_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_conversion_boxes" CASCADE;
  DROP TABLE "pages_conversion_boxes_locales" CASCADE;
  DROP TABLE "_pages_v_version_conversion_boxes" CASCADE;
  DROP TABLE "_pages_v_version_conversion_boxes_locales" CASCADE;
  ALTER TABLE "pages_blocks_content_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_conversion_boxes_boxes_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "pages_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_content_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_conversion_boxes_boxes_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "categories_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_checkbox_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_country_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_email_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_message_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_number_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_select_options_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_select_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_state_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_text_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_textarea_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_emails_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "products_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "_products_v_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "header_nav_items" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "header_nav_buttons" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "header_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "header_rels" ALTER COLUMN "locale" SET DATA TYPE text;
  ALTER TABLE "footer_nav_items" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "footer_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "footer_rels" ALTER COLUMN "locale" SET DATA TYPE text;
  ALTER TABLE "information_banner_items_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "shopping_settings_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  DROP TYPE "public"."_locales";
  CREATE TYPE "public"."_locales" AS ENUM('ru', 'en');
  ALTER TABLE "pages_blocks_content_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "pages_blocks_conversion_boxes_boxes_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "pages_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "_pages_v_blocks_content_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "_pages_v_blocks_conversion_boxes_boxes_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "categories_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_checkbox_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_country_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_email_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_message_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_number_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_select_options_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_select_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_state_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_text_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_textarea_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_emails_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "products_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "_products_v_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "header_nav_items" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "header_nav_buttons" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "header_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "header_rels" ALTER COLUMN "locale" SET DATA TYPE "public"."_locales" USING "locale"::"public"."_locales";
  ALTER TABLE "footer_nav_items" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "footer_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "footer_rels" ALTER COLUMN "locale" SET DATA TYPE "public"."_locales" USING "locale"::"public"."_locales";
  ALTER TABLE "information_banner_items_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "shopping_settings_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "_pages_v" ALTER COLUMN "published_locale" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_published_locale";
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('ru', 'en');
  ALTER TABLE "_pages_v" ALTER COLUMN "published_locale" SET DATA TYPE "public"."enum__pages_v_published_locale" USING "published_locale"::"public"."enum__pages_v_published_locale";
  ALTER TABLE "_variants_v" ALTER COLUMN "published_locale" SET DATA TYPE text;
  DROP TYPE "public"."enum__variants_v_published_locale";
  CREATE TYPE "public"."enum__variants_v_published_locale" AS ENUM('ru', 'en');
  ALTER TABLE "_variants_v" ALTER COLUMN "published_locale" SET DATA TYPE "public"."enum__variants_v_published_locale" USING "published_locale"::"public"."enum__variants_v_published_locale";
  ALTER TABLE "_products_v" ALTER COLUMN "published_locale" SET DATA TYPE text;
  DROP TYPE "public"."enum__products_v_published_locale";
  CREATE TYPE "public"."enum__products_v_published_locale" AS ENUM('ru', 'en');
  ALTER TABLE "_products_v" ALTER COLUMN "published_locale" SET DATA TYPE "public"."enum__products_v_published_locale" USING "published_locale"::"public"."enum__products_v_published_locale";
  ALTER TABLE "categories" ALTER COLUMN "image_id" DROP NOT NULL;
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "header_nav_buttons" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "header_locales" ALTER COLUMN "slogan" SET DATA TYPE jsonb;
  ALTER TABLE "footer_nav_items" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "footer_locales" ALTER COLUMN "slogan" SET DATA TYPE jsonb;
  ALTER TABLE "shipping_settings_shipping_methods" ALTER COLUMN "price" DROP NOT NULL;
  ALTER TABLE "users" ADD COLUMN "enable_a_p_i_key" boolean;
  ALTER TABLE "users" ADD COLUMN "api_key" varchar;
  ALTER TABLE "users" ADD COLUMN "api_key_index" varchar;
  ALTER TABLE "pages" ADD COLUMN "view" "enum_pages_view" DEFAULT 'default';
  ALTER TABLE "pages_locales" ADD COLUMN "subtitle" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_view" "enum__pages_v_version_view" DEFAULT 'default';
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_subtitle" varchar;
  ALTER TABLE "form_submissions" ADD COLUMN "read" boolean DEFAULT false;
  ALTER TABLE "variants" ADD COLUMN "price_in_r_u_b_enabled" boolean;
  ALTER TABLE "variants" ADD COLUMN "price_in_r_u_b" numeric;
  ALTER TABLE "_variants_v" ADD COLUMN "version_price_in_r_u_b_enabled" boolean;
  ALTER TABLE "_variants_v" ADD COLUMN "version_price_in_r_u_b" numeric;
  ALTER TABLE "products" ADD COLUMN "price_in_r_u_b_enabled" boolean;
  ALTER TABLE "products" ADD COLUMN "price_in_r_u_b" numeric;
  ALTER TABLE "products" ADD COLUMN "is_popular" boolean DEFAULT false;
  ALTER TABLE "_products_v" ADD COLUMN "version_price_in_r_u_b_enabled" boolean;
  ALTER TABLE "_products_v" ADD COLUMN "version_price_in_r_u_b" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_is_popular" boolean DEFAULT false;
  ALTER TABLE "orders_items" ADD COLUMN "amount" numeric;
  ALTER TABLE "orders_items" ADD COLUMN "currency" varchar DEFAULT 'RUB';
  ALTER TABLE "orders" ADD COLUMN "subtotal" numeric;
  ALTER TABLE "orders" ADD COLUMN "shipping_method_name" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_cost" numeric;
  ALTER TABLE "footer_locales" ADD COLUMN "contact_link_link_type" "enum_footer_contact_link_link_type" DEFAULT 'reference';
  ALTER TABLE "footer_locales" ADD COLUMN "contact_link_link_new_tab" boolean;
  ALTER TABLE "footer_locales" ADD COLUMN "contact_link_link_url" varchar;
  ALTER TABLE "footer_locales" ADD COLUMN "contact_link_link_label" varchar;
  ALTER TABLE "footer_locales" ADD COLUMN "social_link_link_type" "enum_footer_social_link_link_type" DEFAULT 'reference';
  ALTER TABLE "footer_locales" ADD COLUMN "social_link_link_new_tab" boolean;
  ALTER TABLE "footer_locales" ADD COLUMN "social_link_link_url" varchar;
  ALTER TABLE "footer_locales" ADD COLUMN "social_link_link_label" varchar;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_locales" ADD CONSTRAINT "pages_blocks_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_conversion_boxes_boxes" ADD CONSTRAINT "pages_blocks_conversion_boxes_boxes_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_conversion_boxes_boxes" ADD CONSTRAINT "pages_blocks_conversion_boxes_boxes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_conversion_boxes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_conversion_boxes_boxes_locales" ADD CONSTRAINT "pages_blocks_conversion_boxes_boxes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_conversion_boxes_boxes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_conversion_boxes" ADD CONSTRAINT "pages_blocks_conversion_boxes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_raw_html" ADD CONSTRAINT "pages_blocks_raw_html_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_locales" ADD CONSTRAINT "_pages_v_blocks_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_conversion_boxes_boxes" ADD CONSTRAINT "_pages_v_blocks_conversion_boxes_boxes_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_conversion_boxes_boxes" ADD CONSTRAINT "_pages_v_blocks_conversion_boxes_boxes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_conversion_boxes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_conversion_boxes_boxes_locales" ADD CONSTRAINT "_pages_v_blocks_conversion_boxes_boxes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_conversion_boxes_boxes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_conversion_boxes" ADD CONSTRAINT "_pages_v_blocks_conversion_boxes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_raw_html" ADD CONSTRAINT "_pages_v_blocks_raw_html_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shopping_settings_locales" ADD CONSTRAINT "shopping_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shopping_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_content_locales_locale_parent_id_unique" ON "pages_blocks_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_conversion_boxes_boxes_order_idx" ON "pages_blocks_conversion_boxes_boxes" USING btree ("_order");
  CREATE INDEX "pages_blocks_conversion_boxes_boxes_parent_id_idx" ON "pages_blocks_conversion_boxes_boxes" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_conversion_boxes_boxes_image_idx" ON "pages_blocks_conversion_boxes_boxes" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_conversion_boxes_boxes_locales_locale_parent_id" ON "pages_blocks_conversion_boxes_boxes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_conversion_boxes_order_idx" ON "pages_blocks_conversion_boxes" USING btree ("_order");
  CREATE INDEX "pages_blocks_conversion_boxes_parent_id_idx" ON "pages_blocks_conversion_boxes" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_conversion_boxes_path_idx" ON "pages_blocks_conversion_boxes" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_order_idx" ON "pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_form_block_parent_id_idx" ON "pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_form_block_path_idx" ON "pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_form_idx" ON "pages_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "pages_blocks_raw_html_order_idx" ON "pages_blocks_raw_html" USING btree ("_order");
  CREATE INDEX "pages_blocks_raw_html_parent_id_idx" ON "pages_blocks_raw_html" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_raw_html_path_idx" ON "pages_blocks_raw_html" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_content_locales_locale_parent_id_unique" ON "_pages_v_blocks_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_conversion_boxes_boxes_order_idx" ON "_pages_v_blocks_conversion_boxes_boxes" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_conversion_boxes_boxes_parent_id_idx" ON "_pages_v_blocks_conversion_boxes_boxes" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_conversion_boxes_boxes_image_idx" ON "_pages_v_blocks_conversion_boxes_boxes" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_conversion_boxes_boxes_locales_locale_parent" ON "_pages_v_blocks_conversion_boxes_boxes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_conversion_boxes_order_idx" ON "_pages_v_blocks_conversion_boxes" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_conversion_boxes_parent_id_idx" ON "_pages_v_blocks_conversion_boxes" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_conversion_boxes_path_idx" ON "_pages_v_blocks_conversion_boxes" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_order_idx" ON "_pages_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_form_block_parent_id_idx" ON "_pages_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_form_block_path_idx" ON "_pages_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_form_idx" ON "_pages_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_raw_html_order_idx" ON "_pages_v_blocks_raw_html" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_raw_html_parent_id_idx" ON "_pages_v_blocks_raw_html" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_raw_html_path_idx" ON "_pages_v_blocks_raw_html" USING btree ("_path");
  CREATE UNIQUE INDEX "shopping_settings_locales_locale_parent_id_unique" ON "shopping_settings_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "pages" DROP COLUMN "page_type";
  ALTER TABLE "pages" DROP COLUMN "generate_slug";
  ALTER TABLE "pages_locales" DROP COLUMN "content";
  ALTER TABLE "_pages_v" DROP COLUMN "version_page_type";
  ALTER TABLE "_pages_v" DROP COLUMN "version_generate_slug";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_content";
  ALTER TABLE "categories" DROP COLUMN "generate_slug";
  ALTER TABLE "products" DROP COLUMN "generate_slug";
  ALTER TABLE "_products_v" DROP COLUMN "version_generate_slug";
  ALTER TABLE "transactions" DROP COLUMN "payment_method";
  ALTER TABLE "transactions" DROP COLUMN "stripe_customer_i_d";
  ALTER TABLE "transactions" DROP COLUMN "stripe_payment_intent_i_d";
  ALTER TABLE "footer" DROP COLUMN "contact_link_link_type";
  ALTER TABLE "footer" DROP COLUMN "contact_link_link_new_tab";
  ALTER TABLE "footer" DROP COLUMN "contact_link_link_url";
  ALTER TABLE "footer" DROP COLUMN "contact_link_link_label";
  ALTER TABLE "footer" DROP COLUMN "social_link_link_type";
  ALTER TABLE "footer" DROP COLUMN "social_link_link_new_tab";
  ALTER TABLE "footer" DROP COLUMN "social_link_link_url";
  ALTER TABLE "footer" DROP COLUMN "social_link_link_label";
  ALTER TABLE "footer_locales" DROP COLUMN "phone";
  DROP TYPE "public"."enum_pages_page_type";
  DROP TYPE "public"."enum__pages_v_version_page_type";
  DROP TYPE "public"."enum_transactions_payment_method";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_page_type" AS ENUM('content', 'system');
  CREATE TYPE "public"."enum__pages_v_version_page_type" AS ENUM('content', 'system');
  CREATE TYPE "public"."enum_transactions_payment_method" AS ENUM('stripe');
  CREATE TABLE "pages_conversion_boxes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_conversion_boxes_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_conversion_boxes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_conversion_boxes_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_content_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_conversion_boxes_boxes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_conversion_boxes_boxes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_conversion_boxes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_raw_html" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_content_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_conversion_boxes_boxes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_conversion_boxes_boxes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_conversion_boxes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_raw_html" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shopping_settings_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "exchange_rate" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "pages_blocks_content_locales" CASCADE;
  DROP TABLE "pages_blocks_conversion_boxes_boxes" CASCADE;
  DROP TABLE "pages_blocks_conversion_boxes_boxes_locales" CASCADE;
  DROP TABLE "pages_blocks_conversion_boxes" CASCADE;
  DROP TABLE "pages_blocks_form_block" CASCADE;
  DROP TABLE "pages_blocks_raw_html" CASCADE;
  DROP TABLE "_pages_v_blocks_content" CASCADE;
  DROP TABLE "_pages_v_blocks_content_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_conversion_boxes_boxes" CASCADE;
  DROP TABLE "_pages_v_blocks_conversion_boxes_boxes_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_conversion_boxes" CASCADE;
  DROP TABLE "_pages_v_blocks_form_block" CASCADE;
  DROP TABLE "_pages_v_blocks_raw_html" CASCADE;
  DROP TABLE "shopping_settings_locales" CASCADE;
  DROP TABLE "exchange_rate" CASCADE;
  ALTER TABLE "pages_conversion_boxes_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "pages_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "_pages_v_version_conversion_boxes_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "categories_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_checkbox_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_country_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_email_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_message_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_number_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_select_options_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_select_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_state_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_text_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_blocks_textarea_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_emails_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "forms_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "products_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "_products_v_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "header_nav_items" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "header_nav_buttons" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "header_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "header_rels" ALTER COLUMN "locale" SET DATA TYPE text;
  ALTER TABLE "footer_nav_items" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "footer_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "footer_rels" ALTER COLUMN "locale" SET DATA TYPE text;
  ALTER TABLE "information_banner_items_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  DROP TYPE "public"."_locales";
  CREATE TYPE "public"."_locales" AS ENUM('de', 'en');
  ALTER TABLE "pages_conversion_boxes_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "pages_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "_pages_v_version_conversion_boxes_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "categories_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_checkbox_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_country_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_email_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_message_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_number_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_select_options_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_select_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_state_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_text_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_blocks_textarea_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_emails_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "forms_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "products_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "_products_v_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "header_nav_items" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "header_nav_buttons" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "header_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "header_rels" ALTER COLUMN "locale" SET DATA TYPE "public"."_locales" USING "locale"::"public"."_locales";
  ALTER TABLE "footer_nav_items" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "footer_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "footer_rels" ALTER COLUMN "locale" SET DATA TYPE "public"."_locales" USING "locale"::"public"."_locales";
  ALTER TABLE "information_banner_items_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "_pages_v" ALTER COLUMN "published_locale" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_published_locale";
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('de', 'en');
  ALTER TABLE "_pages_v" ALTER COLUMN "published_locale" SET DATA TYPE "public"."enum__pages_v_published_locale" USING "published_locale"::"public"."enum__pages_v_published_locale";
  ALTER TABLE "_variants_v" ALTER COLUMN "published_locale" SET DATA TYPE text;
  DROP TYPE "public"."enum__variants_v_published_locale";
  CREATE TYPE "public"."enum__variants_v_published_locale" AS ENUM('de', 'en');
  ALTER TABLE "_variants_v" ALTER COLUMN "published_locale" SET DATA TYPE "public"."enum__variants_v_published_locale" USING "published_locale"::"public"."enum__variants_v_published_locale";
  ALTER TABLE "_products_v" ALTER COLUMN "published_locale" SET DATA TYPE text;
  DROP TYPE "public"."enum__products_v_published_locale";
  CREATE TYPE "public"."enum__products_v_published_locale" AS ENUM('de', 'en');
  ALTER TABLE "_products_v" ALTER COLUMN "published_locale" SET DATA TYPE "public"."enum__products_v_published_locale" USING "published_locale"::"public"."enum__products_v_published_locale";
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DEFAULT 'EUR'::text;
  DROP TYPE "public"."enum_carts_currency";
  CREATE TYPE "public"."enum_carts_currency" AS ENUM('EUR');
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DEFAULT 'EUR'::"public"."enum_carts_currency";
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_carts_currency" USING "currency"::"public"."enum_carts_currency";
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'EUR'::text;
  DROP TYPE "public"."enum_orders_currency";
  CREATE TYPE "public"."enum_orders_currency" AS ENUM('EUR');
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'EUR'::"public"."enum_orders_currency";
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_orders_currency" USING "currency"::"public"."enum_orders_currency";
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DEFAULT 'EUR'::text;
  DROP TYPE "public"."enum_transactions_currency";
  CREATE TYPE "public"."enum_transactions_currency" AS ENUM('EUR');
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DEFAULT 'EUR'::"public"."enum_transactions_currency";
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_transactions_currency" USING "currency"::"public"."enum_transactions_currency";
  ALTER TABLE "categories" ALTER COLUMN "image_id" SET NOT NULL;
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "header_nav_buttons" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "header_locales" ALTER COLUMN "slogan" SET DATA TYPE varchar;
  ALTER TABLE "footer_nav_items" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "footer_locales" ALTER COLUMN "slogan" SET DATA TYPE varchar;
  ALTER TABLE "shipping_settings_shipping_methods" ALTER COLUMN "price" SET NOT NULL;
  ALTER TABLE "pages" ADD COLUMN "page_type" "enum_pages_page_type" DEFAULT 'content';
  ALTER TABLE "pages" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "pages_locales" ADD COLUMN "content" jsonb;
  ALTER TABLE "_pages_v" ADD COLUMN "version_page_type" "enum__pages_v_version_page_type" DEFAULT 'content';
  ALTER TABLE "_pages_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_content" jsonb;
  ALTER TABLE "categories" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "products" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "_products_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "transactions" ADD COLUMN "payment_method" "enum_transactions_payment_method";
  ALTER TABLE "transactions" ADD COLUMN "stripe_customer_i_d" varchar;
  ALTER TABLE "transactions" ADD COLUMN "stripe_payment_intent_i_d" varchar;
  ALTER TABLE "footer" ADD COLUMN "contact_link_link_type" "enum_footer_contact_link_link_type" DEFAULT 'reference';
  ALTER TABLE "footer" ADD COLUMN "contact_link_link_new_tab" boolean;
  ALTER TABLE "footer" ADD COLUMN "contact_link_link_url" varchar;
  ALTER TABLE "footer" ADD COLUMN "contact_link_link_label" varchar NOT NULL;
  ALTER TABLE "footer" ADD COLUMN "social_link_link_type" "enum_footer_social_link_link_type" DEFAULT 'reference';
  ALTER TABLE "footer" ADD COLUMN "social_link_link_new_tab" boolean;
  ALTER TABLE "footer" ADD COLUMN "social_link_link_url" varchar;
  ALTER TABLE "footer" ADD COLUMN "social_link_link_label" varchar NOT NULL;
  ALTER TABLE "footer_locales" ADD COLUMN "phone" varchar;
  ALTER TABLE "pages_conversion_boxes" ADD CONSTRAINT "pages_conversion_boxes_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_conversion_boxes" ADD CONSTRAINT "pages_conversion_boxes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_conversion_boxes_locales" ADD CONSTRAINT "pages_conversion_boxes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_conversion_boxes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_conversion_boxes" ADD CONSTRAINT "_pages_v_version_conversion_boxes_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_conversion_boxes" ADD CONSTRAINT "_pages_v_version_conversion_boxes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_conversion_boxes_locales" ADD CONSTRAINT "_pages_v_version_conversion_boxes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_conversion_boxes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_conversion_boxes_order_idx" ON "pages_conversion_boxes" USING btree ("_order");
  CREATE INDEX "pages_conversion_boxes_parent_id_idx" ON "pages_conversion_boxes" USING btree ("_parent_id");
  CREATE INDEX "pages_conversion_boxes_image_idx" ON "pages_conversion_boxes" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_conversion_boxes_locales_locale_parent_id_unique" ON "pages_conversion_boxes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_conversion_boxes_order_idx" ON "_pages_v_version_conversion_boxes" USING btree ("_order");
  CREATE INDEX "_pages_v_version_conversion_boxes_parent_id_idx" ON "_pages_v_version_conversion_boxes" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_conversion_boxes_image_idx" ON "_pages_v_version_conversion_boxes" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_version_conversion_boxes_locales_locale_parent_id_u" ON "_pages_v_version_conversion_boxes_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "users" DROP COLUMN "enable_a_p_i_key";
  ALTER TABLE "users" DROP COLUMN "api_key";
  ALTER TABLE "users" DROP COLUMN "api_key_index";
  ALTER TABLE "pages" DROP COLUMN "view";
  ALTER TABLE "pages_locales" DROP COLUMN "subtitle";
  ALTER TABLE "_pages_v" DROP COLUMN "version_view";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_subtitle";
  ALTER TABLE "form_submissions" DROP COLUMN "read";
  ALTER TABLE "variants" DROP COLUMN "price_in_r_u_b_enabled";
  ALTER TABLE "variants" DROP COLUMN "price_in_r_u_b";
  ALTER TABLE "_variants_v" DROP COLUMN "version_price_in_r_u_b_enabled";
  ALTER TABLE "_variants_v" DROP COLUMN "version_price_in_r_u_b";
  ALTER TABLE "products" DROP COLUMN "price_in_r_u_b_enabled";
  ALTER TABLE "products" DROP COLUMN "price_in_r_u_b";
  ALTER TABLE "products" DROP COLUMN "is_popular";
  ALTER TABLE "_products_v" DROP COLUMN "version_price_in_r_u_b_enabled";
  ALTER TABLE "_products_v" DROP COLUMN "version_price_in_r_u_b";
  ALTER TABLE "_products_v" DROP COLUMN "version_is_popular";
  ALTER TABLE "orders_items" DROP COLUMN "amount";
  ALTER TABLE "orders_items" DROP COLUMN "currency";
  ALTER TABLE "orders" DROP COLUMN "subtotal";
  ALTER TABLE "orders" DROP COLUMN "shipping_method_name";
  ALTER TABLE "orders" DROP COLUMN "shipping_cost";
  ALTER TABLE "footer_locales" DROP COLUMN "contact_link_link_type";
  ALTER TABLE "footer_locales" DROP COLUMN "contact_link_link_new_tab";
  ALTER TABLE "footer_locales" DROP COLUMN "contact_link_link_url";
  ALTER TABLE "footer_locales" DROP COLUMN "contact_link_link_label";
  ALTER TABLE "footer_locales" DROP COLUMN "social_link_link_type";
  ALTER TABLE "footer_locales" DROP COLUMN "social_link_link_new_tab";
  ALTER TABLE "footer_locales" DROP COLUMN "social_link_link_url";
  ALTER TABLE "footer_locales" DROP COLUMN "social_link_link_label";
  DROP TYPE "public"."enum_pages_blocks_content_width";
  DROP TYPE "public"."enum_pages_blocks_conversion_boxes_width";
  DROP TYPE "public"."enum_pages_blocks_form_block_width";
  DROP TYPE "public"."enum_pages_view";
  DROP TYPE "public"."enum__pages_v_blocks_content_width";
  DROP TYPE "public"."enum__pages_v_blocks_conversion_boxes_width";
  DROP TYPE "public"."enum__pages_v_blocks_form_block_width";
  DROP TYPE "public"."enum__pages_v_version_view";`)
}
