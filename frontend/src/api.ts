import type { JewelryItem, ItemFormData, Stats } from './types'

const API = '/api'

export async function fetchItems(search = '', category = ''): Promise<JewelryItem[]> {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  const res = await fetch(`${API}/items?${params}`)
  if (!res.ok) throw new Error('Failed to fetch items')
  return res.json()
}

export async function createItem(data: ItemFormData): Promise<JewelryItem> {
  const res = await fetch(`${API}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create item')
  return res.json()
}

export async function updateItem(id: number, data: ItemFormData): Promise<JewelryItem> {
  const res = await fetch(`${API}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update item')
  return res.json()
}

export async function deleteItem(id: number): Promise<void> {
  const res = await fetch(`${API}/items/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete item')
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API}/upload`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Failed to upload image')
  const data = await res.json()
  return data.url
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${API}/stats`)
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}
