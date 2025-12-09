from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from app.db.session import get_db
from app.models.product import Product
from app.models.offer import Offer
from app.schemas.offer import OfferCreate, OfferResponse

router = APIRouter(prefix="/offers", tags=["Offers"])


@router.post("/", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
def create_offer(offer: OfferCreate, db: Session = Depends(get_db)):
    """Create or update offer for a product"""
    
    # Verify product exists
    product = db.query(Product).filter(Product.id == offer.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product ID {offer.product_id} not found"
        )
    
    # Validate offer data
    if offer.offer_type == "BUY_X_GET_Y":
        if not offer.x_quantity or not offer.y_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="x_quantity and y_quantity required for BUY_X_GET_Y"
            )
    elif offer.offer_type == "PERCENTAGE":
        if not offer.discount_percent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="discount_percent required for PERCENTAGE offer"
            )
    elif offer.offer_type == "FLAT":
        if not offer.discount_flat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="discount_flat required for FLAT offer"
            )
    
    db_offer = Offer(**offer.model_dump())
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    
    return db_offer


@router.get("/{product_id}", response_model=OfferResponse | None)
def get_active_offer(product_id: str, db: Session = Depends(get_db)):
    """Get active offer for a product by Product ID (SPN code)"""
    
    # Get product
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found"
        )
    
    # Get active offer
    today = date.today()
    offer = db.query(Offer).filter(
        Offer.product_id == product.id,
        Offer.is_active == True,
        Offer.start_date <= today,
        Offer.end_date >= today
    ).first()
    
    return offer