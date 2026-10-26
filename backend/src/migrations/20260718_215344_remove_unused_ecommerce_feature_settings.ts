import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "inventory" SET DEFAULT null;
  ALTER TABLE "products" ALTER COLUMN "enable_variants" SET DEFAULT false;
  ALTER TABLE "_products_v" ALTER COLUMN "version_inventory" SET DEFAULT null;
  ALTER TABLE "_products_v" ALTER COLUMN "version_enable_variants" SET DEFAULT false;
  ALTER TABLE "feature_settings" DROP COLUMN "enable_variants";
  ALTER TABLE "feature_settings" DROP COLUMN "enable_inventory";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "inventory" SET DEFAULT 0;
  ALTER TABLE "products" ALTER COLUMN "enable_variants" DROP DEFAULT;
  ALTER TABLE "_products_v" ALTER COLUMN "version_inventory" SET DEFAULT 0;
  ALTER TABLE "_products_v" ALTER COLUMN "version_enable_variants" DROP DEFAULT;
  ALTER TABLE "feature_settings" ADD COLUMN "enable_variants" boolean DEFAULT false;
  ALTER TABLE "feature_settings" ADD COLUMN "enable_inventory" boolean DEFAULT false;`)
}
