from sqlalchemy import String, Integer, Numeric, Date, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from enum import Enum
from app.db.base import Base


class OfferType(str, Enum):
    BUY_X_GET_Y = "BUY_X_GET_Y"
    PERCENTAGE = "PERCENTAGE"
    FLAT = "FLAT"


class Offer(Base):
    __tablename__ = "offers"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id", ondelete="CASCADE"))
    offer_type: Mapped[OfferType] = mapped_column(SQLEnum(OfferType), nullable=False)
    
    # For BUY_X_GET_Y
    x_quantity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    y_quantity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # For PERCENTAGE
    discount_percent: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    
    # For FLAT
    discount_flat: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="offers")