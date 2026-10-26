import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { Order, Product } from '@/payload-types'

import { buildOrderCreatedEmail } from './orderCreated'

const product = {
  id: 10,
  title: 'Test T-shirt',
  priceInEUR: 49.99
} as Product

const order = {
  id: 42,
  amount: 2739937,
  currency: 'RUB',
  subtotal: 27399.37,
  shippingCost: 0,
  shippingMethodName: 'Transport company',
  shippingAddress: {
    firstName: 'Alex'
  },
  items: [
    {
      amount: 13699.685,
      product,
      quantity: 2
    }
  ]
} as Order

test('renders order items and totals in natural currency units', () => {
  const email = buildOrderCreatedEmail({
    locale: 'ru',
    order,
    siteName: 'Aura Store'
  })

  assert.equal(email.subject, 'Ваш заказ #42 успешно оформлен')
  assert.match(email.html, /Test T-shirt/)
  assert.match(email.html, /27\s?399,37\s?₽/)
  assert.match(email.text, /Transport company/)
  assert.doesNotMatch(email.html, /2\s?739\s?937/)
})

test('escapes dynamic content used in HTML emails', () => {
  const email = buildOrderCreatedEmail({
    locale: 'en',
    order: {
      ...order,
      shippingAddress: {
        firstName: '<script>alert(1)</script>'
      }
    },
    siteName: '<b>Shop</b>'
  })

  assert.doesNotMatch(email.html, /<script>/)
  assert.doesNotMatch(email.html, /<b>Shop<\/b>/)
  assert.match(email.html, /&lt;script&gt;/)
  assert.match(email.html, /&lt;b&gt;Shop&lt;\/b&gt;/)
})

test('renders the same order details with admin-specific copy', () => {
  const email = buildOrderCreatedEmail({
    locale: 'ru',
    order,
    recipient: 'admin',
    siteName: 'Aura Store'
  })

  assert.equal(email.subject, 'Новый заказ #42 на сайте')
  assert.match(email.html, /На сайте был сделан заказ/)
  assert.match(email.html, /Test T-shirt/)
  assert.match(email.html, /27\s?399,37\s?₽/)
  assert.doesNotMatch(email.html, /Спасибо за ваш заказ/)
  assert.match(email.text, /Transport company/)
})
