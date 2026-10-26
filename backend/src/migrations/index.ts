import * as migration_20260706_223458 from './20260706_223458';
import * as migration_20260709_210145_add_exchange_rate from './20260709_210145_add_exchange_rate';
import * as migration_20260709_214813_add_news_collection from './20260709_214813_add_news_collection';
import * as migration_20260711_212539_add_header_notice from './20260711_212539_add_header_notice';
import * as migration_20260712_113419 from './20260712_113419';
import * as migration_20260715_170325_add_feature_settings from './20260715_170325_add_feature_settings';
import * as migration_20260716_212652 from './20260716_212652';
import * as migration_20260716_212706 from './20260716_212706';
import * as migration_20260716_214420 from './20260716_214420';
import * as migration_20260716_221322 from './20260716_221322';
import * as migration_20260717_201417_add_company_to_orders from './20260717_201417_add_company_to_orders';
import * as migration_20260718_145500_fix_shipping_price_nullable from './20260718_145500_fix_shipping_price_nullable';
import * as migration_20260718_204002_system_roles from './20260718_204002_system_roles';
import * as migration_20260718_215344_remove_unused_ecommerce_feature_settings from './20260718_215344_remove_unused_ecommerce_feature_settings';
import * as migration_20260719_152519 from './20260719_152519';
import * as migration_20260719_212933_shop_settings_seo from './20260719_212933_shop_settings_seo';
import * as migration_20260719_213922 from './20260719_213922';
import * as migration_20260719_215700_refactor_globals from './20260719_215700_refactor_globals';
import * as migration_20260719_221436_add_home_system_role from './20260719_221436_add_home_system_role';
import * as migration_20260722_145324_add_invoice_feature from './20260722_145324_add_invoice_feature';
import * as migration_20260723_194356_add_shipping_thresholds from './20260723_194356_add_shipping_thresholds';
import * as migration_20260725_174541_add_order_source_cart from './20260725_174541_add_order_source_cart';
import * as migration_20260727_195829_schema_update from './20260727_195829_schema_update';

export const migrations = [
  {
    up: migration_20260706_223458.up,
    down: migration_20260706_223458.down,
    name: '20260706_223458',
  },
  {
    up: migration_20260709_210145_add_exchange_rate.up,
    down: migration_20260709_210145_add_exchange_rate.down,
    name: '20260709_210145_add_exchange_rate',
  },
  {
    up: migration_20260709_214813_add_news_collection.up,
    down: migration_20260709_214813_add_news_collection.down,
    name: '20260709_214813_add_news_collection',
  },
  {
    up: migration_20260711_212539_add_header_notice.up,
    down: migration_20260711_212539_add_header_notice.down,
    name: '20260711_212539_add_header_notice',
  },
  {
    up: migration_20260712_113419.up,
    down: migration_20260712_113419.down,
    name: '20260712_113419',
  },
  {
    up: migration_20260715_170325_add_feature_settings.up,
    down: migration_20260715_170325_add_feature_settings.down,
    name: '20260715_170325_add_feature_settings',
  },
  {
    up: migration_20260716_212652.up,
    down: migration_20260716_212652.down,
    name: '20260716_212652',
  },
  {
    up: migration_20260716_212706.up,
    down: migration_20260716_212706.down,
    name: '20260716_212706',
  },
  {
    up: migration_20260716_214420.up,
    down: migration_20260716_214420.down,
    name: '20260716_214420',
  },
  {
    up: migration_20260716_221322.up,
    down: migration_20260716_221322.down,
    name: '20260716_221322',
  },
  {
    up: migration_20260717_201417_add_company_to_orders.up,
    down: migration_20260717_201417_add_company_to_orders.down,
    name: '20260717_201417_add_company_to_orders',
  },
  {
    up: migration_20260718_145500_fix_shipping_price_nullable.up,
    down: migration_20260718_145500_fix_shipping_price_nullable.down,
    name: '20260718_145500_fix_shipping_price_nullable',
  },
  {
    up: migration_20260718_204002_system_roles.up,
    down: migration_20260718_204002_system_roles.down,
    name: '20260718_204002_system_roles',
  },
  {
    up: migration_20260718_215344_remove_unused_ecommerce_feature_settings.up,
    down: migration_20260718_215344_remove_unused_ecommerce_feature_settings.down,
    name: '20260718_215344_remove_unused_ecommerce_feature_settings',
  },
  {
    up: migration_20260719_152519.up,
    down: migration_20260719_152519.down,
    name: '20260719_152519',
  },
  {
    up: migration_20260719_212933_shop_settings_seo.up,
    down: migration_20260719_212933_shop_settings_seo.down,
    name: '20260719_212933_shop_settings_seo',
  },
  {
    up: migration_20260719_213922.up,
    down: migration_20260719_213922.down,
    name: '20260719_213922',
  },
  {
    up: migration_20260719_215700_refactor_globals.up,
    down: migration_20260719_215700_refactor_globals.down,
    name: '20260719_215700_refactor_globals',
  },
  {
    up: migration_20260719_221436_add_home_system_role.up,
    down: migration_20260719_221436_add_home_system_role.down,
    name: '20260719_221436_add_home_system_role',
  },
  {
    up: migration_20260722_145324_add_invoice_feature.up,
    down: migration_20260722_145324_add_invoice_feature.down,
    name: '20260722_145324_add_invoice_feature',
  },
  {
    up: migration_20260723_194356_add_shipping_thresholds.up,
    down: migration_20260723_194356_add_shipping_thresholds.down,
    name: '20260723_194356_add_shipping_thresholds',
  },
  {
    up: migration_20260725_174541_add_order_source_cart.up,
    down: migration_20260725_174541_add_order_source_cart.down,
    name: '20260725_174541_add_order_source_cart',
  },
  {
    up: migration_20260727_195829_schema_update.up,
    down: migration_20260727_195829_schema_update.down,
    name: '20260727_195829_schema_update'
  },
];
