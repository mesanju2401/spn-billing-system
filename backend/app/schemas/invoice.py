from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class InvoiceItemInput(BaseModel):
    product_id: str  # SPN Product ID
    quantity: int = Field(..., gt=0)


class InvoiceItemDetail(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    discount: float
    line_total: float
    offer_applied: str | None = None


class InvoicePreview(BaseModel):
    items: list[InvoiceItemDetail]
    subtotal: float
    total_discount: float
    final_total: float


class InvoiceConfirmRequest(BaseModel):
    items: list[InvoiceItemInput]
    outlet_id: int | None = None
    notes: str | None = None


class InvoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    invoice_number: str
    total_amount: float
    discount_amount: float
    final_amount: float
    created_at: datetime
    items: list[InvoiceItemDetail]