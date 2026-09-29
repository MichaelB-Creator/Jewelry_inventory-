import { useState, useEffect, useCallback } from 'react'
import type { JewelryItem, ItemFormData, Stats } from './types'
import { CATEGORIES } from './types'
import { fetchItems, createItem, updateItem, deleteItem, fetchStats } from './api'
import ItemCard from './components/ItemCard'
import ItemForm from './components/ItemForm'
import StatsBar from './components/StatsBar'

export default function App() {
  const [items, setItems] = useState<JewelryItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<JewelryItem | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [itemsData, statsData] = await Promise.all([
        fetchItems(search, category),
        fetchStats(),
      ])
      setItems(itemsData)
      setStats(statsData)
    } catch (e) {
      console.error('Failed to load data', e)
    } finally {
      setLoading(false)
    }
  }, [search, category])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAdd = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  const handleEdit = (item: JewelryItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this item?')) return
    await deleteItem(id)
    loadData()
  }

  const handleSubmit = async (data: ItemFormData) => {
    if (editingItem) {
      await updateItem(editingItem.id, data)
    } else {
      await createItem(data)
    }
    setShowForm(false)
    setEditingItem(null)
    loadData()
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>💎 Jewelry Inventory</h1>
        <button className="btn-primary" onClick={handleAdd}>+ Add Item</button>
      </header>

      <StatsBar stats={stats} />

      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={category} onChange={e => setCategory(e.target.value)} className="filter-select">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💎</div>
          <h2>No items found</h2>
          <p>Add your first piece to start tracking your inventory.</p>
          <button className="btn-primary" onClick={handleAdd}>+ Add Item</button>
        </div>
      ) : (
        <div className="item-grid">
          {items.map(item => (
            <ItemCard key={item.id} item={item} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showForm && (
        <ItemForm
          item={editingItem}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditingItem(null) }}
        />
      )}
    </div>
  )
}
