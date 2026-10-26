import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" ADD COLUMN "is_searchable" boolean DEFAULT true;
  ALTER TABLE "shop_settings" ADD COLUMN "head_html" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" DROP COLUMN "is_searchable";
  ALTER TABLE "shop_settings" DROP COLUMN "head_html";`)
}
