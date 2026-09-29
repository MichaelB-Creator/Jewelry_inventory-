export interface JewelryItem {
  id: number
  sku: string
  name: string
  category: string
  material: string
  gemstone: string
  karat: string
  weight: number
  price: number
  quantity: number
  image_url: string
  description: string
  created_at: string
}

export type ItemFormData = Omit<JewelryItem, 'id' | 'created_at' | 'sku'>

export interface Stats {
  total_items: number
  total_value: number
  total_unique: number
  by_category: Record<string, number>
}

export const CATEGORIES = ['Ring', 'Necklace', 'Bracelet', 'Earring', 'Watch', 'Pendant', 'Other'] as const
