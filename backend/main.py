import os
import uuid
import shutil
from datetime import datetime

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from pydantic import BaseModel

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/jewelry.db")

os.makedirs("./data", exist_ok=True)
os.makedirs("./data/uploads", exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class JewelryItem(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, default="")
    name = Column(String, nullable=False)
    category = Column(String, nullable=False, default="Other")
    material = Column(String, default="")
    gemstone = Column(String, default="")
    karat = Column(String, default="")
    weight = Column(Float, default=0)
    price = Column(Float, default=0)
    quantity = Column(Integer, default=1)
    image_url = Column(String, default="")
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(engine)

# Add sku column to existing table if missing (SQLite doesn't auto-migrate)
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE items ADD COLUMN sku VARCHAR DEFAULT ''"))
        conn.commit()
except Exception:
    pass  # Column already exists


def backfill_skus():
    db = SessionLocal()
    try:
        items = db.query(JewelryItem).filter(
            (JewelryItem.sku.is_(None)) | (JewelryItem.sku == "")
        ).all()
        for item in items:
            item.sku = f"JEW-{item.id:04d}"
        db.commit()
    finally:
        db.close()


def seed_if_empty():
    db = SessionLocal()
    try:
        if db.query(JewelryItem).count() == 0:
            samples = [
                JewelryItem(
                    name="Gold Diamond Ring", category="Ring", material="Gold",
                    karat="18k", gemstone="Diamond", weight=5.2, price=2500,
                    quantity=1, description="Classic solitaire engagement ring",
                ),
                JewelryItem(
                    name="Silver Chain Necklace", category="Necklace", material="Silver",
                    karat="925", weight=12.0, price=150, quantity=3,
                    description="Elegant silver chain necklace",
                ),
                JewelryItem(
                    name="Pearl Stud Earrings", category="Earring", material="Gold",
                    karat="14k", gemstone="Pearl", weight=2.1, price=450,
                    quantity=2, description="Gold-plated pearl stud earrings",
                ),
                JewelryItem(
                    name="Tennis Bracelet", category="Bracelet", material="White Gold",
                    karat="18k", gemstone="Diamond", weight=18.5, price=3200,
                    quantity=1, description="Full diamond tennis bracelet",
                ),
            ]
            db.add_all(samples)
            db.commit()
    finally:
        db.close()


seed_if_empty()
backfill_skus()


class ItemBase(BaseModel):
    name: str
    category: str = "Other"
    material: str = ""
    gemstone: str = ""
    karat: str = ""
    weight: float = 0
    price: float = 0
    quantity: int = 1
    image_url: str = ""
    description: str = ""


class ItemCreate(ItemBase):
    pass


class ItemUpdate(ItemBase):
    pass


class Item(ItemBase):
    id: int
    sku: str
    created_at: datetime

    class Config:
        from_attributes = True


app = FastAPI(title="Jewelry Inventory API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/api/uploads", StaticFiles(directory="./data/uploads"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/items")
def list_items(search: str = "", category: str = "", db: Session = Depends(get_db)):
    query = db.query(JewelryItem)
    if search:
        query = query.filter(JewelryItem.name.ilike(f"%{search}%"))
    if category and category != "All":
        query = query.filter(JewelryItem.category == category)
    return query.order_by(JewelryItem.created_at.desc()).all()


@app.post("/api/items")
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    db_item = JewelryItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    db_item.sku = f"JEW-{db_item.id:04d}"
    db.commit()
    db.refresh(db_item)
    return db_item


@app.put("/api/items/{item_id}")
def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(JewelryItem).filter(JewelryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    for key, value in item.model_dump().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item


@app.delete("/api/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(JewelryItem).filter(JewelryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"ok": True}


@app.post("/api/upload")
def upload_image(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
        raise HTTPException(status_code=400, detail="Unsupported file type")
    filename = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join("./data/uploads", filename), "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"url": f"/api/uploads/{filename}"}


@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    items = db.query(JewelryItem).all()
    total_items = sum(i.quantity for i in items)
    total_value = sum(i.price * i.quantity for i in items)
    by_category: dict[str, int] = {}
    for item in items:
        by_category[item.category] = by_category.get(item.category, 0) + item.quantity
    return {
        "total_items": total_items,
        "total_value": total_value,
        "total_unique": len(items),
        "by_category": by_category,
    }
