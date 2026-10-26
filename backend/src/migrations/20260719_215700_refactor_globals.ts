import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "shop_settings_locales" (
  	"phone" varchar,
  	"email" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "shopping_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shopping_settings_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "shopping_settings" CASCADE;
  DROP TABLE "shopping_settings_locales" CASCADE;
  ALTER TABLE "shop_settings" ADD COLUMN "show_highlighted_products" boolean DEFAULT false;
  ALTER TABLE "shop_settings" ADD COLUMN "favicon_id" integer;
  ALTER TABLE "shop_settings_locales" ADD CONSTRAINT "shop_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "shop_settings_locales_locale_parent_id_unique" ON "shop_settings_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "shop_settings" ADD CONSTRAINT "shop_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "shop_settings_favicon_idx" ON "shop_settings" USING btree ("favicon_id");
  ALTER TABLE "feature_settings" DROP COLUMN "show_highlighted_products";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "shopping_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"favicon_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "shopping_settings_locales" (
  	"phone" varchar,
  	"email" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "shop_settings_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "shop_settings_locales" CASCADE;
  ALTER TABLE "shop_settings" DROP CONSTRAINT "shop_settings_favicon_id_media_id_fk";
  
  DROP INDEX "shop_settings_favicon_idx";
  ALTER TABLE "feature_settings" ADD COLUMN "show_highlighted_products" boolean DEFAULT false;
  ALTER TABLE "shopping_settings" ADD CONSTRAINT "shopping_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shopping_settings_locales" ADD CONSTRAINT "shopping_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shopping_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "shopping_settings_favicon_idx" ON "shopping_settings" USING btree ("favicon_id");
  CREATE UNIQUE INDEX "shopping_settings_locales_locale_parent_id_unique" ON "shopping_settings_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "shop_settings" DROP COLUMN "show_highlighted_products";
  ALTER TABLE "shop_settings" DROP COLUMN "favicon_id";`)
}
