import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_base_currency" AS ENUM('EUR', 'USD');
  CREATE TYPE "public"."enum__products_v_version_base_currency" AS ENUM('EUR', 'USD');
  ALTER TYPE "public"."enum_carts_currency" ADD VALUE 'USD' BEFORE 'RUB';
  ALTER TYPE "public"."enum_orders_currency" ADD VALUE 'USD' BEFORE 'RUB';
  ALTER TYPE "public"."enum_transactions_currency" ADD VALUE 'USD' BEFORE 'RUB';
  ALTER TABLE "products" ALTER COLUMN "price_in_e_u_r_enabled" DROP DEFAULT;
  ALTER TABLE "_products_v" ALTER COLUMN "version_price_in_e_u_r_enabled" DROP DEFAULT;
  ALTER TABLE "variants" ADD COLUMN "price_in_u_s_d_enabled" boolean;
  ALTER TABLE "variants" ADD COLUMN "price_in_u_s_d" numeric;
  ALTER TABLE "_variants_v" ADD COLUMN "version_price_in_u_s_d_enabled" boolean;
  ALTER TABLE "_variants_v" ADD COLUMN "version_price_in_u_s_d" numeric;
  ALTER TABLE "products" ADD COLUMN "base_currency" "enum_products_base_currency" DEFAULT 'EUR';
  ALTER TABLE "products" ADD COLUMN "price_in_u_s_d_enabled" boolean;
  ALTER TABLE "products" ADD COLUMN "price_in_u_s_d" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_base_currency" "enum__products_v_version_base_currency" DEFAULT 'EUR';
  ALTER TABLE "_products_v" ADD COLUMN "version_price_in_u_s_d_enabled" boolean;
  ALTER TABLE "_products_v" ADD COLUMN "version_price_in_u_s_d" numeric;
  ALTER TABLE "exchange_rate_logs" ADD COLUMN "usd_rate" numeric;
  ALTER TABLE "exchange_rate" ADD COLUMN "usd_rate" numeric DEFAULT 80 NOT NULL;
  ALTER TABLE "feature_settings" ADD COLUMN "multi_currency" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "carts" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DEFAULT 'EUR'::text;
  DROP TYPE "public"."enum_carts_currency";
  CREATE TYPE "public"."enum_carts_currency" AS ENUM('EUR', 'RUB');
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DEFAULT 'EUR'::"public"."enum_carts_currency";
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_carts_currency" USING "currency"::"public"."enum_carts_currency";
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'EUR'::text;
  DROP TYPE "public"."enum_orders_currency";
  CREATE TYPE "public"."enum_orders_currency" AS ENUM('EUR', 'RUB');
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'EUR'::"public"."enum_orders_currency";
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_orders_currency" USING "currency"::"public"."enum_orders_currency";
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DEFAULT 'EUR'::text;
  DROP TYPE "public"."enum_transactions_currency";
  CREATE TYPE "public"."enum_transactions_currency" AS ENUM('EUR', 'RUB');
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DEFAULT 'EUR'::"public"."enum_transactions_currency";
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_transactions_currency" USING "currency"::"public"."enum_transactions_currency";
  ALTER TABLE "products" ALTER COLUMN "price_in_e_u_r_enabled" SET DEFAULT true;
  ALTER TABLE "_products_v" ALTER COLUMN "version_price_in_e_u_r_enabled" SET DEFAULT true;
  ALTER TABLE "variants" DROP COLUMN "price_in_u_s_d_enabled";
  ALTER TABLE "variants" DROP COLUMN "price_in_u_s_d";
  ALTER TABLE "_variants_v" DROP COLUMN "version_price_in_u_s_d_enabled";
  ALTER TABLE "_variants_v" DROP COLUMN "version_price_in_u_s_d";
  ALTER TABLE "products" DROP COLUMN "base_currency";
  ALTER TABLE "products" DROP COLUMN "price_in_u_s_d_enabled";
  ALTER TABLE "products" DROP COLUMN "price_in_u_s_d";
  ALTER TABLE "_products_v" DROP COLUMN "version_base_currency";
  ALTER TABLE "_products_v" DROP COLUMN "version_price_in_u_s_d_enabled";
  ALTER TABLE "_products_v" DROP COLUMN "version_price_in_u_s_d";
  ALTER TABLE "exchange_rate_logs" DROP COLUMN "usd_rate";
  ALTER TABLE "exchange_rate" DROP COLUMN "usd_rate";
  ALTER TABLE "feature_settings" DROP COLUMN "multi_currency";
  DROP TYPE "public"."enum_products_base_currency";
  DROP TYPE "public"."enum__products_v_version_base_currency";`)
}
