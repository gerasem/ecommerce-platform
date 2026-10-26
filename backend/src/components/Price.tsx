'use client'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import React, { useMemo } from 'react'

type BaseProps = {
  className?: string
  currencyCodeClassName?: string
  as?: 'span' | 'p'
}

type PriceFixed = {
  amount: number
  currencyCode?: string
  highestAmount?: never
  lowestAmount?: never
}

type PriceRange = {
  amount?: never
  currencyCode?: string
  highestAmount: number
  lowestAmount: number
}

type Props = BaseProps & (PriceFixed | PriceRange)

export const Price = ({
  amount,
  className,
  highestAmount,
  lowestAmount,
  currencyCode: currencyCodeFromProps,
  as = 'p'
}: Props & React.ComponentProps<'p'>) => {
  const { currency, supportedCurrencies } = useCurrency()

  const Element = as

  const currencyToUse = useMemo(() => {
    if (currencyCodeFromProps) {
      return supportedCurrencies.find((currency: any) => currency.code === currencyCodeFromProps)
    }
    return currency
  }, [currency, currencyCodeFromProps, supportedCurrencies])

  const formatNaturalCurrency = useMemo(() => {
    const currencyCode = currencyToUse?.code || currencyCodeFromProps || 'EUR'
    const decimals = currencyToUse?.decimals ?? 2
    const formatter = new Intl.NumberFormat(undefined, {
      currency: currencyCode,
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
      style: 'currency'
    })

    return (value: number) => formatter.format(value)
  }, [currencyCodeFromProps, currencyToUse])

  if (typeof amount === 'number') {
    return (
      <Element className={className} suppressHydrationWarning>
        {formatNaturalCurrency(amount)}
      </Element>
    )
  }

  if (
    typeof highestAmount === 'number' &&
    typeof lowestAmount === 'number' &&
    highestAmount !== lowestAmount
  ) {
    return (
      <Element className={className} suppressHydrationWarning>
        {`${formatNaturalCurrency(lowestAmount)} - ${formatNaturalCurrency(highestAmount)}`}
      </Element>
    )
  }

  if (typeof lowestAmount === 'number') {
    return (
      <Element className={className} suppressHydrationWarning>
        {formatNaturalCurrency(lowestAmount)}
      </Element>
    )
  }

  return null
}
