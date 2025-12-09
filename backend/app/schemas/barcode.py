from pydantic import BaseModel, ConfigDict


class BarcodeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    product_id: int
    barcode_value: str
    barcode_format: str