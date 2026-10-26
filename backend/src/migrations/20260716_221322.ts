import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "feature_settings" ADD COLUMN "enable_variants" boolean DEFAULT false;
  ALTER TABLE "feature_settings" ADD COLUMN "enable_inventory" boolean DEFAULT false;
  ALTER TABLE "feature_settings" ADD COLUMN "show_highlighted_products" boolean DEFAULT false;
  ALTER TABLE "shop_settings" DROP COLUMN "show_highlighted_products";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" ADD COLUMN "show_highlighted_products" boolean DEFAULT false;
  ALTER TABLE "feature_settings" DROP COLUMN "enable_variants";
  ALTER TABLE "feature_settings" DROP COLUMN "enable_inventory";
  ALTER TABLE "feature_settings" DROP COLUMN "show_highlighted_products";`)
}
