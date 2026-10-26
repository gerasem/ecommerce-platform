import type { Endpoint } from 'payload'

import { checkRole } from '@/access/utilities'
import { updateExchangeRates } from '@/lib/exchangeRate'

export const updateExchangeRate: Endpoint = {
  path: '/exchange-rate/update',
  method: 'post',
  handler: async req => {
    if (!req.user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!checkRole(['admin'], req.user)) {
      return Response.json({ error: 'Administrator access required' }, { status: 403 })
    }

    try {
      const result = await updateExchangeRates({
        payload: req.payload
      })

      return Response.json({
        ...result,
        success: true
      })
    } catch {
      return Response.json(
        { error: 'Failed to update exchange rates', success: false },
        { status: 500 }
      )
    }
  }
}
