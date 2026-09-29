import { useState, useEffect, useRef } from 'react'
import type { JewelryItem, ItemFormData } from '../types'
import { CATEGORIES } from '../types'
import { uploadImage } from '../api'

interface Props {
  item: JewelryItem | null
  onSubmit: (data: ItemFormData) => void
  onClose: () => void
}

const emptyForm: ItemFormData = {
  name: '',
  category: 'Other',
  material: '',
  gemstone: '',
  karat: '',
  weight: 0,
  price: 0,
  quantity: 1,
  image_url: '',
  description: '',
}

export default function ItemForm({ item, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<ItemFormData>(emptyForm)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (item) {
      const { id: _id, created_at: _ca, ...rest } = item
      setForm(rest)
    } else {
      setForm(emptyForm)
    }
  }, [item])

  const update = (field: keyof ItemFormData, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      update('image_url', url)
    } catch (err) {
      console.error('Upload failed', err)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? 'Edit Item' : 'Add New Item'}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-row">
            <label>Name *</label>
            <input type="text" required value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="e.g. Gold Diamond Ring" />
          </div>
          <div className="form-row">
            <label>Category</label>
            <select value={form.category} onChange={e => update('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label>Material</label>
              <input type="text" value={form.material}
                onChange={e => update('material', e.target.value)}
                placeholder="Gold, Silver…" />
            </div>
            <div className="form-row">
              <label>Karat</label>
              <input type="text" value={form.karat}
                onChange={e => update('karat', e.target.value)}
                placeholder="14k, 18k…" />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label>Gemstone</label>
              <input type="text" value={form.gemstone}
                onChange={e => update('gemstone', e.target.value)}
                placeholder="Diamond, Ruby…" />
            </div>
            <div className="form-row">
              <label>Weight (g)</label>
              <input type="number" step="0.01" value={form.weight || ''}
                onChange={e => update('weight', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label>Price ($)</label>
              <input type="number" step="0.01" value={form.price || ''}
                onChange={e => update('price', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-row">
              <label>Quantity</label>
              <input type="number" min="1" value={form.quantity}
                onChange={e => update('quantity', parseInt(e.target.value) || 1)} />
            </div>
          </div>
          <div className="form-row">
            <label>Picture</label>
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              {form.image_url ? (
                <img src={form.image_url} alt="Preview" className="upload-preview" />
              ) : (
                <div className="upload-placeholder">
                  {uploading ? 'Uploading…' : '📷 Click to upload a photo'}
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {form.image_url && (
              <button type="button" className="btn-remove-image"
                onClick={() => update('image_url', '')}>
                Remove photo
              </button>
            )}
          </div>
          <div className="form-row">
            <label>Description</label>
            <textarea value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={3} placeholder="Notes about this piece…" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{item ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
