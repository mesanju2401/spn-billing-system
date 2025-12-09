from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import date
from typing import Literal


class OfferBase(BaseModel):
    offer_type: Literal["BUY_X_GET_Y", "PERCENTAGE", "FLAT"]
    x_quantity: int | None = None
    y_quantity: int | None = None
    discount_percent: float | None = Field(None, ge=0, le=100)
    discount_flat: float | None = Field(None, ge=0)
    start_date: date
    end_date: date
    is_active: bool = True
    
    @field_validator('end_date')
    @classmethod
    def validate_dates(cls, v, info):
        if 'start_date' in info.data and v < info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class OfferCreate(OfferBase):
    product_id: int


class OfferResponse(OfferBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    product_id: int