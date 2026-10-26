import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "exchange_rate_logs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"rate" numeric,
  	"status" varchar
  );
  
  ALTER TABLE "exchange_rate_logs" ADD CONSTRAINT "exchange_rate_logs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."exchange_rate"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "exchange_rate_logs_order_idx" ON "exchange_rate_logs" USING btree ("_order");
  CREATE INDEX "exchange_rate_logs_parent_id_idx" ON "exchange_rate_logs" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "exchange_rate_logs" CASCADE;`)
}
