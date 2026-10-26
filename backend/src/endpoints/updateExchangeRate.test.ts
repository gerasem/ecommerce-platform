import assert from 'node:assert/strict'
import test from 'node:test'

import { updateExchangeRate } from './updateExchangeRate'

type User = {
  roles: Array<'admin' | 'customer'>
}

const callEndpoint = async ({
  payload,
  user
}: {
  payload: {
    findGlobal: () => Promise<{
      logs: unknown[]
      rate: number
      usdRate: number
    }>
    logger: {
      error: () => undefined
    }
    updateGlobal: (args: unknown) => Promise<unknown>
  }
  user?: User
}) => {
  return updateExchangeRate.handler({
    payload,
    user
  } as unknown as Parameters<typeof updateExchangeRate.handler>[0])
}

test('blocks anonymous and customer exchange-rate updates', async () => {
  let databaseCalled = false
  const payload = {
    findGlobal: async () => {
      databaseCalled = true
      return {
        logs: [],
        rate: 90,
        usdRate: 80
      }
    },
    logger: {
      error: () => undefined
    },
    updateGlobal: async () => {
      databaseCalled = true
      return {}
    }
  }

  const anonymousResponse = await callEndpoint({
    payload
  })
  const customerResponse = await callEndpoint({
    payload,
    user: {
      roles: ['customer']
    }
  })

  assert.equal(anonymousResponse.status, 401)
  assert.equal(customerResponse.status, 403)
  assert.equal(databaseCalled, false)
})

test('allows an admin to update rates through the shared server service', async t => {
  const originalFetch = global.fetch
  t.after(() => {
    global.fetch = originalFetch
  })

  global.fetch = async () =>
    Response.json({
      Valute: {
        EUR: {
          Value: 92.5
        },
        USD: {
          Value: 81.25
        }
      }
    })

  let updateData: unknown
  const response = await callEndpoint({
    payload: {
      findGlobal: async () => ({
        logs: [],
        rate: 90,
        usdRate: 80
      }),
      logger: {
        error: () => undefined
      },
      updateGlobal: async args => {
        updateData = args
        return {}
      }
    },
    user: {
      roles: ['admin']
    }
  })

  assert.equal(response.status, 200)
  const responseData = (await response.json()) as {
    logs: Array<{
      date: string
      rate: number
      status: string
      usdRate: number
    }>
    rate: number
    success: boolean
    usdRate: number
  }
  assert.equal(responseData.success, true)
  assert.equal(responseData.rate, 92.5)
  assert.equal(responseData.usdRate, 81.25)
  assert.equal(responseData.logs.length, 1)
  assert.match(responseData.logs[0]?.date || '', /^\d{4}-\d{2}-\d{2}T/)
  assert.deepEqual(responseData.logs[0], {
    date: responseData.logs[0]?.date,
    rate: 92.5,
    status: 'Success',
    usdRate: 81.25
  })

  const update = updateData as {
    data: {
      logs: Array<{
        date: string
        rate: number
        status: string
        usdRate: number
      }>
      rate: number
      usdRate: number
    }
    slug: string
  }
  assert.equal(update.slug, 'exchange-rate')
  assert.equal(update.data.rate, 92.5)
  assert.equal(update.data.usdRate, 81.25)
  assert.match(update.data.logs[0]?.date || '', /^\d{4}-\d{2}-\d{2}T/)
  assert.deepEqual(update.data.logs[0], {
    date: update.data.logs[0]?.date,
    rate: 92.5,
    status: 'Success',
    usdRate: 81.25
  })
})
