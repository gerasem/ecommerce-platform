import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" ADD COLUMN "invoice_id" integer;
  ALTER TABLE "feature_settings" ADD COLUMN "generate_invoices" boolean DEFAULT false;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_invoice_id_media_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "orders_invoice_idx" ON "orders" USING btree ("invoice_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DROP CONSTRAINT "orders_invoice_id_media_id_fk";
  
  DROP INDEX "orders_invoice_idx";
  ALTER TABLE "orders" DROP COLUMN "invoice_id";
  ALTER TABLE "feature_settings" DROP COLUMN "generate_invoices";`)
}
