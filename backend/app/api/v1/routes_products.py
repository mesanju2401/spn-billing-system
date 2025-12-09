from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.product import Product
from app.models.barcode import Barcode
from app.schemas.product import ProductCreate, ProductResponse, ProductWithBarcode
from io import BytesIO
import barcode
from barcode.writer import ImageWriter

router = APIRouter(prefix="/products", tags=["Products"])


def generate_product_id(cost_price: float, db: Session) -> str:
    """Generate SPN Product ID based on cost price and sequence"""
    cost_padded = f"{int(cost_price):04d}"
    
    # Count existing products with same cost price
    count = db.query(func.count(Product.id)).filter(
        Product.cost_price == cost_price
    ).scalar() or 0
    
    count += 1  # For the new product
    
    # Determine sequence format
    if 1 <= count <= 9:
        sequence = f"990{count}"
    elif 10 <= count <= 99:
        sequence = f"90{count:02d}"
    elif 100 <= count <= 999:
        sequence = f"0{count:03d}"
    else:
        sequence = f"{count:04d}"
    
    return f"SPN{cost_padded}{sequence}"


def generate_barcode_image(barcode_value: str) -> bytes:
    """Generate Code128 barcode image as bytes"""
    CODE128 = barcode.get_barcode_class('code128')
    buffer = BytesIO()
    
    code128 = CODE128(barcode_value, writer=ImageWriter())
    code128.write(buffer)
    
    buffer.seek(0)
    return buffer.read()


@router.post("/", response_model=ProductWithBarcode, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product with auto-generated Product ID and barcode"""
    
    # Generate Product ID
    product_id = generate_product_id(product.cost_price, db)
    
    # Create product
    db_product = Product(
        product_id=product_id,
        name=product.name,
        category=product.category,
        cost_price=product.cost_price,
        mrp=product.mrp,
        selling_price=product.selling_price,
        min_stock=product.min_stock
    )
    
    db.add(db_product)
    db.flush()  # Get the product.id
    
    # Generate barcode
    barcode_image = generate_barcode_image(product_id)
    
    db_barcode = Barcode(
        product_id=db_product.id,
        barcode_value=product_id,
        barcode_format="Code128",
        barcode_image=barcode_image
    )
    
    db.add(db_barcode)
    db.commit()
    db.refresh(db_product)
    
    return ProductWithBarcode(
        **db_product.__dict__,
        barcode_value=product_id
    )


@router.get("/", response_model=list[ProductResponse])
def list_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all products"""
    products = db.query(Product).offset(skip).limit(limit).all()
    return products


@router.get("/{product_id}", response_model=ProductWithBarcode)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get product by SPN Product ID"""
    product = db.query(Product).filter(Product.product_id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found"
        )
    
    barcode_value = product.barcode.barcode_value if product.barcode else None
    
    return ProductWithBarcode(
        **product.__dict__,
        barcode_value=barcode_value
    )