import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shipping_settings" ALTER COLUMN "minimum_order_amount" SET DEFAULT 0;
  ALTER TABLE "shipping_settings" ADD COLUMN "free_shipping_threshold" numeric DEFAULT 0 NOT NULL;

  UPDATE "shipping_settings"
  SET
    "free_shipping_threshold" = "minimum_order_amount",
    "minimum_order_amount" = 0;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "shipping_settings"
  SET "minimum_order_amount" = "free_shipping_threshold";

   ALTER TABLE "shipping_settings" ALTER COLUMN "minimum_order_amount" SET DEFAULT 5000;
  ALTER TABLE "shipping_settings" DROP COLUMN "free_shipping_threshold";`)
}
