<script setup lang="ts">
import { richTextToHTML } from '@/utils/richtext'
import type { Form, FormBlock } from '@/generated/graphql'
import { getApiErrorMessage } from '@/utils/checkoutError'
import type { FormValue, IFormField } from '@/types'

const props = defineProps<{
  block: FormBlock
}>()

const { t } = useI18n()
const toast = useToast()

const formId = computed(() => props.block.form?.id || props.block.form)

const { data: formsData, error: formsError } = await useAsyncData(
  `form-block-${formId.value}`,
  () =>
    $payloadFetch<Form>(`/api/forms/${formId.value}`, {
      params: {
        depth: 2
      }
    })
)

// REST API for a single document returns the document directly, not a { docs: [] } array
const contactForm = computed(() => formsData.value)

function normalizeFormField(field: NonNullable<Form['fields']>[number]): IFormField | null {
  if (!('name' in field) || !field.name) return null

  const candidate = 'defaultValue' in field ? field.defaultValue : undefined
  const defaultValue = ['string', 'number', 'boolean'].includes(typeof candidate)
    ? (candidate as FormValue)
    : undefined
  const options =
    'options' in field && field.options
      ? field.options.flatMap(option =>
          option?.label && option.value ? [{ label: option.label, value: option.value }] : []
        )
      : undefined

  return {
    blockType: field.blockType || 'text',
    name: field.name,
    label: field.label || undefined,
    blockName: field.blockName || undefined,
    required: field.required || false,
    width: field.width || undefined,
    defaultValue,
    options
  }
}

const formFields = computed<IFormField[]>(() =>
  (contactForm.value?.fields || [])
    .map(normalizeFormField)
    .filter((field): field is IFormField => field !== null)
)

const loading = ref(false)
const submitted = ref(false)

const successMessageHtml = computed(() => {
  const msg = contactForm.value?.confirmationMessage

  if (!msg) return t('We will get back to you shortly.')

  if (typeof msg === 'string') return msg

  if (msg.root) {
    return richTextToHTML(msg)
  }

  return t('We will get back to you shortly.')
})

async function onSubmit(formData: Record<string, FormValue>) {
  if (!contactForm.value) return

  loading.value = true

  try {
    const submissionData = Object.entries(formData).map(([key, value]) => ({
      field: key,
      value
    }))

    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        formId: contactForm.value.id,
        submissionData,
        recaptchaToken: formData.recaptchaToken
      }
    })

    submitted.value = true
    // Scroll to top of the form block
    window.scrollBy({ top: -100, behavior: 'smooth' })
  } catch (error: unknown) {
    console.error('Submission failed', error)
    toast.add({
      title: t('Error'),
      description: getApiErrorMessage(error) || t('Failed to send message'),
      icon: 'i-bi-exclamation-circle',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="shadow-[0_0_40px_10px_rgba(0,0,0,0.05)] p-8 rounded-lg">
    <div v-if="formsError" class="text-red-500">
      {{ t('Failed to load contact form.') }}
    </div>

    <div v-else-if="!contactForm && !formsError">
      {{ t('Loading form...') }}
    </div>

    <!-- Success Message -->
    <div v-else-if="submitted" class="text-center py-8">
      <div class="mb-4">
        <UIcon name="i-bi-check-circle" class="w-16 h-16 mx-auto text-gray-400" />
      </div>

      <h3 class="text-2xl mb-4">
        {{ t('Thank you!') }}
      </h3>

      <div class="prose max-w-none mx-auto" v-html="successMessageHtml" />

      <UButton class="mt-8" @click="submitted = false">
        {{ t('Send another message') }}
      </UButton>
    </div>

    <!-- Form -->
    <FormBuilder
      v-else
      :fields="formFields"
      :submit-label="contactForm?.submitButtonLabel || t('Send Message')"
      :loading="loading"
      @submit="onSubmit"
    />
  </div>
</template>
