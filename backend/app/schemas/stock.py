from pydantic import BaseModel, Field, ConfigDict


class OutletBase(BaseModel):
    name: str
    location: str | None = None


class OutletCreate(OutletBase):
    pass


class OutletResponse(OutletBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int


class StockBase(BaseModel):
    product_id: int
    outlet_id: int | None = None
    quantity: int = Field(..., ge=0)


class StockCreate(StockBase):
    pass


class StockUpdate(BaseModel):
    quantity: int = Field(..., ge=0)


class StockResponse(StockBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int


class LowStockResponse(BaseModel):
    product_id: str
    product_name: str
    current_quantity: int
    min_stock: int
    outlet_name: str | None = None