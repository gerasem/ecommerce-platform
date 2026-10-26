import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_conversion_boxes_boxes_locales" ADD COLUMN "content" jsonb;
  ALTER TABLE "_pages_v_blocks_conversion_boxes_boxes_locales" ADD COLUMN "content" jsonb;
  ALTER TABLE "pages_blocks_conversion_boxes_boxes_locales" DROP COLUMN "title";
  ALTER TABLE "pages_blocks_conversion_boxes_boxes_locales" DROP COLUMN "description";
  ALTER TABLE "_pages_v_blocks_conversion_boxes_boxes_locales" DROP COLUMN "title";
  ALTER TABLE "_pages_v_blocks_conversion_boxes_boxes_locales" DROP COLUMN "description";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_conversion_boxes_boxes_locales" ADD COLUMN "title" varchar;
  ALTER TABLE "pages_blocks_conversion_boxes_boxes_locales" ADD COLUMN "description" varchar;
  ALTER TABLE "_pages_v_blocks_conversion_boxes_boxes_locales" ADD COLUMN "title" varchar;
  ALTER TABLE "_pages_v_blocks_conversion_boxes_boxes_locales" ADD COLUMN "description" varchar;
  ALTER TABLE "pages_blocks_conversion_boxes_boxes_locales" DROP COLUMN "content";
  ALTER TABLE "_pages_v_blocks_conversion_boxes_boxes_locales" DROP COLUMN "content";`)
}
