import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "inventory" SET DEFAULT null;
  ALTER TABLE "_products_v" ALTER COLUMN "version_inventory" SET DEFAULT null;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "inventory" SET DEFAULT 0;
  ALTER TABLE "_products_v" ALTER COLUMN "version_inventory" SET DEFAULT 0;`)
}
