import type { JewelryItem } from '../types'

interface Props {
  item: JewelryItem
  onEdit: (item: JewelryItem) => void
  onDelete: (id: number) => void
}

export default function ItemCard({ item, onEdit, onDelete }: Props) {
  return (
    <div className="item-card">
      <div className="item-card-image">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} />
        ) : (
          <div className="item-card-placeholder">💎</div>
        )}
      </div>
      <div className="item-card-body">
        <span className="item-sku">{item.sku}</span>
        <div className="item-card-header">
          <h3>{item.name}</h3>
          <span className="badge">{item.category}</span>
        </div>
        <div className="item-card-details">
          {item.material && <span>{item.material}</span>}
          {item.karat && <span>{item.karat}</span>}
          {item.gemstone && <span>💎 {item.gemstone}</span>}
          {item.weight > 0 && <span>{item.weight}g</span>}
        </div>
        {item.description && <p className="item-card-desc">{item.description}</p>}
        <div className="item-card-footer">
          <div className="item-card-price">
            <span className="price">${item.price.toFixed(2)}</span>
            {item.quantity > 1 && <span className="qty">×{item.quantity}</span>}
          </div>
          <div className="item-card-actions">
            <button className="btn-icon" onClick={() => onEdit(item)} title="Edit">✏️</button>
            <button className="btn-icon" onClick={() => onDelete(item.id)} title="Delete">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  )
}
