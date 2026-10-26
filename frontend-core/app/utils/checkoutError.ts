type UnknownRecord = Record<string, unknown>

function asRecord(value: unknown): UnknownRecord | undefined {
  return typeof value === 'object' && value !== null ? (value as UnknownRecord) : undefined
}

function firstString(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === 'string' && value.length > 0)
}

export function getApiErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error

  const errorRecord = asRecord(error)
  const data = asRecord(errorRecord?.data)
  const response = asRecord(errorRecord?.response)
  const responseData = asRecord(response?._data)
  const dataErrors = Array.isArray(data?.errors) ? data.errors : []
  const responseErrors = Array.isArray(responseData?.errors) ? responseData.errors : []
  const firstDataError = asRecord(dataErrors[0])
  const firstResponseError = asRecord(responseErrors[0])

  return (
    firstString(
      data?.error,
      data?.statusMessage,
      data?.message,
      firstDataError?.message,
      responseData?.error,
      responseData?.statusMessage,
      responseData?.message,
      firstResponseError?.message,
      errorRecord?.statusMessage,
      errorRecord?.message
    ) || ''
  )
}

function getApiErrorStatus(error: unknown): number | undefined {
  const errorRecord = asRecord(error)
  const response = asRecord(errorRecord?.response)
  const status = errorRecord?.statusCode ?? errorRecord?.status ?? response?.status

  return typeof status === 'number' ? status : undefined
}

export function isRecoverableCartReferenceError(error: unknown): boolean {
  const status = getApiErrorStatus(error)
  const message = getApiErrorMessage(error).toLowerCase()

  return (
    status === 404 ||
    message.includes('cart has already been purchased') ||
    message.includes('cart already purchased') ||
    message.includes('cart not found') ||
    message.includes('invalid or missing cart secret') ||
    message.includes('invalid cart secret')
  )
}

export function getCheckoutErrorTranslationKey(error: unknown): string {
  const status = getApiErrorStatus(error)
  const message = getApiErrorMessage(error).toLowerCase()

  if (isRecoverableCartReferenceError(error)) {
    return 'We could not restore your cart. Please reload the page and try again.'
  }

  if (status === 429 || message.includes('too many requests') || message.includes('rate limit')) {
    return 'Too many attempts. Please try again later.'
  }

  if (
    message.includes('shipping method') &&
    (message.includes('invalid') ||
      message.includes('not found') ||
      message.includes('no longer available'))
  ) {
    return 'The selected shipping method is no longer available. Please select it again.'
  }

  if (message.includes('shipping') && message.includes('not configured')) {
    return 'Shipping is temporarily unavailable. Please try again later.'
  }

  if (
    message.includes('cart must contain') ||
    message.includes('invalid cart item') ||
    message.includes('product not found') ||
    message.includes('out of stock')
  ) {
    return 'Some items in your cart are no longer available. Please review your cart.'
  }

  if (
    message.includes('failed to fetch') ||
    message.includes('network error') ||
    message.includes('load failed') ||
    message.includes('fetch failed')
  ) {
    return 'Could not connect to the server. Please check your connection and try again.'
  }

  return 'Failed to create order'
}
