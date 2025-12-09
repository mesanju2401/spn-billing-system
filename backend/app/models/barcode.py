from sqlalchemy import String, Integer, ForeignKey, LargeBinary
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Barcode(Base):
    __tablename__ = "barcodes"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True)
    barcode_value: Mapped[str] = mapped_column(String(15), unique=True, nullable=False)
    barcode_format: Mapped[str] = mapped_column(String(20), default="Code128")
    barcode_image: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)  # Store image bytes
    
    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="barcode")