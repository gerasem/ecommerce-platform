import type { Payload } from 'payload'

import type { ExchangeRate } from '@/payload-types'

const CBR_DAILY_RATES_URL = 'https://www.cbr-xml-daily.ru/daily_json.js'
const FETCH_TIMEOUT_MS = 10_000
const MAX_LOG_ENTRIES = 50

type CBRResponse = {
  Valute?: {
    EUR?: {
      Value?: unknown
    }
    USD?: {
      Value?: unknown
    }
  }
}

export type ExchangeRateUpdateResult = {
  logs: NonNullable<ExchangeRate['logs']>
  rate: number
  usdRate: number
}

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error'
}

const isValidRate = (rate: unknown): rate is number => {
  return typeof rate === 'number' && Number.isFinite(rate) && rate > 0
}

export const updateExchangeRates = async ({
  payload
}: {
  payload: Payload
}): Promise<ExchangeRateUpdateResult> => {
  try {
    const response = await fetch(CBR_DAILY_RATES_URL, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    })

    if (!response.ok) {
      throw new Error(`CBR request failed with status ${response.status}`)
    }

    const data = (await response.json()) as CBRResponse
    const rate = data.Valute?.EUR?.Value
    const usdRate = data.Valute?.USD?.Value

    if (!isValidRate(rate) || !isValidRate(usdRate)) {
      throw new Error('CBR response does not contain valid EUR and USD rates')
    }

    const currentGlobal = await payload.findGlobal({
      slug: 'exchange-rate'
    })
    const currentLogs = Array.isArray(currentGlobal.logs) ? currentGlobal.logs : []
    const logs: NonNullable<ExchangeRate['logs']> = [
      {
        date: new Date().toISOString(),
        rate,
        status: 'Success',
        usdRate
      },
      ...currentLogs
    ].slice(0, MAX_LOG_ENTRIES)

    await payload.updateGlobal({
      data: {
        logs,
        rate,
        usdRate
      },
      slug: 'exchange-rate'
    })

    return {
      logs,
      rate,
      usdRate
    }
  } catch (error) {
    const message = getErrorMessage(error)
    payload.logger.error({ err: error, msg: 'Exchange rate update failed' })

    try {
      const currentGlobal = await payload.findGlobal({
        slug: 'exchange-rate'
      })
      const currentLogs = Array.isArray(currentGlobal.logs) ? currentGlobal.logs : []

      await payload.updateGlobal({
        data: {
          logs: [
            {
              date: new Date().toISOString(),
              rate: currentGlobal.rate,
              status: `Error: ${message}`,
              usdRate: currentGlobal.usdRate
            },
            ...currentLogs
          ].slice(0, MAX_LOG_ENTRIES)
        },
        slug: 'exchange-rate'
      })
    } catch (logError) {
      payload.logger.error({
        err: logError,
        msg: 'Failed to save exchange rate error log'
      })
    }

    throw error
  }
}
