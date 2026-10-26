import { Access, AccessArgs } from 'payload'
import { features, type RuntimeFeature } from '@/lib/features'

export const featureEnabled = (featureKey: RuntimeFeature, fallbackAccess?: Access): Access => {
  return (args: AccessArgs) => {
    if (!features[featureKey]) {
      return false
    }

    if (fallbackAccess) {
      return fallbackAccess(args)
    }

    return true
  }
}
