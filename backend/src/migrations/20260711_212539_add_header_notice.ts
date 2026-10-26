import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header" ADD COLUMN "important_notice_show_notice" boolean DEFAULT false;
  ALTER TABLE "header" ADD COLUMN "important_notice_notice_icon_id" integer;
  ALTER TABLE "header_locales" ADD COLUMN "important_notice_notice_text" jsonb;
  ALTER TABLE "header" ADD CONSTRAINT "header_important_notice_notice_icon_id_svg_media_id_fk" FOREIGN KEY ("important_notice_notice_icon_id") REFERENCES "public"."svg_media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "header_important_notice_important_notice_notice_icon_idx" ON "header" USING btree ("important_notice_notice_icon_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header" DROP CONSTRAINT "header_important_notice_notice_icon_id_svg_media_id_fk";
  
  DROP INDEX "header_important_notice_important_notice_notice_icon_idx";
  ALTER TABLE "header" DROP COLUMN "important_notice_show_notice";
  ALTER TABLE "header" DROP COLUMN "important_notice_notice_icon_id";
  ALTER TABLE "header_locales" DROP COLUMN "important_notice_notice_text";`)
}
