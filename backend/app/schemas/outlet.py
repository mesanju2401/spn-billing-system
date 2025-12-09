from pydantic import BaseModel, Field, EmailStr, ConfigDict


class OutletBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    location: str | None = None
    phone: str | None = Field(None, max_length=20)
    email: EmailStr | None = None
    manager_name: str | None = Field(None, max_length=255)
    is_active: bool = True


class OutletCreate(OutletBase):
    pass


class OutletUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    location: str | None = None
    phone: str | None = Field(None, max_length=20)
    email: EmailStr | None = None
    manager_name: str | None = None
    is_active: bool | None = None


class OutletResponse(OutletBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int


class OutletWithStock(OutletResponse):
    total_products: int = 0
    total_quantity: int = 0
    low_stock_count: int = 0