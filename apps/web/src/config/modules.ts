export type ServiceModule =
  | 'tours'
  | 'accommodations'
  | 'waterActivities'
  | 'yacht'
  | 'restaurants'
  | 'weddings'
  | 'rentals'
  | 'spa'
  | 'ferryTickets'

export interface ModuleConfig {
  enabled: boolean
  label: string
  slug: string
  icon: string
  collection: string
}

export const modules: Record<ServiceModule, ModuleConfig> = {
  tours:           { enabled: true, label: 'Tours & Activities', slug: 'tours', icon: 'compass', collection: 'tours' },
  accommodations:  { enabled: true, label: 'Villas & Hotels', slug: 'accommodations', icon: 'bed-double', collection: 'accommodations' },
  waterActivities: { enabled: true, label: 'Water Activities', slug: 'water-activities', icon: 'waves', collection: 'water-activities' },
  yacht:           { enabled: true, label: 'Private Yacht', slug: 'yacht', icon: 'ship', collection: 'yachts' },
  restaurants:     { enabled: true, label: 'Restaurants', slug: 'restaurants', icon: 'utensils', collection: 'restaurants' },
  weddings:        { enabled: true, label: 'Weddings & Events', slug: 'weddings', icon: 'heart', collection: 'venues' },
  rentals:         { enabled: true, label: 'Rental Service', slug: 'rentals', icon: 'car', collection: 'rentals' },
  spa:             { enabled: true, label: 'Spa & Wellness', slug: 'spa', icon: 'sparkles', collection: 'spa' },
  ferryTickets:    { enabled: true, label: 'Ferry Tickets', slug: 'ferry-tickets', icon: 'ship', collection: 'ferry-tickets' }
}

export const enabledModules = () =>
  Object.entries(modules)
    .filter(([_, config]) => config.enabled)
    .map(([key, config]) => ({ key: key as ServiceModule, ...config }))
