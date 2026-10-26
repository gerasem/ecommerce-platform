import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" ADD COLUMN "source_cart_id" integer;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_source_cart_id_carts_id_fk" FOREIGN KEY ("source_cart_id") REFERENCES "public"."carts"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "orders_source_cart_idx" ON "orders" USING btree ("source_cart_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DROP CONSTRAINT "orders_source_cart_id_carts_id_fk";
  
  DROP INDEX "orders_source_cart_idx";
  ALTER TABLE "orders" DROP COLUMN "source_cart_id";`)
}
