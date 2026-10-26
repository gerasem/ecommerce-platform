import type { IItem, IProductFull, IVariant } from '@/types'
import { getMinPrice, areAllPricesEqual } from '@/utils/price'

export function useProductVariants(product: Ref<IItem | IProductFull | null | undefined>) {
  const { t } = useI18n()

  // Selected options state
  const selectedOptions = ref<Record<string, string>>({})

  // Reset options when product changes
  watch(
    () => product.value?.id,
    () => {
      selectedOptions.value = {}
    }
  )

  // Find selected variant based on options
  const selectedVariant = computed<IVariant | null | undefined>(() => {
    if (!product.value?.enableVariants || !product.value?.variants?.docs) {
      return null
    }

    const selectedCount = Object.keys(selectedOptions.value).length
    if (selectedCount === 0) return null

    const variants = product.value.variants.docs as unknown as IVariant[]
    return variants.find(variant => {
      if (!variant?.options || variant.options.length === 0) return false

      let matches = true
      for (const [, selectedValue] of Object.entries(selectedOptions.value)) {
        const hasMatchingOption = variant.options.some(opt => opt.value === selectedValue)
        if (!hasMatchingOption) {
          matches = false
          break
        }
      }
      return matches && variant.options.length === selectedCount
    })
  })

  // Display price logic
  const pricePrefix = computed(() => {
    if (selectedVariant.value || areAllPricesEqual(product.value)) {
      return ''
    }
    return `${t('priceFrom')} `
  })

  const baseCurrency = computed(() => {
    return product.value?.baseCurrency === 'USD' ? 'USD' : 'EUR'
  })

  const priceAmount = computed(() => {
    const isUsd = baseCurrency.value === 'USD'
    if (selectedVariant.value) {
      return isUsd
        ? (selectedVariant.value.priceInUSD ?? product.value?.priceInUSD)
        : (selectedVariant.value.priceInEUR ?? product.value?.priceInEUR)
    }
    if (areAllPricesEqual(product.value)) {
      return isUsd ? product.value?.priceInUSD : product.value?.priceInEUR
    }
    return getMinPrice(product.value)
  })

  return {
    selectedOptions,
    selectedVariant,
    pricePrefix,
    priceAmount,
    baseCurrency
  }
}
