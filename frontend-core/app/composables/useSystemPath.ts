export type SystemRole =
  | 'home'
  | 'cart'
  | 'checkout'
  | 'favorites'
  | 'all_items'
  | 'privacy_policy'
  | 'imprint'
  | 'delivery'

export function useSystemPath(role: SystemRole): string {
  const fallbacks: Record<SystemRole, string> = {
    home: '',
    cart: 'cart',
    checkout: 'checkout',
    favorites: 'favorites',
    all_items: 'all-items',
    privacy_policy: 'datenschutz',
    imprint: 'impressum',
    delivery: 'page/delivery'
  }

  const pages = useState<Record<string, string>>('systemPages').value || {}
  return '/' + (pages[role as string] || fallbacks[role])
}
