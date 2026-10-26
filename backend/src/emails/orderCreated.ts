import type { Order, Product, Variant, VariantOption } from '@/payload-types'

type EmailLocale = 'de' | 'en' | 'ru'

type OrderItem = NonNullable<Order['items']>[number]

type OrderCreatedEmailOptions = {
  locale?: string
  order: Order
  recipient?: 'admin' | 'customer'
  siteName: string
}

type OrderCreatedEmail = {
  html: string
  subject: string
  text: string
}

const translations = {
  de: {
    adminGreeting: 'Hallo!',
    adminIntro: 'Eine neue Bestellung wurde auf der Website aufgegeben und kann bearbeitet werden.',
    adminSubject: (orderID: Order['id']) => `Neue Bestellung #${orderID} auf der Website`,
    adminThankYou: 'Eine neue Bestellung wurde auf der Website aufgegeben',
    adminWillContact:
      'Öffnen Sie die Bestellung im Administrationsbereich, um die Kundendaten zu sehen und sie zu bearbeiten.',
    deliveryMethod: 'Versandart',
    greeting: (name?: string) => (name ? `Hallo ${name}!` : 'Hallo!'),
    intro: 'Ihre Bestellung wurde erfolgreich aufgegeben und wird nun bearbeitet.',
    item: 'Artikel',
    order: 'Bestellung',
    price: 'Preis',
    quantity: 'Menge',
    shipping: 'Versand',
    subtotal: 'Zwischensumme',
    subject: (orderID: Order['id']) => `Ihre Bestellung #${orderID} wurde aufgegeben`,
    thankYou: 'Vielen Dank für Ihre Bestellung!',
    total: 'Gesamtsumme',
    unitPriceUnavailable: '—',
    variant: 'Variante',
    willContact: 'Wir melden uns in Kürze bei Ihnen, um die Bestelldetails zu bestätigen.',
    customerInfo: 'Kundeninformation',
    email: 'E-Mail',
    phone: 'Telefon',
    shippingAddress: 'Lieferadresse'
  },
  en: {
    adminGreeting: 'Hello!',
    adminIntro: 'A new order was placed on the website and is ready to be processed.',
    adminSubject: (orderID: Order['id']) => `New order #${orderID} on the website`,
    adminThankYou: 'A new order was placed on the website',
    adminWillContact:
      'Open the order in the admin panel to review the customer details and process it.',
    deliveryMethod: 'Delivery method',
    greeting: (name?: string) => (name ? `Hello, ${name}!` : 'Hello!'),
    intro: 'Your order has been placed successfully and is now being processed.',
    item: 'Item',
    order: 'Order',
    price: 'Price',
    quantity: 'Qty',
    shipping: 'Shipping',
    subtotal: 'Subtotal',
    subject: (orderID: Order['id']) => `Your order #${orderID} has been placed`,
    thankYou: 'Thank you for your order!',
    total: 'Total',
    unitPriceUnavailable: '—',
    variant: 'Variant',
    willContact: 'We will contact you shortly to confirm the order details.',
    customerInfo: 'Customer Information',
    email: 'Email',
    phone: 'Phone',
    shippingAddress: 'Shipping Address'
  },
  ru: {
    adminGreeting: 'Здравствуйте!',
    adminIntro: 'На сайте был сделан новый заказ. Заказ готов к обработке.',
    adminSubject: (orderID: Order['id']) => `Новый заказ #${orderID} на сайте`,
    adminThankYou: 'На сайте был сделан заказ',
    adminWillContact:
      'Откройте заказ в административной панели, чтобы посмотреть данные покупателя и обработать его.',
    deliveryMethod: 'Способ доставки',
    greeting: (name?: string) => (name ? `Здравствуйте, ${name}!` : 'Здравствуйте!'),
    intro: 'Ваш заказ успешно оформлен и передан в обработку.',
    item: 'Товар',
    order: 'Заказ',
    price: 'Цена',
    quantity: 'Кол-во',
    shipping: 'Доставка',
    subtotal: 'Товары',
    subject: (orderID: Order['id']) => `Ваш заказ #${orderID} успешно оформлен`,
    thankYou: 'Спасибо за ваш заказ!',
    total: 'Итого',
    unitPriceUnavailable: '—',
    variant: 'Вариант',
    willContact: 'Мы свяжемся с вами в ближайшее время для подтверждения деталей заказа.',
    customerInfo: 'Информация о покупателе',
    email: 'Email',
    phone: 'Телефон',
    shippingAddress: 'Адрес доставки'
  }
} as const

const localeTags: Record<EmailLocale, string> = {
  de: 'de-DE',
  en: 'en-US',
  ru: 'ru-RU'
}

const escapeHTML = (value: unknown): string =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const getLocale = (locale?: string): EmailLocale => {
  const normalizedLocale = locale?.toLowerCase().split('-')[0]
  return normalizedLocale === 'de' || normalizedLocale === 'en' || normalizedLocale === 'ru'
    ? normalizedLocale
    : 'en'
}

const getRelatedDocument = <T extends { id: number }>(
  relation: T | number | null | undefined
): T | undefined => (typeof relation === 'object' && relation !== null ? relation : undefined)

const getVariantDescription = (variant?: Variant): string | undefined => {
  if (!variant) return undefined

  const optionLabels = variant.options
    .map(option => getRelatedDocument<VariantOption>(option)?.label)
    .filter((label): label is string => Boolean(label))

  return optionLabels.length > 0 ? optionLabels.join(', ') : variant.title || undefined
}

const getNaturalUnitPrice = (item: OrderItem, currency: NonNullable<Order['currency']>) => {
  if (typeof item.amount === 'number' && Number.isFinite(item.amount)) {
    return item.amount
  }

  const product = getRelatedDocument<Product>(item.product)
  const variant = getRelatedDocument<Variant>(item.variant)
  if (currency === 'RUB') return undefined

  const priceField = `priceIn${currency}` as 'priceInEUR' | 'priceInUSD'
  const price = variant?.[priceField] ?? product?.[priceField]

  return typeof price === 'number' && Number.isFinite(price) ? price : undefined
}

const formatMoney = (
  amount: number,
  currency: NonNullable<Order['currency']>,
  locale: EmailLocale
) =>
  new Intl.NumberFormat(localeTags[locale], {
    currency,
    style: 'currency'
  }).format(amount)

const getOrderTotal = (order: Order): number | undefined => {
  if (typeof order.amount === 'number' && Number.isFinite(order.amount)) {
    return order.amount / 100
  }

  if (typeof order.subtotal === 'number' && Number.isFinite(order.subtotal)) {
    return order.subtotal + (order.shippingCost || 0)
  }

  return undefined
}

export const buildOrderCreatedEmail = ({
  locale: requestedLocale,
  order,
  recipient = 'customer',
  siteName
}: OrderCreatedEmailOptions): OrderCreatedEmail => {
  const locale = getLocale(requestedLocale)
  const copy = translations[locale]
  const isAdmin = recipient === 'admin'
  const currency = order.currency || 'RUB'
  const customerName = order.shippingAddress?.firstName || undefined
  const items = order.items || []
  const total = getOrderTotal(order)
  const greeting = isAdmin ? copy.adminGreeting : copy.greeting(customerName)
  const intro = isAdmin ? copy.adminIntro : copy.intro
  const subject = isAdmin ? copy.adminSubject(order.id) : copy.subject(order.id)
  const title = isAdmin ? copy.adminThankYou : copy.thankYou
  const closing = isAdmin ? copy.adminWillContact : copy.willContact

  const itemDetails = items.map(item => {
    const product = getRelatedDocument<Product>(item.product)
    const variant = getRelatedDocument<Variant>(item.variant)
    const title =
      product?.title || `${copy.item} #${typeof item.product === 'number' ? item.product : ''}`
    const variantDescription = getVariantDescription(variant)
    const quantity = Number(item.quantity) || 1
    const unitPrice = getNaturalUnitPrice(item, currency)
    const lineTotal = unitPrice === undefined ? undefined : unitPrice * quantity

    return {
      lineTotal,
      quantity,
      title,
      unitPrice,
      variantDescription
    }
  })

  const rows = itemDetails
    .map(
      ({ lineTotal, quantity, title, unitPrice, variantDescription }) => `
        <tr>
          <td style="padding: 14px 12px; border-bottom: 1px solid #e8edf3; color: #1f2937;">
            <strong>${escapeHTML(title)}</strong>
            ${
              variantDescription
                ? `<div style="margin-top: 4px; color: #6b7280; font-size: 13px;">${escapeHTML(copy.variant)}: ${escapeHTML(variantDescription)}</div>`
                : ''
            }
          </td>
          <td style="padding: 14px 8px; border-bottom: 1px solid #e8edf3; text-align: center; color: #374151;">${quantity}</td>
          <td style="padding: 14px 8px; border-bottom: 1px solid #e8edf3; text-align: right; color: #374151; white-space: nowrap;">
            ${unitPrice === undefined ? copy.unitPriceUnavailable : escapeHTML(formatMoney(unitPrice, currency, locale))}
          </td>
          <td style="padding: 14px 12px 14px 8px; border-bottom: 1px solid #e8edf3; text-align: right; color: #111827; white-space: nowrap;">
            ${lineTotal === undefined ? copy.unitPriceUnavailable : `<strong>${escapeHTML(formatMoney(lineTotal, currency, locale))}</strong>`}
          </td>
        </tr>`
    )
    .join('')

  const subtotalRow =
    typeof order.subtotal === 'number'
      ? `<tr>
          <td colspan="3" style="padding: 5px 12px; text-align: right; color: #6b7280;">${escapeHTML(copy.subtotal)}</td>
          <td style="padding: 5px 12px; text-align: right; white-space: nowrap;">${escapeHTML(formatMoney(order.subtotal, currency, locale))}</td>
        </tr>`
      : ''

  const shippingRow =
    typeof order.shippingCost === 'number' && order.shippingCost > 0
      ? `<tr>
          <td colspan="3" style="padding: 5px 12px; text-align: right; color: #6b7280;">${escapeHTML(copy.shipping)}</td>
          <td style="padding: 5px 12px; text-align: right; white-space: nowrap;">${escapeHTML(formatMoney(order.shippingCost, currency, locale))}</td>
        </tr>`
      : ''

  const totalRow =
    total === undefined
      ? ''
      : `<tr>
          <td colspan="3" style="padding: 10px 12px 5px; text-align: right; font-size: 17px;"><strong>${escapeHTML(copy.total)}</strong></td>
          <td style="padding: 10px 12px 5px; text-align: right; color: #08afe6; font-size: 18px; white-space: nowrap;"><strong>${escapeHTML(formatMoney(total, currency, locale))}</strong></td>
        </tr>`

  const deliveryMethod = order.shippingMethodName
    ? `<p style="margin: 18px 0 0; color: #374151;"><strong>${escapeHTML(copy.deliveryMethod)}:</strong> ${escapeHTML(order.shippingMethodName)}</p>`
    : ''

  const emailField = order.customerEmail || (typeof order.customer === 'object' ? order.customer?.email : '') || ''
  const phoneField = order.shippingAddress?.phone || ''
  const nameStr = [order.shippingAddress?.firstName, order.shippingAddress?.lastName].filter(Boolean).join(' ')
  const addressLine = [
    order.shippingAddress?.company,
    order.shippingAddress?.addressLine1,
    order.shippingAddress?.addressLine2,
    order.shippingAddress?.postalCode,
    order.shippingAddress?.city,
    order.shippingAddress?.state,
    order.shippingAddress?.country
  ].filter(Boolean).join(', ')

  const formattedAddress = (nameStr ? escapeHTML(nameStr) + '<br>' : '') + escapeHTML(addressLine)

  const customerInfoBlock = `
    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e8edf3; color: #374151;">
      <h2 style="margin: 0 0 12px; font-size: 18px; color: #111827;">${escapeHTML(copy.customerInfo)}</h2>
      ${emailField ? `<p style="margin: 0 0 8px;"><strong>${escapeHTML(copy.email)}:</strong> ${escapeHTML(emailField)}</p>` : ''}
      ${phoneField ? `<p style="margin: 0 0 8px;"><strong>${escapeHTML(copy.phone)}:</strong> ${escapeHTML(phoneField)}</p>` : ''}
      ${formattedAddress ? `<p style="margin: 0 0 0;"><strong>${escapeHTML(copy.shippingAddress)}:</strong><br/>${formattedAddress}</p>` : ''}
    </div>`

  const html = `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHTML(subject)}</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f4f7fa; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #f4f7fa;">
      <tr>
        <td align="center" style="padding: 28px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 680px; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 18px rgba(31, 41, 55, 0.08);">
            <tr>
              <td style="padding: 22px 28px; background: #08afe6; color: #ffffff; font-size: 22px; font-weight: bold;">
                ${escapeHTML(siteName)}
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 28px;">
                <p style="margin: 0 0 12px; color: #374151; font-size: 16px;">${escapeHTML(greeting)}</p>
                <h1 style="margin: 0 0 12px; color: #111827; font-size: 26px; line-height: 1.25;">${escapeHTML(title)}</h1>
                <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.55;">${escapeHTML(intro)}</p>

                <div style="margin-bottom: 14px; color: #111827; font-size: 18px; font-weight: bold;">${escapeHTML(copy.order)} #${escapeHTML(order.id)}</div>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #e8edf3; border-radius: 8px; border-collapse: separate; border-spacing: 0; overflow: hidden; font-size: 14px;">
                  <thead>
                    <tr style="background: #f7f9fc;">
                      <th align="left" style="padding: 11px 12px; color: #4b5563;">${escapeHTML(copy.item)}</th>
                      <th style="padding: 11px 8px; color: #4b5563;">${escapeHTML(copy.quantity)}</th>
                      <th align="right" style="padding: 11px 8px; color: #4b5563;">${escapeHTML(copy.price)}</th>
                      <th align="right" style="padding: 11px 12px 11px 8px; color: #4b5563;">${escapeHTML(copy.total)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows}
                    ${subtotalRow}
                    ${shippingRow}
                    ${totalRow}
                  </tbody>
                </table>

                ${deliveryMethod}
                ${customerInfoBlock}
                <p style="margin: 24px 0 0; color: #4b5563; font-size: 15px; line-height: 1.55;">${escapeHTML(closing)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const textItems = itemDetails.map(
    ({ lineTotal, quantity, title, unitPrice, variantDescription }) => {
      const variantText = variantDescription ? ` (${copy.variant}: ${variantDescription})` : ''
      const priceText =
        unitPrice === undefined
          ? copy.unitPriceUnavailable
          : `${formatMoney(unitPrice, currency, locale)} × ${quantity} = ${formatMoney(lineTotal || 0, currency, locale)}`

      return `- ${title}${variantText}: ${priceText}`
    }
  )

  const textSummary = [
    typeof order.subtotal === 'number'
      ? `${copy.subtotal}: ${formatMoney(order.subtotal, currency, locale)}`
      : undefined,
    typeof order.shippingCost === 'number' && order.shippingCost > 0
      ? `${copy.shipping}: ${formatMoney(order.shippingCost, currency, locale)}`
      : undefined,
    total === undefined ? undefined : `${copy.total}: ${formatMoney(total, currency, locale)}`,
    order.shippingMethodName ? `${copy.deliveryMethod}: ${order.shippingMethodName}` : undefined
  ].filter((line): line is string => Boolean(line))

  const textCustomerInfo = [
    '---',
    copy.customerInfo,
    emailField ? `${copy.email}: ${emailField}` : undefined,
    phoneField ? `${copy.phone}: ${phoneField}` : undefined,
    formattedAddress ? `${copy.shippingAddress}: ${nameStr ? nameStr + ', ' : ''}${addressLine}` : undefined
  ].filter((line): line is string => Boolean(line))

  const text = [
    greeting,
    '',
    title,
    intro,
    '',
    `${copy.order} #${order.id}`,
    ...textItems,
    '',
    ...textSummary,
    '',
    ...textCustomerInfo,
    '',
    closing
  ].join('\n')

  return {
    html,
    subject,
    text
  }
}
