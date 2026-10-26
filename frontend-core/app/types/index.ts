import type {
  ProductsByCategoryQuery,
  CategoriesQuery,
  PageQuery,
  ItemBySlugQuery,
  News,
  ShippingSettingsQuery
} from '@/generated/graphql'

/**
 * Item (Product) type alias
 * Extracted from ProductsByCategoryQuery for convenience
 * Used in lists and grids
 */
export type IItem = NonNullable<NonNullable<ProductsByCategoryQuery['Products']>['docs'][number]> & {
  inventory?: number | null
}

/**
 * Full Product type alias
 * Extracted from ItemBySlugQuery
 * Used in single product page
 */
export type IProductFull = NonNullable<NonNullable<ItemBySlugQuery['Products']>['docs'][number]>

/**
 * Category type alias
 * Extracted from CategoriesQuery for convenience
 */
export type ICategory = NonNullable<NonNullable<CategoriesQuery['Categories']>['docs'][number]>

/**
 * Page type alias
 * Extracted from PageQuery for convenience
 */
export type IPage = NonNullable<PageQuery['Pages']>

/**
 * A single page document returned by the page query.
 */
export type IPageDocument = NonNullable<NonNullable<PageQuery['Pages']>['docs'][number]>

export type INews = News

export type IShippingSettings = NonNullable<ShippingSettingsQuery['ShippingSetting']>

export type IShippingMethod = NonNullable<IShippingSettings['shippingMethods']>[number]

export type FormValue = string | number | boolean | undefined

export interface IFormField {
  blockType: string
  name: string
  label?: string
  blockName?: string
  required?: boolean
  width?: number
  defaultValue?: FormValue
  options?: Array<{ label: string; value: string }>
}

/**
 * Variant type alias
 * Extracted from IProductFull's variants.docs
 * Used in variant selection and display
 */
export type IVariant = NonNullable<NonNullable<IProductFull['variants']>['docs'][number]>

/**
 * Cart Item (Raw) - minimal data stored in localStorage
 */
export interface ICartItemRaw {
  productId: number
  variantId: number | null
  qty: number
}

/**
 * Cart Item (Hydrated) - enriched with product data
 * Includes inventory: null/undefined = unlimited, 0 = out of stock, >0 = available
 */
export interface ICartItem extends ICartItemRaw {
  title: string
  slug: string
  baseCurrency: string
  priceInEUR: number
  priceInUSD: number
  image?: string
  variantTitle?: string
  inventory: number | null | undefined
}
