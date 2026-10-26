<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { FormValue, IFormField } from '@/types'

const { t } = useI18n()

interface Props {
  fields: IFormField[]
  loading?: boolean
  submitLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  submitLabel: 'Submit'
})

const emit = defineEmits<{
  (e: 'submit', data: Record<string, FormValue>): void
}>()

// Reactive form state
const state = reactive<Record<string, FormValue>>({})

// Initialize form state
watch(
  () => props.fields,
  newFields => {
    newFields.forEach(field => {
      if (field.name && !(field.name in state)) {
        state[field.name] = field.defaultValue ?? ''
      }
    })
    // Add global privacy consent field
    if (!('privacyAccepted' in state)) {
      state.privacyAccepted = false
    }
  },
  { immediate: true }
)

// Helper to get display label
function getLabel(field: IFormField): string {
  if (field.label) return field.label
  if (field.blockName) return field.blockName
  // Fallback to name, capitalized
  return field.name.charAt(0).toUpperCase() + field.name.slice(1).replace(/-/g, ' ')
}

function getTextValue(name: string): string {
  const value = state[name]
  return typeof value === 'string' ? value : ''
}

function setTextValue(name: string, value: unknown) {
  state[name] = typeof value === 'string' ? value : ''
}

// Dynamic Zod Schema Generation
const schema = computed(() => {
  const shape: Record<string, z.ZodType> = {}

  props.fields.forEach(field => {
    const label = getLabel(field)

    // Special case for Phone: User requested no validation
    if (field.name === 'phone') {
      shape[field.name] = field.required
        ? z.string().min(1, `${label} is required`)
        : z.unknown().optional()
      return
    }

    let validator: z.ZodType
    switch (field.blockType) {
      case 'email':
        validator = z.string().email(`Invalid ${label}`)
        break
      case 'number':
        // Handle empty string from input as undefined/null for optional numbers
        // z.preprocess converts input before validation
        validator = z.preprocess(
          val => (val === '' ? undefined : Number(val)),
          z.number({ message: `${label} must be a number` })
        )
        break
      case 'checkbox':
        validator = z.boolean()
        break
      default:
        validator = z.string()
    }

    if (field.required) {
      if (field.blockType === 'text' || field.blockType === 'textarea') {
        validator = z.string().min(1, `${label} is required`)
      }
      if (field.blockType === 'checkbox') {
        // Checkbox required usually means it must be true
        validator = z.literal(true, { message: `${label} is required` })
      }
    } else {
      validator = validator.optional().or(z.literal(''))
    }

    shape[field.name] = validator
  })

  // Mandatory Privacy Consent for DSGVO
  shape.privacyAccepted = z.literal(true, {
    message: t('Consent is required')
  })

  return z.object(shape)
})

const toast = useToast()
const { shouldLoadCaptcha, executeCaptcha, hasCaptcha, captchaProvider, renderYandexCaptcha } =
  useCaptcha()

const yandexCaptchaContainerId = `yandex-captcha-builder-${useId()}`

watch(shouldLoadCaptcha, val => {
  if (val && captchaProvider === 'yandex') {
    renderYandexCaptcha(yandexCaptchaContainerId)
  }
})

const isSubmitting = ref(false)

async function onSubmit(event?: FormSubmitEvent<Record<string, unknown>>) {
  if (!event || isSubmitting.value) return

  isSubmitting.value = true

  let token = ''

  if (hasCaptcha) {
    try {
      token = await executeCaptcha('submit_form')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Please complete the CAPTCHA'
      toast.add({ title: t('Error'), description: t(message), color: 'error' })
      isSubmitting.value = false
      return
    }
  }

  const formData = Object.fromEntries(
    Object.entries(event.data).filter((entry): entry is [string, FormValue] => {
      const value = entry[1]
      return value === undefined || ['string', 'number', 'boolean'].includes(typeof value)
    })
  )

  emit('submit', {
    ...formData,
    recaptchaToken: token
  })

  isSubmitting.value = false
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-wrap"
    @submit="onSubmit"
    @focusin.once="shouldLoadCaptcha = true"
  >
    <!-- Required fields hint -->
    <div class="w-full px-2 mb-4 text-sm text-gray-500 italic">* {{ t('Required fields') }}</div>

    <template v-for="field in fields" :key="field.name">
      <UFormField
        v-if="field.blockType !== 'message'"
        :label="getLabel(field)"
        :name="field.name"
        :required="field.required"
        class="px-2 mb-6"
        :style="{ width: field.width ? `${field.width}%` : '100%' }"
        :data-slot="'root'"
      >
        <!-- Text Input -->
        <UInput
          v-if="field.blockType === 'text'"
          v-model="state[field.name]"
          :placeholder="getLabel(field)"
          class="w-full"
          size="xl"
        />

        <!-- Email Input -->
        <UInput
          v-else-if="field.blockType === 'email'"
          v-model="state[field.name]"
          type="email"
          :placeholder="getLabel(field)"
          class="w-full"
          size="xl"
        />

        <!-- Textarea -->
        <UTextarea
          v-else-if="field.blockType === 'textarea'"
          :model-value="getTextValue(field.name)"
          :rows="4"
          :placeholder="getLabel(field)"
          class="w-full"
          size="xl"
          @update:model-value="setTextValue(field.name, $event)"
        />

        <!-- Number -->
        <UInput
          v-else-if="field.blockType === 'number'"
          v-model.number="state[field.name]"
          type="number"
          :placeholder="getLabel(field)"
          class="w-full"
          size="xl"
        />

        <!-- Select -->
        <USelect
          v-else-if="field.blockType === 'select'"
          v-model="state[field.name]"
          :options="field.options"
          option-attribute="label"
          value-attribute="value"
          :placeholder="getLabel(field)"
          class="w-full"
          size="xl"
        />

        <!-- Checkbox -->
        <UCheckbox
          v-else-if="field.blockType === 'checkbox'"
          v-model="state[field.name]"
          :label="getLabel(field)"
          size="xl"
        />
      </UFormField>
    </template>

    <!-- Privacy Consent Checkbox (DSGVO) -->
    <div class="w-full px-2 mb-6">
      <UFormField name="privacyAccepted" :required="true">
        <UCheckbox v-model="state.privacyAccepted">
          <template #label>
            <span class="text-sm">
              <i18n-t keypath="privacy_consent_label">
                <template #privacy>
                  <NuxtLink
                    :to="useSystemPath('privacy_policy')"
                    target="_blank"
                    class="underline hover:text-primary transition-colors"
                  >
                    {{ t('Privacy Policy') }}
                  </NuxtLink>
                </template>
              </i18n-t>
            </span>
          </template>
        </UCheckbox>
      </UFormField>
    </div>

    <div class="w-full px-2">
      <div
        v-if="hasCaptcha && captchaProvider === 'yandex'"
        :id="yandexCaptchaContainerId"
        class="mb-4"
      />
      <UButton type="submit" size="xl" :loading="loading" icon="bi-send" class="px-8">
        {{ submitLabel }}
      </UButton>

      <!-- DSGVO Privacy Notice for Captcha -->
      <div
        v-if="hasCaptcha && captchaProvider === 'google'"
        class="w-full text-[11px] text-gray-500 mt-2 leading-tight"
      >
        <i18n-t keypath="recaptcha_privacy_notice" tag="p">
          <template #privacy>
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              class="underline hover:text-primary"
            >
              {{ t('Privacy Policy') }}
            </a>
          </template>

          <template #terms>
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              class="underline hover:text-primary"
            >
              {{ t('Terms of Service') }}
            </a>
          </template>
        </i18n-t>
      </div>
      <div
        v-else-if="hasCaptcha && captchaProvider === 'yandex'"
        class="w-full text-[11px] text-gray-500 mt-2 leading-tight"
      >
        <i18n-t keypath="yandex_captcha_privacy_notice" tag="p">
          <template #terms>
            <a
              href="https://yandex.ru/legal/smartcaptcha_notice/"
              target="_blank"
              rel="noopener noreferrer"
              class="underline hover:text-primary"
            >
              {{ t('Terms of Service') }}
            </a>
          </template>

          <template #privacy>
            <a
              href="https://yandex.ru/legal/confidential/"
              target="_blank"
              rel="noopener noreferrer"
              class="underline hover:text-primary"
            >
              {{ t('Privacy Policy') }}
            </a>
          </template>
        </i18n-t>
      </div>
    </div>
  </UForm>
</template>
