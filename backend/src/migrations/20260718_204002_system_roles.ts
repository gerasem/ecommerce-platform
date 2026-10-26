import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_system_role" AS ENUM('none', 'cart', 'checkout', 'favorites', 'all_items', 'privacy_policy', 'imprint', 'delivery');
  CREATE TYPE "public"."enum__pages_v_version_system_role" AS ENUM('none', 'cart', 'checkout', 'favorites', 'all_items', 'privacy_policy', 'imprint', 'delivery');
  ALTER TABLE "pages" ADD COLUMN "system_role" "enum_pages_system_role" DEFAULT 'none';
  ALTER TABLE "_pages_v" ADD COLUMN "version_system_role" "enum__pages_v_version_system_role" DEFAULT 'none';

  UPDATE "pages" SET "system_role" = 'cart' WHERE "view" = 'cart' OR "slug" = 'cart';
  UPDATE "pages" SET "system_role" = 'checkout' WHERE "view" = 'checkout' OR "slug" = 'checkout';
  UPDATE "pages" SET "system_role" = 'favorites' WHERE "view" = 'favorites' OR "slug" = 'favorites';
  UPDATE "pages" SET "system_role" = 'all_items' WHERE "view" = 'all-items' OR "slug" = 'all-items';
  UPDATE "pages" SET "system_role" = 'privacy_policy' WHERE "slug" = 'datenschutz' OR "slug" = 'privacy-policy';
  UPDATE "pages" SET "system_role" = 'imprint' WHERE "slug" = 'impressum' OR "slug" = 'imprint';
  UPDATE "pages" SET "system_role" = 'delivery' WHERE "slug" = 'page/delivery' OR "slug" = 'delivery';
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "system_role";
  ALTER TABLE "_pages_v" DROP COLUMN "version_system_role";
  DROP TYPE "public"."enum_pages_system_role";
  DROP TYPE "public"."enum__pages_v_version_system_role";`)
}
