export type OrderConfirmationState = 'stripe' | 'payment-failed' | 'completed-order' | 'missing'

type OrderConfirmationInput = {
  completedOrderId?: number | string | null
  paymentIntentId?: string
  redirectStatus?: string
}

export function getOrderConfirmationState({
  completedOrderId,
  paymentIntentId,
  redirectStatus
}: OrderConfirmationInput): OrderConfirmationState {
  if (redirectStatus === 'succeeded' && paymentIntentId) return 'stripe'
  if (redirectStatus && redirectStatus !== 'succeeded') return 'payment-failed'
  if (completedOrderId !== undefined && completedOrderId !== null) return 'completed-order'
  return 'missing'
}
