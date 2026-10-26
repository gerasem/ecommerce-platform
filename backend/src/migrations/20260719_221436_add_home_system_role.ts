import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_system_role" ADD VALUE 'home' BEFORE 'cart';
  ALTER TYPE "public"."enum__pages_v_version_system_role" ADD VALUE 'home' BEFORE 'cart';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ALTER COLUMN "system_role" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "system_role" SET DEFAULT 'none'::text;
  DROP TYPE "public"."enum_pages_system_role";
  CREATE TYPE "public"."enum_pages_system_role" AS ENUM('none', 'cart', 'checkout', 'favorites', 'all_items', 'privacy_policy', 'imprint', 'delivery');
  ALTER TABLE "pages" ALTER COLUMN "system_role" SET DEFAULT 'none'::"public"."enum_pages_system_role";
  ALTER TABLE "pages" ALTER COLUMN "system_role" SET DATA TYPE "public"."enum_pages_system_role" USING "system_role"::"public"."enum_pages_system_role";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_system_role" SET DATA TYPE text;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_system_role" SET DEFAULT 'none'::text;
  DROP TYPE "public"."enum__pages_v_version_system_role";
  CREATE TYPE "public"."enum__pages_v_version_system_role" AS ENUM('none', 'cart', 'checkout', 'favorites', 'all_items', 'privacy_policy', 'imprint', 'delivery');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_system_role" SET DEFAULT 'none'::"public"."enum__pages_v_version_system_role";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_system_role" SET DATA TYPE "public"."enum__pages_v_version_system_role" USING "version_system_role"::"public"."enum__pages_v_version_system_role";`)
}
