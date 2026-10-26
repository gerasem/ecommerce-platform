import assert from 'node:assert/strict'
import test from 'node:test'

import type { Config } from 'payload'

import { plugins } from './index'

type Operation = 'create' | 'delete' | 'read' | 'update'

const operations: Operation[] = ['create', 'read', 'update', 'delete']

const getFormBuilderCollections = async () => {
  const formBuilder = plugins[1]
  assert.ok(formBuilder, 'Form Builder plugin must be configured')

  const config = await formBuilder({ collections: [] } as any as Config)
  const forms = config.collections?.find(collection => collection.slug === 'forms')
  const submissions = config.collections?.find(collection => collection.slug === 'form-submissions')

  assert.ok(forms, 'Forms collection must be generated')
  assert.ok(submissions, 'Form submissions collection must be generated')

  return { forms, submissions }
}

const checkAccess = async ({
  collection,
  operation,
  user
}: {
  collection: Awaited<ReturnType<typeof getFormBuilderCollections>>['forms']
  operation: Operation
  user?: { roles: string[] }
}) => {
  const access = collection.access?.[operation]
  if (typeof access !== 'function') {
    assert.fail(`${collection.slug}.${operation} access must be explicit`)
  }

  return access({
    req: { user }
  } as unknown as Parameters<typeof access>[0])
}

test('Form Builder protects form definitions and submissions from customers', async () => {
  const { forms, submissions } = await getFormBuilderCollections()
  const users = {
    admin: { roles: ['admin'] },
    anonymous: undefined,
    customer: { roles: ['customer'] }
  }

  for (const operation of operations) {
    assert.equal(
      await checkAccess({ collection: forms, operation, user: users.anonymous }),
      operation === 'read'
    )
    assert.equal(
      await checkAccess({ collection: forms, operation, user: users.customer }),
      operation === 'read'
    )
    assert.equal(await checkAccess({ collection: forms, operation, user: users.admin }), true)

    assert.equal(
      await checkAccess({ collection: submissions, operation, user: users.anonymous }),
      false
    )
    assert.equal(
      await checkAccess({ collection: submissions, operation, user: users.customer }),
      false
    )
    assert.equal(await checkAccess({ collection: submissions, operation, user: users.admin }), true)
  }
})
