import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "price_in_r_u_b_enabled";
  ALTER TABLE "products" DROP COLUMN "price_in_r_u_b";
  ALTER TABLE "_products_v" DROP COLUMN "version_price_in_r_u_b_enabled";
  ALTER TABLE "_products_v" DROP COLUMN "version_price_in_r_u_b";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "price_in_r_u_b_enabled" boolean;
  ALTER TABLE "products" ADD COLUMN "price_in_r_u_b" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_price_in_r_u_b_enabled" boolean;
  ALTER TABLE "_products_v" ADD COLUMN "version_price_in_r_u_b" numeric;`)
}
