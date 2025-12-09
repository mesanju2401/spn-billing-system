from sqlalchemy import String, Numeric, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.base import Base


class Product(Base):
    __tablename__ = "products"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[str] = mapped_column(String(15), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=True)
    cost_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    mrp: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    selling_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    min_stock: Mapped[int] = mapped_column(Integer, default=10)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    barcode: Mapped["Barcode"] = relationship("Barcode", back_populates="product", uselist=False, cascade="all, delete-orphan")
    offers: Mapped[list["Offer"]] = relationship("Offer", back_populates="product", cascade="all, delete-orphan")
    stock_records: Mapped[list["Stock"]] = relationship("Stock", back_populates="product", cascade="all, delete-orphan")
    invoice_items: Mapped[list["InvoiceItem"]] = relationship("InvoiceItem", back_populates="product")