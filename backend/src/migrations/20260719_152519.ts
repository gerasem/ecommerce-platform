import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "price_in_e_u_r_enabled" boolean DEFAULT true;
  ALTER TABLE "products" ADD COLUMN "price_in_u_s_d_enabled" boolean DEFAULT true;
  ALTER TABLE "_products_v" ADD COLUMN "version_price_in_e_u_r_enabled" boolean DEFAULT true;
  ALTER TABLE "_products_v" ADD COLUMN "version_price_in_u_s_d_enabled" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "price_in_e_u_r_enabled";
  ALTER TABLE "products" DROP COLUMN "price_in_u_s_d_enabled";
  ALTER TABLE "_products_v" DROP COLUMN "version_price_in_e_u_r_enabled";
  ALTER TABLE "_products_v" DROP COLUMN "version_price_in_u_s_d_enabled";`)
}
