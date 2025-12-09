from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str | None = None
    cost_price: float = Field(..., gt=0)
    mrp: float = Field(..., gt=0)
    selling_price: float = Field(..., gt=0)
    min_stock: int = Field(default=10, ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    mrp: float | None = Field(None, gt=0)
    selling_price: float | None = Field(None, gt=0)
    min_stock: int | None = Field(None, ge=0)


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    product_id: str
    created_at: datetime


class ProductWithBarcode(ProductResponse):
    barcode_value: str | None = None