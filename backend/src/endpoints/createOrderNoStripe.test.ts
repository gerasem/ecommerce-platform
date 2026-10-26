import assert from 'node:assert/strict'
import test from 'node:test'

import { createOrderNoStripe } from './createOrderNoStripe'

type PayloadOverrides = {
  create?: (args: any) => Promise<any>
  find?: (args: any) => Promise<any>
  findByID?: (args: any) => Promise<any>
  findGlobal?: (args: any) => Promise<any>
  update?: (args: any) => Promise<any>
}

const validBody = {
  cartID: 7,
  customerEmail: ' CUSTOMER@example.com ',
  secret: 'cart-secret',
  shippingAddress: {
    address: 'Example street 10',
    city: 'Moscow',
    country: 'RU',
    firstName: 'Alex',
    lastName: 'Smith',
    phone: '+7 900 000-00-00',
    postalCode: '123456'
  },
  shippingMethodId: 'delivery-method'
}

const activeCart = {
  customer: null,
  id: 7,
  items: [
    {
      product: {
        _status: 'published',
        baseCurrency: 'EUR',
        id: 11,
        priceInEUR: 100,
        title: 'Test product'
      },
      quantity: 1
    }
  ],
  purchasedAt: null,
  secret: 'cart-secret'
}

const callEndpoint = async ({
  body = validBody,
  ip,
  payload = {}
}: {
  body?: unknown
  ip: string
  payload?: PayloadOverrides
}) => {
  const request = Object.assign(
    new Request('http://localhost/api/create-order-no-stripe', {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip
      },
      method: 'POST'
    }),
    {
      payload: {
        create: async () => ({ id: 99 }),
        find: async () => ({ docs: [] }),
        findByID: async () => activeCart,
        findGlobal: async ({ slug }: { slug: string }) =>
          slug === 'exchange-rate'
            ? { rate: 100, usdRate: 90 }
            : {
                freeShippingThreshold: 0,
                minimumOrderAmount: 6000,
                shippingMethods: [
                  {
                    id: 'delivery-method',
                    name: 'Transport company',
                    price: null
                  }
                ]
              },
        logger: {
          error: () => undefined
        },
        update: async () => ({ id: 7 }),
        ...payload
      },
      user: undefined
    }
  ) as unknown as Parameters<typeof createOrderNoStripe.handler>[0]

  return createOrderNoStripe.handler(request)
}

test('creates an order from validated and server-priced data', async () => {
  let createArgs: any
  let updateArgs: any
  const response = await callEndpoint({
    ip: '192.0.2.10',
    payload: {
      create: async args => {
        createArgs = args
        return { id: 99 }
      },
      update: async args => {
        updateArgs = args
        return { id: 7 }
      }
    }
  })

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    message: 'Order created successfully',
    orderID: 99,
    success: true
  })
  assert.equal(createArgs.data.customerEmail, 'customer@example.com')
  assert.equal(createArgs.data.sourceCart, 7)
  assert.equal(createArgs.data.subtotal, 10000)
  assert.equal(createArgs.data.amount, 1_000_000)
  assert.deepEqual(createArgs.data.items, [
    {
      amount: 10000,
      currency: 'RUB',
      product: 11,
      quantity: 1,
      variant: undefined
    }
  ])
  assert.equal(createArgs.data.shippingMethodName, 'Transport company')
  assert.equal(updateArgs.data.purchasedAt.length > 0, true)
})

test('rejects incomplete delivery data before reading the cart', async () => {
  let findByIDCalled = false
  const response = await callEndpoint({
    body: {
      ...validBody,
      shippingAddress: {
        city: 'Moscow'
      }
    },
    ip: '192.0.2.11',
    payload: {
      findByID: async () => {
        findByIDCalled = true
        return activeCart
      }
    }
  })

  assert.equal(response.status, 400)
  assert.equal(findByIDCalled, false)
})

test('rejects a shipping method that is not configured', async () => {
  let createCalled = false
  const response = await callEndpoint({
    body: {
      ...validBody,
      shippingMethodId: 'forged-free-delivery'
    },
    ip: '192.0.2.12',
    payload: {
      create: async () => {
        createCalled = true
        return { id: 99 }
      }
    }
  })

  assert.equal(response.status, 400)
  assert.equal(createCalled, false)
})

test('returns the existing order when a cart request is repeated', async () => {
  let createCalled = false
  const response = await callEndpoint({
    ip: '192.0.2.13',
    payload: {
      create: async () => {
        createCalled = true
        return { id: 99 }
      },
      find: async () => ({ docs: [{ id: 55 }] }),
      findByID: async () => ({
        ...activeCart,
        purchasedAt: new Date().toISOString()
      })
    }
  })

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    alreadyProcessed: true,
    message: 'Order has already been created',
    orderID: 55,
    success: true
  })
  assert.equal(createCalled, false)
})

test('resolves a concurrent unique-cart conflict as an idempotent success', async () => {
  const response = await callEndpoint({
    ip: '192.0.2.14',
    payload: {
      create: async () => {
        throw new Error('duplicate key value violates unique constraint')
      },
      find: async () => ({ docs: [{ id: 56 }] })
    }
  })

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    alreadyProcessed: true,
    message: 'Order has already been created',
    orderID: 56,
    success: true
  })
})

test('rate limits repeated order attempts from one address', async () => {
  const ip = '192.0.2.15'
  let lastResponse: Response | undefined

  for (let attempt = 0; attempt <= 10; attempt += 1) {
    lastResponse = await callEndpoint({
      body: {},
      ip
    })
  }

  assert.equal(lastResponse?.status, 429)
})
