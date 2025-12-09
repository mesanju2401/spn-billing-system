from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Stock(Base):
    __tablename__ = "stock"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id", ondelete="CASCADE"))
    outlet_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("outlets.id", ondelete="SET NULL"), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="stock_records")
    outlet: Mapped["Outlet"] = relationship("Outlet", back_populates="stock_records")