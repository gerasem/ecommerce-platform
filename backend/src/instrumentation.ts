export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const cron = (await import('node-cron')).default

    cron.schedule(
      '0 4 * * *',
      async () => {
        try {
          const [{ getPayload }, { default: config }, { updateExchangeRates }] = await Promise.all([
            import('payload'),
            import('@payload-config'),
            import('@/lib/exchangeRate')
          ])
          const payload = await getPayload({ config })
          const result = await updateExchangeRates({ payload })

          payload.logger.info(
            `[Cron] Exchange rates updated: EUR ${result.rate}, USD ${result.usdRate}`
          )
        } catch (error) {
          console.error('[Cron] Exchange rate update failed:', error)
        }
      },
      {
        timezone: 'Europe/Moscow'
      }
    )
    console.log('[Cron] Exchange rate update scheduled for 04:00 Europe/Moscow')
  }
}
